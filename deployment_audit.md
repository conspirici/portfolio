# Technical Deployment Audit: Portfolio Backend

**Target Infrastructure**: Oracle VM.Standard.E2.1.Micro (1 OCPU, ~954 MiB RAM, x86_64, Ubuntu 24.04, 2 GB swap).
**Target Architecture**: Vercel frontend → Cloudflare → Caddy (Oracle VM) → FastAPI Docker container → External Services.

---

### 1. Directory and File Structure
The minimal structure required on the server for deployment:
```
/srv/portfolio/
├── docker-compose.yml
└── backend/
    ├── .env                # (Must be manually created on server)
    ├── Dockerfile
    ├── requirements.txt
    ├── alembic.ini
    ├── app/                # Application source code
    └── migrations/         # Alembic database migrations
```

### 2. Dockerfile Behavior
- **Base**: `python:3.11-slim` (Official Debian-based minimal image).
- **Setup**: Installs `build-essential` and `curl`, cleans up apt cache.
- **Dependency Caching**: Copies `requirements.txt` and runs `pip install --no-cache-dir` before copying the rest of the codebase to leverage Docker layer caching.
- **Execution**: Copies source code, creates a non-root user (`appuser`), exposes port `8000`, and sets the default CMD.

### 3. Dependency List (`requirements.txt`)
Dependencies are currently **unpinned**.
```text
fastapi
uvicorn
sqlalchemy[asyncio]
asyncpg
alembic
pydantic
pydantic-settings
structlog
sentry-sdk[fastapi]
firebase-admin
groq
aioboto3
python-multipart
```

### 4. Docker Compose Configuration
The `docker-compose.yml` defines a single service (`api`):
- **Build Context**: `./backend`
- **Environment**: Mounts `./backend/.env` directly via `env_file`.
- **Ports**: Maps `8000:8000` to the host.
- **Restart Policy**: `unless-stopped`.
- **Healthcheck**: Defined natively in Compose (executes curl every 30s).

### 5. Uvicorn Startup & Workers
- **Command**: `CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`
- **Workers**: **1 worker**. Since `--workers` is omitted, it defaults to 1. This is the optimal configuration for a 1 GB RAM server.

### 6. Background Tasks & Processes
- **Zero Schedulers/Daemons**: The application does not spawn any persistent background threads, celery workers, or scheduled crons. It operates strictly on a request/response cycle.

### 7. Database Connection Behavior
- **Driver**: `asyncpg` (Asynchronous Postgres driver).
- **Configuration** (`app/db/database.py`):
  - `pool_pre_ping=True`: Ensures stale connections are dropped before usage.
  - `pool_recycle=300`: Recycles connections every 5 minutes to prevent Neon DB from silently dropping them.
  - **Pool Size**: Omitted, meaning it relies on SQLAlchemy defaults (`pool_size=5`, `max_overflow=10`). This allows up to 15 concurrent connections to Neon per worker.

### 8. External Service Initialization
- **Sentry**: Initializes synchronously at startup in `app/main.py` (if `SENTRY_DSN` is present).
- **Firebase Admin**: Initializes synchronously at startup when `app/core/security.py` is imported.
- **Groq & Cloudflare R2**: Instantiated dynamically per-request. No persistent TCP connections are held at startup.

### 9. Docker Volumes
- **None**. The container is 100% stateless. File uploads are streamed to R2. Migrations read from the container filesystem. No local volume mounts are required (other than passing the `.env` file).

### 10. Required Environment Variables
Must be populated in `/srv/portfolio/backend/.env` on the server:
- `ENVIRONMENT` (Set to "production")
- `ALLOWED_ORIGINS` (e.g., `["https://mansoor-syed.netlify.app", "https://your-custom-domain.com"]`)
- `DATABASE_URL` (Neon asyncpg URL)
- `ADMIN_EMAIL`
- `GOOGLE_CREDENTIALS_JSON` (Firebase Service Account JSON string)
- `GROQ_API_KEY`
- `SENTRY_DSN`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

### 11. Architecture Compatibility (x86_64)
- **100% Compatible**. `python:3.11-slim` provides a native `linux/amd64` image. All pip dependencies (including compiled ones like `asyncpg`) have pre-built wheels for x86_64 Ubuntu.

### 12. Non-Root Security
- **Safe**. The Dockerfile runs `adduser --disabled-password --no-create-home appuser` and drops privileges via `USER appuser` prior to runtime.

### 13 & 14. Health Checks
- **Docker Healthcheck**: Implemented via `curl -f http://localhost:8000/api/public/site-settings`.
- **FastAPI Endpoint**: The `/api/public/site-settings` endpoint acts as the health check. It validates the API is responsive and can successfully query the database.

### 15. Reverse Proxy Assumptions
- The application currently lacks reverse-proxy awareness. Because it sits behind Cloudflare -> Caddy, the client IP address will appear as Caddy's internal Docker IP (or localhost). 

### 16. RAM Usage Estimates (1 OCPU / ~954 MiB RAM)
- **Ubuntu 24.04 OS + SSH + systemd**: ~200 - 250 MiB
- **Docker Engine + Containerd**: ~60 - 80 MiB
- **Caddy Server**: ~20 - 40 MiB
- **FastAPI + Uvicorn (1 worker)**: ~120 MiB at idle. 
- **Peak RAM (Image uploads / JSON serialization)**: ~180 - 220 MiB
- **Total Expected Peak Usage**: ~550 MiB.
- **Result**: You will have a very comfortable ~400 MiB of headroom. Swap (2 GB) ensures you won't experience Out-Of-Memory (OOM) crashes during apt upgrades.

---

### 17. Recommended Adjustments Before Deployment

While the architecture is highly constrained and well-suited for this VM, I recommend three minor modifications to the codebase before deploying:

1. **Pin Requirements**: `requirements.txt` relies on unpinned versions. A future update to `fastapi` or `python-multipart` could break the deployment. We should pin these to their currently known-working versions.
2. **Uvicorn Proxy Headers**: We should update the Dockerfile CMD to: 
   `CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]` 
   This ensures FastAPI logs the real user IP address instead of Caddy's IP.
3. **Explicit Connection Pooling**: While SQLAlchemy defaults are fine, explicitly defining `pool_size=3` and `max_overflow=5` in `database.py` prevents aggressive connection spikes to Neon DB (which has strict connection limits on free tiers).
