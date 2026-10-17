from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from datetime import timedelta

from backend import models, schemas, auth, database

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), session: Session = Depends(database.get_session)
) -> models.User:
    """
    Decode the JWT token, verify its validity and return the corresponding user.
    """
    try:
        payload = auth.decode_token(token)
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token payload missing subject",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except auth.TokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = session.exec(select(models.User).where(models.User.email == email)).first()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@router.post(
    "/register",
    response_model=schemas.UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user account",
)
def register_user(
    user_in: schemas.UserCreate, session: Session = Depends(database.get_session)
) -> schemas.UserRead:
    """
    Register a new user. The password is hashed before storage.
    """
    existing_user = session.exec(
        select(models.User).where(models.User.email == user_in.email)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    hashed_password = auth.get_password_hash(user_in.password)
    user = models.User(
        email=user_in.email,
        hashed_password=hashed_password,
        is_active=True,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return schemas.UserRead.from_orm(user)


@router.post(
    "/login",
    response_model=schemas.Token,
    summary="Authenticate user and return JWT access token",
)
def login(
    credentials: schemas.UserCreate, session: Session = Depends(database.get_session)
) -> schemas.Token:
    """
    Verify user credentials and issue a JWT access token.
    """
    user = session.exec(
        select(models.User).where(models.User.email == credentials.email)
    ).first()
    if not user or not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )

    access_token_expires = timedelta(minutes=15)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return schemas.Token(access_token=access_token, token_type="bearer")


class TokenRefreshRequest(schemas.BaseModel):
    refresh_token: str


@router.post(
    "/refresh",
    response_model=schemas.Token,
    summary="Refresh an expired access token using a refresh token",
)
def refresh_token(
    token_req: TokenRefreshRequest,
) -> schemas.Token:
    """
    Validate the provided refresh token and issue a new access token.
    """
    try:
        payload = auth.decode_token(token_req.refresh_token, verify_exp=False)
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except auth.TokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )

    new_access_token = auth.create_access_token(
        data={"sub": email}, expires_delta=timedelta(minutes=15)
    )
    return schemas.Token(access_token=new_access_token, token_type="bearer")


@router.get(
    "/protected",
    response_model=schemas.UserRead,
    summary="Example of a protected endpoint",
)
def protected_route(current_user: models.User = Depends(get_current_user)) -> schemas.UserRead:
    """
    Return the authenticated user's information. Accessible only with a valid JWT.
    """
    return schemas.UserRead.from_orm(current_user)