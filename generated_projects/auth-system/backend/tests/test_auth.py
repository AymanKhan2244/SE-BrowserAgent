import os
import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine

# Ensure the test uses an in‑memory SQLite database.
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

# Import after setting the env var so the engine is created with the test DB.
from backend.main import app  # noqa: E402
from backend.database import engine, get_session, init_db  # noqa: E402
from backend.models import User  # noqa: E402


@pytest.fixture(scope="session")
def db_engine():
    """
    Create a fresh SQLite engine for the entire test session.
    """
    test_engine = create_engine(os.getenv("DATABASE_URL"), echo=False, future=True)
    SQLModel.metadata.create_all(test_engine)
    return test_engine


@pytest.fixture(scope="function")
def db_session(db_engine):
    """
    Provide a SQLModel session bound to the test engine.
    The session is rolled back after each test to keep isolation.
    """
    with Session(db_engine) as session:
        yield session
        session.rollback()


@pytest.fixture(scope="function")
def client(db_session):
    """
    Override the FastAPI ``get_session`` dependency with the test session
    and return a TestClient instance.
    """
    def get_test_session():
        yield db_session

    app.dependency_overrides[get_session] = get_test_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_register_success(client: TestClient):
    """
    Register a new user and verify a JWT token is returned.
    """
    payload = {
        "email": "alice@example.com",
        "password": "StrongP@ssw0rd!",
        "full_name": "Alice Example",
    }
    response = client.post("/register", json=payload)
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_email(client: TestClient):
    """
    Attempt to register the same email twice – the second request should fail.
    """
    payload = {
        "email": "bob@example.com",
        "password": "Another$tr0ngPwd",
        "full_name": "Bob Builder",
    }
    # First registration succeeds.
    first_resp = client.post("/register", json=payload)
    assert first_resp.status_code == 200

    # Second registration with identical email should be rejected.
    second_resp = client.post("/register", json=payload)
    assert second_resp.status_code == 400
    assert "detail" in second_resp.json()


def test_login_success(client: TestClient):
    """
    Register a user then log in using the OAuth2 password flow.
    """
    register_payload = {
        "email": "carol@example.com",
        "password": "C@rolsPass123",
        "full_name": "Carol Singer",
    }
    reg_resp = client.post("/register", json=register_payload)
    assert reg_resp.status_code == 200

    login_payload = {
        "username": "carol@example.com",
        "password": "C@rolsPass123",
    }
    login_resp = client.post("/login", data=login_payload)
    assert login_resp.status_code == 200, login_resp.text
    token_data = login_resp.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"


def test_protected_route_requires_authentication(client: TestClient):
    """
    Verify that a protected endpoint rejects unauthenticated requests
    and accepts a valid JWT.
    """
    # Attempt without token – should be 401.
    unauth_resp = client.get("/protected")
    assert unauth_resp.status_code == 401

    # Register and obtain a token.
    payload = {
        "email": "dave@example.com",
        "password": "D@veSecure1",
        "full_name": "Dave Developer",
    }
    reg_resp = client.post("/register", json=payload)
    assert reg_resp.status_code == 200
    token = reg_resp.json()["access_token"]

    # Access protected route with Authorization header.
    auth_headers = {"Authorization": f"Bearer {token}"}
    auth_resp = client.get("/protected", headers=auth_headers)
    assert auth_resp.status_code == 200
    result = auth_resp.json()
    # The protected endpoint is expected to return the current user's email.
    assert result.get("email") == "dave@example.com"