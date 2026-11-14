#!/usr/bin/env bash
#
# Backend deploy. Runs ON THE SERVER, from the repository root (/srv/portfolio).
# .github/workflows/deploy-backend.yml checks out the commit to deploy and then
# runs:  bash scripts/deploy-backend.sh <commit-sha>
#
# Why this is a file and not commands piped into `ssh ... bash`:
# `docker compose run` reads standard input. When these steps were sent to the
# server on stdin, the migration step swallowed the rest of the script, bash
# hit end-of-input and exited 0, and the workflow reported success without ever
# recreating the container. Running from a file removes that failure mode, and
# every docker command here also gets </dev/null so it cannot come back.
#
# Order: backup -> build -> migrate -> preflight -> replace -> verify.
# The live container is not touched until the new image has answered
# /api/health and a database-backed request in a throwaway container.
#
# Never add `set -x` here: it would print the database URL into the CI log.

set -Eeuo pipefail

EXPECTED_SHA="${1:-}"

SERVICE="api"
ENV_FILE="backend/.env"
APP_PORT=8000            # host port Caddy proxies to (see docker-compose.yml)
CONTAINER_PORT=8000      # port uvicorn listens on inside the container
PREFLIGHT_PORT=18000     # loopback only, in use for a few seconds per deploy
PREFLIGHT_NAME="portfolio-api-preflight"
HEALTH_PATH="/api/health"
DB_CHECK_PATH="/api/public/site-settings"
STARTUP_TIMEOUT=90       # seconds to wait for a container to answer /api/health

# ── Helpers ──────────────────────────────────────────────────────────────────

CURRENT_STEP="startup"

step() {
  CURRENT_STEP="$1"
  printf '\n==> %s\n' "$1"
}

# `::error::` makes GitHub Actions show the line as an annotation on the run.
fail() {
  printf '::error::Deploy failed during "%s": %s\n' "$CURRENT_STEP" "$1"
  exit 1
}

on_error() {
  printf '::error::Deploy failed during "%s" (exit code %s, line %s of deploy-backend.sh)\n' \
    "$CURRENT_STEP" "$1" "$2"
}
trap 'on_error "$?" "$LINENO"' ERR

cleanup() {
  docker rm -f "$PREFLIGHT_NAME" >/dev/null 2>&1 </dev/null || true
}
trap cleanup EXIT

dc() {
  docker compose "$@" </dev/null
}

# Reads one KEY=value from backend/.env. The value is returned, never printed.
env_value() {
  grep -m 1 "^$1=" "$ENV_FILE" | cut -d '=' -f 2- | tr -d '"' | tr -d "'" | tr -d '\r'
}

# True when the response is HTTP 2xx and the body says {"status": "ok"}.
health_body_ok() {
  grep -q '"status"[[:space:]]*:[[:space:]]*"ok"'
}

# Probe /api/health through a host port.
probe_host() {
  curl --fail --silent --max-time 10 "http://127.0.0.1:$1${HEALTH_PATH}" 2>/dev/null | health_body_ok
}

# Probe /api/health from inside one specific container, so the answer can only
# come from that container and not from whatever else owns the host port.
probe_inside() {
  docker exec "$1" curl --fail --silent --max-time 10 \
    "http://localhost:${CONTAINER_PORT}${HEALTH_PATH}" 2>/dev/null </dev/null | health_body_ok
}

# wait_for_health <container> <probe command...>
# Returns 0 once the probe passes, 1 on timeout, 2 if the container stops running.
wait_for_health() {
  local container="$1" state deadline
  shift
  deadline=$((SECONDS + STARTUP_TIMEOUT))
  while :; do
    state="$(docker inspect --format '{{.State.Status}}' "$container" 2>/dev/null </dev/null || echo missing)"
    if [ "$state" != "running" ]; then
      echo "Container state is \"$state\", expected \"running\"."
      return 2
    fi
    if "$@"; then
      return 0
    fi
    if [ "$SECONDS" -ge "$deadline" ]; then
      echo "No healthy answer from ${HEALTH_PATH} after ${STARTUP_TIMEOUT}s."
      return 1
    fi
    sleep 3
  done
}

show_live_diagnostics() {
  echo "--- docker compose ps -a"
  dc ps -a || true
  echo "--- last 50 log lines of the ${SERVICE} service"
  dc logs --tail=50 "$SERVICE" || true
}

# ── 1. Check the checkout ────────────────────────────────────────────────────

