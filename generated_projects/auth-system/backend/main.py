import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, create_db_and_tables
from .routers import api_router  # Assumes routers.py defines `api_router` as an APIRouter


def get_application() -> FastAPI:
    """
    Create and configure the FastAPI application.

    Returns
    -------
    FastAPI
        Configured FastAPI instance with CORS middleware and routers.
    """
    app = FastAPI(
        title="Auth System API",
        description="FastAPI backend for the authentication system.",
        version="1.0.0",
    )

    # CORS configuration – allow all origins for development.
    # Adjust origins list for production as needed.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # TODO: Restrict in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include the main API router.
    app.include_router(api_router)

    @app.on_event("startup")
    async def on_startup() -> None:
        """
        Event handler that runs when the application starts.
        It ensures that the database tables are created.
        """
        create_db_and_tables(engine)

    return app


app: FastAPI = get_application()


if __name__ == "__main__":
    # When executed directly, run the development server.
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )