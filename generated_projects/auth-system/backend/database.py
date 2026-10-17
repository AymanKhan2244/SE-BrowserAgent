import os
from typing import Generator

from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy.orm import sessionmaker


def _get_database_url() -> str:
    """
    Retrieve the database URL from the environment.

    Returns
    -------
    str
        A SQLAlchemy compatible database URL.
    """
    return os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://postgres:postgres@localhost:5432/auth_db",
    )


# Engine is created once at import time; it can be reused throughout the app.
engine = create_engine(_get_database_url(), echo=False, future=True)

# Session factory used by the FastAPI dependency.
SessionLocal = sessionmaker(bind=engine, class_=Session, expire_on_commit=False)


def init_db() -> None:
    """
    Create all tables defined in the SQLModel metadata.

    This function should be called at application startup to ensure the
    database schema exists.
    """
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session.

    Yields
    ------
    Session
        An active SQLModel session.
    """
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


__all__ = ["engine", "SessionLocal", "get_session", "init_db"]