step "Check the checkout"
[ -f docker-compose.yml ] || fail "docker-compose.yml not found; run this from the repository root."
[ -f "$ENV_FILE" ] || fail "$ENV_FILE is missing on the server."

HEAD_SHA="$(git rev-parse HEAD)"
if [ -n "$EXPECTED_SHA" ] && [ "$HEAD_SHA" != "$EXPECTED_SHA" ]; then
  fail "the server checkout is at $HEAD_SHA but the workflow asked for $EXPECTED_SHA."
fi
echo "Deploying commit $HEAD_SHA"

RAW_DATABASE_URL="$(env_value DATABASE_URL || true)"
[ -n "$RAW_DATABASE_URL" ] || fail "DATABASE_URL is not set in $ENV_FILE."

# ── 2. Database backup (best-effort, as before) ──────────────────────────────

step "Database backup"
mkdir -p backups
# pg_dump does not understand the "+asyncpg" driver prefix or asyncpg's query string.
BACKUP_URL="$(printf '%s' "$RAW_DATABASE_URL" | sed 's/+asyncpg//' | sed 's/\?.*//')"
BACKUP_NAME="backup_$(date +%s).sql"
# The URL goes in through the environment (-e NAME with no value), not on the
# command line. The dump is written to one fixed in-progress file and renamed
# only when pg_dump succeeds, so a failed dump never leaves something that
# looks like a usable backup (the next run simply overwrites that file).
if DATABASE_URL="$BACKUP_URL" docker run --rm -e PGSSLMODE=require -e DATABASE_URL \
     -v "$(pwd)/backups:/backups" postgres:17-alpine \
     sh -c 'pg_dump "$DATABASE_URL" > /backups/.backup_in_progress.sql && mv /backups/.backup_in_progress.sql "/backups/$1"' \
     sh "$BACKUP_NAME" </dev/null; then
  echo "Backup saved: backups/$BACKUP_NAME"
else
  echo "::warning::Database backup failed (often a pg_dump version mismatch). Continuing without a fresh backup."
fi

# ── 3. Build ─────────────────────────────────────────────────────────────────

step "Build the API image"
IMAGE_NAME="$(dc config --images "$SERVICE" | head -n 1)"
[ -n "$IMAGE_NAME" ] || fail "could not work out the image name of the ${SERVICE} service."
ROLLBACK_IMAGE="${IMAGE_NAME%%:*}:rollback"

# Keep the image that is live right now under a fixed tag, for a manual
# rollback. This has to happen before the build: once the build moves the
# service's tag, Docker may drop the old image even though a container still
# runs it. Best-effort: a failure here must not stop a deploy.
ROLLBACK_READY=0
LIVE_CID="$(dc ps -q "$SERVICE" | head -n 1 || true)"
if [ -n "$LIVE_CID" ]; then
  LIVE_IMAGE_ID="$(docker inspect --format '{{.Image}}' "$LIVE_CID" </dev/null)"
  if docker tag "$LIVE_IMAGE_ID" "$ROLLBACK_IMAGE" >/dev/null 2>&1 </dev/null; then
    ROLLBACK_READY=1
    echo "Image that is live now kept as $ROLLBACK_IMAGE"
  else
    echo "Note: the image that is live now is no longer in the image store, so no rollback tag was set."
  fi
fi

dc build "$SERVICE"
IMAGE_ID="$(docker image inspect --format '{{.Id}}' "$IMAGE_NAME" </dev/null)"
echo "Built image $IMAGE_NAME ($IMAGE_ID)"

# ── 4. Migrations ────────────────────────────────────────────────────────────

step "Database migrations"
# Migrations (DDL) fail over PgBouncer transaction pools (like Neon's -pooler URL).
# Strip '-pooler' to force a direct connection to the database, for migrations only.
DIRECT_URL="$(printf '%s' "$RAW_DATABASE_URL" | sed 's/-pooler//')"
DATABASE_URL="$DIRECT_URL" docker compose run --rm -T -e DATABASE_URL "$SERVICE" \
  alembic upgrade head </dev/null

# ── 5. Preflight: prove the new image works before touching the live one ─────

step "Preflight: start the new image beside the live container"
docker rm -f "$PREFLIGHT_NAME" >/dev/null 2>&1 </dev/null || true
dc run -d --no-deps --name "$PREFLIGHT_NAME" \
  -p "127.0.0.1:${PREFLIGHT_PORT}:${CONTAINER_PORT}" "$SERVICE" >/dev/null

preflight_failed() {
  echo "--- last 50 log lines of the preflight container"
  docker logs --tail=50 "$PREFLIGHT_NAME" </dev/null 2>&1 || true
  fail "$1 The live container was not touched."
}

