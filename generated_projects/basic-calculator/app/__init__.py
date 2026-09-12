from __future__ import annotations

from typing import Final

from flask import Flask
from flask_cors import CORS


def create_app() -> Flask:
    """Create and configure the Flask application.

    Returns
    -------
    Flask
        The configured Flask application instance.
    """
    # Initialise the Flask app with default static and template folders.
    app = Flask(__name__, static_folder="static", template_folder="templates")

    # Basic configuration – in a real deployment ``SECRET_KEY`` should be set
    # via an environment variable or a config file.
    app.config.from_mapping(
        SECRET_KEY="dev-secret-key",
        JSONIFY_PRETTYPRINT_REGULAR=False,
    )

    # Enable Cross‑Origin Resource Sharing for all routes (useful if the
    # frontend is served from a different origin during development).
    CORS(app)

    # Import and register the calculator blueprint defined in ``app.routes``.
    from .routes import main_bp as calculator_bp
    app.register_blueprint(calculator_bp)

    return app


# The application instance used by the entry‑point (``main.py``).
app: Final[Flask] = create_app()

__all__: list[str] = ["app", "create_app"]