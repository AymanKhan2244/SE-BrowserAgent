import os
import secrets
from datetime import datetime, timedelta
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from pydantic import ValidationError

from .models import User
from .schemas import TokenData
from .database import get_session
from sqlmodel import Session, select

# -------------------------------------------------------------------------
# Configuration
# -------------------------------------------------------------------------

# Secret key for JWT signing. In production, set the AUTH_SECRET_KEY env var.
SECRET_KEY: str = os.getenv("AUTH_SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Password hashing context (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme used by FastAPI to extract the token from the Authorization header.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


# -------------------------------------------------------------------------
# Password utilities
# -------------------------------------------------------------------------

def get_password_hash(password: str) -> str:
    """
    Hash a plain‑text password using bcrypt.

    Args:
        password: The plain password provided by the user.

    Returns:
        A bcrypt hash string.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain‑text password against its bcrypt hash.

    Args:
        plain_password: Password supplied during login.
        hashed_password: Stored bcrypt hash from the database.

    Returns:
        True if the password matches, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


# -------------------------------------------------------------------------
# JWT utilities
# -------------------------------------------------------------------------

def _create_jwt_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Internal helper to encode a JWT.

    Args:
        data: Payload data to include in the token.
        expires_delta: Optional custom expiration delta.

    Returns:
        Encoded JWT as a string.
    """
    to_encode = data.copy()
    now = datetime.utcnow()
    expire = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": now})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_access_token(username: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token for a given username.

    Args:
        username: The username to embed in the token payload.
        expires_delta: Optional custom expiration time.

    Returns:
        JWT token string.
    """
    return _create_jwt_token({"sub": username}, expires_delta)


def decode_access_token(token: str) -> TokenData:
    """
    Decode and validate a JWT token.

    Args:
        token: JWT string received from the client.

    Returns:
        TokenData instance containing the token payload.

    Raises:
        HTTPException: If token is invalid or expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        exp: Optional[int] = payload.get("exp")
        token_data = TokenData(username=username, exp=exp)
        return token_data
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, ValidationError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


# -------------------------------------------------------------------------
# Dependency for protected routes
# -------------------------------------------------------------------------

def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> User:
    """
    FastAPI dependency that extracts the current user from a JWT token.

    Args:
        token: JWT token extracted via OAuth2PasswordBearer.
        session: Database session provided by the ``get_session`` dependency.

    Returns:
        The authenticated ``User`` model instance.

    Raises:
        HTTPException: If token is invalid, expired, or user does not exist.
    """
    token_data = decode_access_token(token)
    if not token_data.username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing username",
            headers={"WWW-Authenticate": "Bearer"},
        )
    statement = select(User).where(User.email == token_data.username)
    user = session.exec(statement).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    return user