PREFLIGHT_IMAGE_ID="$(docker inspect --format '{{.Image}}' "$PREFLIGHT_NAME" </dev/null)"
[ "$PREFLIGHT_IMAGE_ID" = "$IMAGE_ID" ] \
  || preflight_failed "the preflight container runs $PREFLIGHT_IMAGE_ID, not the image that was just built."

wait_for_health "$PREFLIGHT_NAME" probe_host "$PREFLIGHT_PORT" \
  || preflight_failed "the new image did not answer ${HEALTH_PATH}."
echo "New image answers ${HEALTH_PATH}."

curl --fail --silent --show-error --max-time 30 \
  "http://127.0.0.1:${PREFLIGHT_PORT}${DB_CHECK_PATH}" >/dev/null \
  || preflight_failed "the new image could not serve ${DB_CHECK_PATH} (database-backed check)."
echo "New image serves ${DB_CHECK_PATH} from the database."

docker rm -f "$PREFLIGHT_NAME" >/dev/null </dev/null

# ── 6. Replace the live container ────────────────────────────────────────────

step "Replace the live container"
OLD_CID="$(dc ps -q "$SERVICE" | head -n 1 || true)"
if [ -n "$OLD_CID" ]; then
  echo "Current container: ${OLD_CID:0:12}"
else
  echo "No ${SERVICE} container is running yet."
fi

# --force-recreate: a new container every time, whatever compose thinks changed.
dc up -d --no-deps --force-recreate "$SERVICE"

live_failed() {
  show_live_diagnostics
  if [ "$ROLLBACK_READY" -eq 1 ]; then
    echo "To roll back by hand:  docker tag $ROLLBACK_IMAGE $IMAGE_NAME && docker compose up -d --no-deps --force-recreate $SERVICE"
  fi
  fail "$1"
}

NEW_CID="$(dc ps -q "$SERVICE" | head -n 1 || true)"
[ -n "$NEW_CID" ] || live_failed "no ${SERVICE} container is running after docker compose up."
[ "$NEW_CID" != "$OLD_CID" ] || live_failed "the container was not recreated; ${OLD_CID:0:12} is still the one running."

RUNNING_IMAGE_ID="$(docker inspect --format '{{.Image}}' "$NEW_CID" </dev/null)"
[ "$RUNNING_IMAGE_ID" = "$IMAGE_ID" ] \
  || live_failed "the running container uses image $RUNNING_IMAGE_ID, not the image built from this commit ($IMAGE_ID)."
echo "New container: ${NEW_CID:0:12} (image ${RUNNING_IMAGE_ID})"

# ── 7. Verify the container that is actually running ─────────────────────────

step "Verify the running container"
wait_for_health "$NEW_CID" probe_inside "$NEW_CID" \
  || live_failed "the new container did not answer ${HEALTH_PATH}."
echo "Container ${NEW_CID:0:12} answers ${HEALTH_PATH}."

probe_host "$APP_PORT" \
  || live_failed "${HEALTH_PATH} is not reachable on 127.0.0.1:${APP_PORT}, the address Caddy proxies to."
echo "127.0.0.1:${APP_PORT}${HEALTH_PATH} answers (this is what Caddy proxies to)."

curl --fail --silent --show-error --max-time 30 \
  "http://127.0.0.1:${APP_PORT}${DB_CHECK_PATH}" >/dev/null \
  || live_failed "${DB_CHECK_PATH} failed on 127.0.0.1:${APP_PORT} (database-backed check)."
echo "127.0.0.1:${APP_PORT}${DB_CHECK_PATH} answers (database-backed check)."

# The container must still be the same one, still running, and not crash-looping.
FINAL_STATE="$(docker inspect --format '{{.State.Status}} {{.RestartCount}}' "$NEW_CID" </dev/null)"
[ "$FINAL_STATE" = "running 0" ] \
  || live_failed "the new container is not stable (state and restart count: $FINAL_STATE)."

CONTAINER_SUMMARY="$(docker inspect --format '{{.Name}} created {{.Created}}' "$NEW_CID" </dev/null)"

step "Done"
echo "Deployed commit:   $HEAD_SHA"
echo "Running image:     $RUNNING_IMAGE_ID"
echo "Running container: ${NEW_CID:0:12} ${CONTAINER_SUMMARY}"
# The workflow looks for this exact line. Keep it last, and print it only here.
echo "DEPLOY_OK $HEAD_SHA"
