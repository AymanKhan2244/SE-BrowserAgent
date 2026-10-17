from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, validator


class UserBase(BaseModel):
    """Base attributes shared by user schemas."""

    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    email: EmailStr = Field(..., description="User email address")

    @validator("username")
    def username_alphanumeric(cls, v: str) -> str:
        if not v.isalnum():
            raise ValueError("Username must be alphanumeric")
        return v


class UserCreate(UserBase):
    """Schema for user registration payload."""

    password: str = Field(..., min_length=8, description="Plain text password")

    @validator("password")
    def password_strength(cls, v: str) -> str:
        # Basic strength check: at least one letter and one number
        if not any(c.isalpha() for c in v) or not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one letter and one number")
        return v


class UserRead(UserBase):
    """Schema returned after successful user creation or query."""

    id: int = Field(..., description="Database primary key")
    created_at: datetime = Field(..., description="Timestamp of user creation")

    class Config:
        orm_mode = True


class Token(BaseModel):
    """JWT token response."""

    access_token: str = Field(..., description="Encoded JWT")
    token_type: str = Field("bearer", description="Token type, defaults to bearer")


class TokenData(BaseModel):
    """Data stored inside JWT payload."""

    username: Optional[str] = Field(None, description="Username embedded in token")
    exp: Optional[int] = Field(
        None, description="Expiration timestamp (Unix epoch seconds)"
    )

    class Config:
        orm_mode = True