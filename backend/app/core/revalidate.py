"""On-demand cache revalidation for the Next.js frontend.

Public pages are statically cached by Next.js. After a CMS write we POST the
affected cache tags to the frontend's /api/revalidate route so the change shows
up immediately instead of waiting for the time-based refresh.
"""
import json
import urllib.request

import structlog
from fastapi import BackgroundTasks, Request

from app.core.config import settings

logger = structlog.get_logger()

ADMIN_PREFIX = "/api/admin/"

# First path segment under /api/admin/ -> frontend cache tags it affects.
# Projects and posts are embedded in the home page, and tag renames show up
# everywhere tags are rendered.
TAGS_BY_RESOURCE: dict[str, tuple[str, ...]] = {
    "projects": ("projects", "home-content"),
    "posts": ("posts", "home-content"),
    "field-notes": ("field-notes",),
    "tags": ("projects", "posts", "field-notes", "home-content"),
    "home-content": ("home-content",),
    "about-content": ("about-content",),
}


def tags_for_path(path: str) -> tuple[str, ...]:
    if not path.startswith(ADMIN_PREFIX):
        return ()
    resource = path[len(ADMIN_PREFIX):].split("/", 1)[0]
    return TAGS_BY_RESOURCE.get(resource, ())


def trigger_revalidate(*tags: str) -> None:
    """POST the given cache tags to the frontend. Never raises."""
    if not tags:
        return
    if not settings.revalidation_secret:
        logger.warning("revalidate_skipped", reason="REVALIDATION_SECRET not set", tags=tags)
        return

    url = f"{settings.frontend_url.rstrip('/')}/api/revalidate"
    request = urllib.request.Request(
        url,
        data=json.dumps({"tags": list(tags)}).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-Revalidate-Secret": settings.revalidation_secret,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=10):
            pass
        logger.info("revalidate_sent", tags=tags)
    except Exception as exc:
        logger.error("revalidate_failed", url=url, tags=tags, error=str(exc))


def schedule_revalidation(request: Request, background_tasks: BackgroundTasks) -> None:
    """Router dependency: after any admin write, refresh the affected pages.

    The task runs in a worker thread once the response has been sent, so a slow
    or unreachable frontend never delays or fails the CMS save.
    """
    if request.method not in ("POST", "PUT", "PATCH", "DELETE"):
        return
    tags = tags_for_path(request.url.path)
    if tags:
        background_tasks.add_task(trigger_revalidate, *tags)
