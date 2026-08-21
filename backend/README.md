# Portfolio Backend

This is the FastAPI backend for the portfolio. It provides the core API endpoints to serve data to the Next.js frontend, utilizing PostgreSQL (asyncpg) for storage and Structlog/Sentry for observability.

## Setup Instructions

1. **Create Virtual Environment & Install Dependencies:**
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # on Windows
   pip install -r requirements.txt
   ```

2. **Database Migrations (Alembic):**
   The project is pre-configured with Alembic for async migrations. The `migrations/env.py` file is set up to import `app.models.Base.metadata` and read the database URL from `app.core.config.settings`.
   
   To generate the initial migration:
   ```bash
   alembic revision --autogenerate -m "Initial migration"
   ```
   To apply migrations to your database:
   ```bash
   alembic upgrade head
   ```

3. **Run the Development Server:**
   ```bash
   uvicorn app.main:app --reload
   ```

## Architecture

- `app/main.py`: Application entrypoint, sets up middleware (correlation IDs, CORS) and initializes Sentry.
- `app/api/public.py`: Contains the read-only public endpoints (no auth required) matching the frontend architecture.
- `app/models.py`: SQLAlchemy (async) definitions of the entire content schema (Projects, BlogPosts, FieldNotes, Tags, ActivityLogs, etc.).
- `app/schemas.py`: Pydantic response models.
- `app/core/logging.py`: Configures `structlog` for JSON-formatted logging.
- `app/db/database.py`: Handles the async SQLAlchemy engine and session generation.

## Note on Type Checking
You can run type checks to ensure structural soundness:
```bash
npx pyright
```
