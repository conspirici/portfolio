# Use a slim, official Python 3.11 image as the base
FROM python:3.11-slim

# Set environment variables
# PYTHONDONTWRITEBYTECODE=1 prevents Python from writing .pyc files to disk
# PYTHONUNBUFFERED=1 ensures Python output is logged straight to the terminal without buffering
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies required for asyncpg or building certain Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file and install dependencies FIRST.
# We do this before copying the app code to leverage Docker layer caching.
# If requirements.txt doesn't change, Docker skips this step on future builds!
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the actual application code
COPY app/ ./app/
COPY migrations/ ./migrations/
COPY alembic.ini .

# Create a non-root user to run the application for security.
# Running as root inside a container is a security risk.
RUN adduser --disabled-password --no-create-home appuser
USER appuser

# Expose the port FastAPI will run on
EXPOSE 8000

# The command to run when the container starts
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
