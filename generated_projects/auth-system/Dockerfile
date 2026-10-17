FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable stdout flushing
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system dependencies (if any)
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ ./backend
COPY backend/alembic.ini .
COPY backend/migrations ./backend/migrations

# Expose the port FastAPI runs on
EXPOSE 8000

# Default environment variables (can be overridden at runtime)
ENV DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/postgres
ENV JWT_SECRET_KEY=supersecretkey
ENV JWT_ALGORITHM=HS256
ENV JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]