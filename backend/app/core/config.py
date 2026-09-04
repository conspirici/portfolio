from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Portfolio API"
    environment: str = "development"
    # Provide a default valid asyncpg URL for local/testing
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/portfolio"
    sentry_dsn: str | None = None
    allowed_origins: list[str] = ["*"]
    frontend_url: str = "http://localhost:3000"
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
