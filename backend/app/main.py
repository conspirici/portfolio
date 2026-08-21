import uuid
from contextvars import ContextVar
from fastapi import FastAPI, Request
from starlette.middleware.cors import CORSMiddleware
import sentry_sdk
import structlog
import time

from app.core.config import settings
from app.core.logging import setup_logging
from app.api import public, admin, ai

setup_logging()
logger = structlog.get_logger()

if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        traces_sample_rate=1.0,
    )

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,       # must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

correlation_id_ctx: ContextVar[str] = ContextVar("correlation_id", default="")

@app.middleware("http")
async def correlation_id_middleware(request: Request, call_next):
    corr_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    correlation_id_ctx.set(corr_id)
    structlog.contextvars.bind_contextvars(
        correlation_id=corr_id,
        method=request.method,
        path=request.url.path
    )
    
    start_time = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start_time) * 1000
    
    logger.info(
        "request_completed",
        action="api.request",
        status=response.status_code,
        duration_ms=round(duration_ms, 2)
    )
    
    response.headers["X-Correlation-ID"] = corr_id
    return response

app.include_router(public.router, prefix="/api/public")
app.include_router(admin.router, prefix="/api/admin")
app.include_router(ai.router, prefix="/api/admin/ai")
