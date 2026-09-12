"""Entry point for the basic‑calculator Flask application.

This module creates the Flask app instance using the factory defined in
``app/__init__.py`` and starts the development server.  The server runs on
``0.0.0.0:5000`` by default and respects the ``FLASK_DEBUG`` environment
variable (debug mode is enabled when the variable is unset or set to ``1``).
"""

from __future__ import annotations

import os
from typing import Final

from flask import Flask

# The application factory is defined in ``app/__init__.py``.
# It creates the Flask instance, registers blueprints, and applies configuration.
from app import create_app


def _is_debug_mode() -> bool:
    """Return ``True`` if the ``FLASK_DEBUG`` environment variable enables debug mode.

    The variable is considered truthy when set to ``1``, ``true``, ``yes`` (case‑insensitive).
    """
    value: str = os.getenv("FLASK_DEBUG", "1").lower()
    return value in {"1", "true", "yes"}


def main() -> None:
    """Create the Flask app and run the development server."""
    app: Flask = create_app()
    debug: bool = _is_debug_mode()
    # Using host ``0.0.0.0`` makes the server reachable from other devices on the network.
    app.run(host="0.0.0.0", port=5000, debug=debug)


if __name__ == "__main__":
    main()