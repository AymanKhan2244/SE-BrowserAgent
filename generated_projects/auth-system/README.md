# auth-system

## Project Overview

**auth-system** is a full‑stack authentication solution built with:

| Layer | Technology |
|-------|------------|
| **Backend** | FastAPI (Python 3.11), SQLModel (SQLAlchemy core) with PostgreSQL, JWT (PyJWT), Pydantic, Alembic migrations, pytest |
| **Database** | PostgreSQL (via `psycopg2-binary`) |
| **Frontend** | React 18, TypeScript, Vite, React Router v6, React Context for auth state, Tailwind CSS, Formik + Yup, Jest + React Testing Library |
| **Containerisation** | Docker & Docker‑Compose |

The system provides:

* User registration (`/api/register`)
* User login (`/api/login`) – returns a signed JWT
* JWT‑protected endpoint (`/api/protected`) – accessible only with a valid token
* Client‑side form validation and server‑side data validation
* Automated unit and integration tests for both backend and frontend
* Database migrations managed by Alembic

---

## Repository Structure

```
auth-system/
├─ backend/
│  ├─ main.py                # FastAPI app entrypoint
│  ├─ models.py              # SQLModel User model
│  ├─ schemas.py             # Pydantic request/response schemas
│  ├─ auth.py                # Password hashing & JWT utilities
│  ├─ database.py            # DB engine & session handling
│  ├─ routers.py             # API routers (register, login, protected)
│  ├─ requirements.txt       # Python dependencies
│  ├─ alembic.ini
│  ├─ migrations/
│  │   ├─ env.py
│  │   └─ versions/
│  │        └─ 20230101_create_user_table.py
│  └─ tests/
│       └─ test_auth.py      # Pytest suite
├─ frontend/
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ tailwind.config.js
│  ├─ postcss.config.js
│  ├─ vite.config.ts
│  └─ src/
│       ├─ main.tsx
│       ├─ App.tsx
│       ├─ authContext.tsx
│       ├─ api.ts
│       ├─ pages/
│       │    ├─ Register.tsx
│       │    ├─ Login.tsx
│       │    └─ Dashboard.tsx
│       └─ __tests__/
│            └─ Login.test.tsx
├─ Dockerfile                # FastAPI container
├─ docker-compose.yml        # FastAPI + PostgreSQL services
└─ README.md                 # ← you are here
```

---

## Prerequisites

* **Docker** ≥ 20.10
* **Docker‑Compose** ≥ 2.0
* (Optional) Local Python 3.11 and Node 20+ if you prefer running services without containers.

---

## Quick Start (Docker)

1. **Clone the repository**

   ```bash
   git clone https://github.com/your‑username/auth-system.git
   cd auth-system
   ```

2. **Create a `.env` file** (optional – defaults are provided in `docker-compose.yml`)

   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=auth_db
   JWT_SECRET_KEY=supersecretkey
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

3. **Build and start containers**

   ```bash
   docker compose up --build -d
   ```

   *Backend* will be reachable at `http://localhost:8000`  
   *Frontend* will be reachable at `http://localhost:5173`

4. **Run database migrations**

   ```bash
   docker compose exec backend alembic upgrade head
   ```

5. **Open the application**

   * Visit `http://localhost:5173` in your browser.
   * Register a new user, then log in. The dashboard will display data fetched from the protected endpoint.

6. **Run tests**

   ```bash
   # Backend tests
   docker compose exec backend pytest -q

   # Frontend tests
   docker compose exec frontend npm test -- --watchAll=false
   ```

7. **Stop the stack**

   ```bash
   docker compose down
   ```

---

## Development Setup (Local)

### Backend

1. **Create a virtual environment**

   ```bash
   python3.11 -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies**

   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Configure environment variables**

   ```bash
   export POSTGRES_USER=postgres
   export POSTGRES_PASSWORD=postgres
   export POSTGRES_DB=auth_db
   export POSTGRES_HOST=localhost
   export POSTGRES_PORT=5432
   export JWT_SECRET_KEY=supersecretkey
   export JWT_ALGORITHM=HS256
   export ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

4. **Start PostgreSQL locally** (or use Docker)

   ```bash
   # Example using Docker
   docker run -d --name pg \
     -e POSTGRES_USER=$POSTGRES_USER \
     -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
     -e POSTGRES_DB=$POSTGRES_DB \
     -p 5432:5432 postgres:15-alpine
   ```

5. **Run migrations**

   ```bash
   alembic upgrade head
   ```

6. **Start the FastAPI server**

   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

7. **Run backend tests**

   ```bash
   pytest backend/tests -q
   ```

### Frontend

1. **Install Node dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be served at `http://localhost:5173`.

3. **Run frontend tests**

   ```bash
   npm test -- --watchAll=false
   ```

---

## API Reference

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/api/register` | Register a new user (email, password). Returns user data (no password). | ❌ |
| `POST` | `/api/login`    | Authenticate user. Returns JWT access token. | ❌ |
| `GET`  | `/api/protected`| Example protected route. Returns a greeting with the current user’s email. | ✅ (Bearer token) |

All responses follow the JSON format defined in `backend/schemas.py`.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres` |
| `POSTGRES_DB` | Database name | `auth_db` |
| `POSTGRES_HOST` | DB host (Docker service name) | `db` |
| `POSTGRES_PORT` | DB port | `5432` |
| `JWT_SECRET_KEY` | Secret used to sign JWTs | `supersecretkey` |
| `JWT_ALGORITHM` | JWT algorithm (HS256 recommended) | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime in minutes | `30` |

---

## Security Considerations

* Passwords are hashed with **bcrypt** via `passlib`.
* JWTs are signed with a strong secret key; rotate regularly.
* CORS is enabled for the frontend origin (`http://localhost:5173`) in `backend/main.py`.
* All sensitive settings should be stored in environment variables or a secret manager in production.

---

## License

This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Write code and tests.
4. Ensure all tests pass (`docker compose exec backend pytest && docker compose exec frontend npm test`).
5. Open a Pull Request with a clear description of changes.

---