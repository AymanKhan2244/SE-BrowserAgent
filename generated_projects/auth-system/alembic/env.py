import os
import sys
import logging
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# ----------------------------------------------------------------------
# Ensure the project root is on the Python path so that imports work.
# ----------------------------------------------------------------------
CURRENT_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

# ----------------------------------------------------------------------
# Alembic Config object, which provides access to the values within the
# .ini file in use.
# ----------------------------------------------------------------------
config = context.config

# ----------------------------------------------------------------------
# Interpret the config file for Python logging.
# This line sets up loggers basically.
# ----------------------------------------------------------------------
if config.config_file_name is not None:
    fileConfig(config.config_file_name)
logger = logging.getLogger("alembic.env")

# ----------------------------------------------------------------------
# Import the SQLModel metadata object for 'autogenerate' support.
# ----------------------------------------------------------------------
try:
    from backend.models import SQLModel  # type: ignore
except Exception as exc:
    logger.error("Failed to import SQLModel metadata: %s", exc)
    raise

target_metadata = SQLModel.metadata

# ----------------------------------------------------------------------
# Set the database URL. Prefer the environment variable, fall back to a
# local SQLite database for safety during development.
# ----------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
config.set_main_option("sqlalchemy.url", DATABASE_URL)


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    In this mode, Alembic does not need a DBAPI connection. It instead
    configures the context with just a URL and emits SQL scripts to the
    output.
    """
    url = config.get_main_option("sqlalchemy.url")
    if not url:
        raise RuntimeError("Database URL is not configured for offline migrations.")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.

    In this mode, Alembic creates an Engine and a connection
    and then runs the migrations against the live database.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# ----------------------------------------------------------------------
# Determine whether to run in 'offline' or 'online' mode and invoke the
# appropriate function.
# ----------------------------------------------------------------------
if context.is_offline_mode():
    logger.info("Running Alembic migrations in OFFLINE mode.")
    run_migrations_offline()
else:
    logger.info("Running Alembic migrations in ONLINE mode.")
    run_migrations_online()