from flask import Flask
from flask_cors import CORS

# Import the blueprint that contains the route definitions.
# The blueprint is expected to be named `bp` inside `app.routes`.
from .routes import bp as main_bp


def create_app() -> Flask:
    """
    Application factory that creates and configures the Flask app.

    Returns
    -------
    Flask
        Configured Flask application instance.
    """
    # Initialise the Flask app with explicit static and template folders.
    app = Flask(
        __name__,
        static_folder="static",
        template_folder="templates",
    )

    # Enable Cross-Origin Resource Sharing for all routes.
    CORS(app)

    # Register the main blueprint that holds the '/' route.
    try:
        app.register_blueprint(main_bp)
    except Exception as exc:
        # Log the error and re‑raise to avoid silent failures.
        app.logger.error("Failed to register blueprint: %s", exc)
        raise

    return app


# Create a module‑level app instance for simple execution (`python -m app` or via `main.py`).
app: Flask = create_app()


if __name__ == "__main__":
    # Run the development server when this module is executed directly.
    # Host 0.0.0.0 makes the server reachable from other devices on the network.
    app.run(host="0.0.0.0", port=5000, debug=True)