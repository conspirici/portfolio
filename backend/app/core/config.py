from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Portfolio API"
    environment: str = "development"
    # Provide a default valid asyncpg URL for local/testing
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/portfolio"
    sentry_dsn: str | None = None
    allowed_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"]
    # Where the Next.js site is reachable from this server, and the shared
    # secret for its /api/revalidate route (must match the frontend's
    # REVALIDATION_SECRET). Without the secret, on-demand revalidation is skipped.
    frontend_url: str = "http://localhost:3000"
    revalidation_secret: str | None = None
    admin_email: str = ""
    
    google_application_credentials: str | None = None
    google_credentials_json: str | None = None
    groq_api_key: str | None = None
    
    r2_account_id: str | None = None
    r2_access_key_id: str | None = None
    r2_secret_access_key: str | None = None
    r2_bucket_name: str | None = None
    r2_public_url: str | None = None
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
