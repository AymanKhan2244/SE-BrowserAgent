from flask import Blueprint, render_template, current_app, abort, Response
from typing import Union

bp: Blueprint = Blueprint("main", __name__)


@bp.route("/", methods=["GET"])
def index() -> Union[Response, str]:
    """Render the Hello World page.

    Returns:
        The rendered ``index.html`` template.

    Raises:
        500: If the template cannot be rendered.
    """
    try:
        return render_template("index.html")
    except Exception as exc:  # pragma: no cover
        current_app.logger.exception("Failed to render index.html: %s", exc)
        abort(500)