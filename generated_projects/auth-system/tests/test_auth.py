import pytest
from httpx import AsyncClient
from fastapi import status

# Import the FastAPI application instance
from backend.main import app


@pytest.fixture(scope="module")
async def async_client() -> AsyncClient:
    """
    Provides a single AsyncClient instance for the entire test module.
    The client is configured to use the FastAPI app directly, avoiding
    network I/O.
    """
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        yield client


@pytest.fixture
def user_payload() -> dict:
    """Standard user payload used for registration and login."""
    return {"email": "testuser@example.com", "password": "StrongP@ssw0rd"}


@pytest.mark.asyncio
async def test_user_registration_success(async_client: AsyncClient, user_payload: dict):
    """
    Verify that a new user can register successfully.
    Expected response:
        - HTTP 201 Created
        - JSON body containing at least `id` and `email`
        - No password or hashed password in the response
    """
    response = await async_client.post("/register", json=user_payload)
    assert response.status_code == status.HTTP_201_CREATED, response.text

    data = response.json()
    assert "id" in data, "Response should contain user id"
    assert data.get("email") == user_payload["email"], "Returned email should match input"
    assert "hashed_password" not in data, "Password hash must not be exposed"
    assert "password" not in data, "Plain password must not be exposed"


@pytest.mark.asyncio
async def test_user_registration_duplicate(async_client: AsyncClient, user_payload: dict):
    """
    Registering the same email twice should result in a 400 Bad Request.
    """
    # First registration (should succeed)
    first_resp = await async_client.post("/register", json=user_payload)
    assert first_resp.status_code == status.HTTP_201_CREATED

    # Second registration with identical payload
    second_resp = await async_client.post("/register", json=user_payload)
    assert second_resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in second_resp.text.lower()


@pytest.mark.asyncio
async def test_user_login_success(async_client: AsyncClient, user_payload: dict):
    """
    After a successful registration, the user should be able to log in and receive a JWT.
    Expected response:
        - HTTP 200 OK
        - JSON body containing an `access_token` field
    """
    # Ensure the user exists
    await async_client.post("/register", json=user_payload)

    login_resp = await async_client.post("/login", json=user_payload)
    assert login_resp.status_code == status.HTTP_200_OK, login_resp.text

    token_data = login_resp.json()
    assert "access_token" in token_data, "Login response must contain an access token"
    assert isinstance(token_data["access_token"], str)
    assert token_data.get("token_type", "bearer").lower() == "bearer"


@pytest.mark.asyncio
async def test_user_login_invalid_credentials(async_client: AsyncClient, user_payload: dict):
    """
    Logging in with an incorrect password should fail with 401 Unauthorized.
    """
    # Register the user first
    await async_client.post("/register", json=user_payload)

    # Attempt login with wrong password
    bad_payload = {**user_payload, "password": "WrongPassword123"}
    resp = await async_client.post("/login", json=bad_payload)
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
    assert "invalid credentials" in resp.text.lower()


@pytest.mark.asyncio
async def test_protected_route_access(async_client: AsyncClient, user_payload: dict):
    """
    Access to a protected endpoint should be granted when a valid JWT is supplied.
    Expected response:
        - HTTP 200 OK
        - JSON body with a message or user info
    """
    # Register and log in to obtain a token
    await async_client.post("/register", json=user_payload)
    login_resp = await async_client.post("/login", json=user_payload)
    token = login_resp.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    protected_resp = await async_client.get("/protected", headers=headers)

    assert protected_resp.status_code == status.HTTP_200_OK, protected_resp.text
    data = protected_resp.json()
    assert "message" in data or "user" in data, "Protected endpoint should return identifiable data"


@pytest.mark.asyncio
async def test_protected_route_without_token(async_client: AsyncClient):
    """
    Accessing a protected endpoint without a JWT should result in 401 Unauthorized.
    """
    resp = await async_client.get("/protected")
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
    assert "not authenticated" in resp.text.lower() or "credentials" in resp.text.lower()