from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """
    SQLModel representation of a user in the authentication system.

    Attributes
    ----------
    id : Optional[int]
        Primary key, auto-incremented by the database.
    email : str
        Unique email address used for login.
    hashed_password : str
        BCrypt‑hashed password.
    is_active : bool
        Indicates whether the user account is active.
    created_at : datetime
        Timestamp of when the user was created.
    """

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, nullable=False, max_length=255)
    hashed_password: str = Field(nullable=False, max_length=255)
    is_active: bool = Field(default=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)