"""Entry point for the Hello World Flask application.

This script creates the Flask application instance using the factory
function defined in :pymod:`app.__init__` and starts the development
server. It reads the optional ``PORT`` environment variable to allow
customization of the listening port.

Running the application:
    $ python main.py
"""

import os
import sys
from typing import NoReturn

def _get_port() -> int:
    """Return the port number for the Flask server.

    The function checks the ``PORT`` environment variable; if it is not
    set or is invalid, it falls back to the default Flask development
    port ``5000``.
    """
    default_port = 5000
    port_str = os.getenv("PORT")
    if not port_str:
        return default_port
    try:
        port = int(port_str)
        if not (0 < port < 65536):
            raise ValueError
        return port
    except ValueError:
        print(f"Invalid PORT value '{port_str}'. Using default port {default_port}.", file=sys.stderr)
        return default_port


def main() -> NoReturn:
    """Create and run the Flask application."""
    try:
        # Import inside the function to avoid side‑effects during module import.
        from app import create_app
    except ImportError as exc:
        print(f"Failed to import the Flask application factory: {exc}", file=sys.stderr)
        sys.exit(1)

    try:
        app = create_app()
    except Exception as exc:
        print(f"Error while creating the Flask app: {exc}", file=sys.stderr)
        sys.exit(1)

    # Run the Flask development server.
    app.run(host="0.0.0.0", port=_get_port(), debug=False)


if __name__ == "__main__":
    main()