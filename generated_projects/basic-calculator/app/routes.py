from flask import Blueprint, Flask, jsonify, render_template, request
from typing import Any, Dict, Tuple, Union

# Blueprint for main routes
bp: Blueprint = Blueprint(
    "main",
    __name__,
    template_folder="templates",
    static_folder="static",
)


def _parse_number(value: Any) -> Union[float, None]:
    """Attempt to convert a value to a float.

    Returns:
        float if conversion succeeds, otherwise None.
    """
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _calculate(
    operand1: float, operand2: float, operator: str
) -> Tuple[Union[float, None], Union[str, None]]:
    """Perform a basic arithmetic operation.

    Args:
        operand1: First numeric operand.
        operand2: Second numeric operand.
        operator: One of '+', '-', '*', '/'.

    Returns:
        A tuple of (result, error). If calculation succeeds, error is None.
    """
    if operator == "+":
        return operand1 + operand2, None
    if operator == "-":
        return operand1 - operand2, None
    if operator == "*":
        return operand1 * operand2, None
    if operator == "/":
        if operand2 == 0:
            return None, "Division by zero is not allowed."
        return operand1 / operand2, None
    return None, f"Unsupported operator '{operator}'. Expected one of '+', '-', '*', '/'."


@bp.route("/", methods=["GET"])
def index() -> str:
    """Render the calculator UI."""
    return render_template("index.html")


@bp.route("/api/calculate", methods=["POST"])
def calculate() -> Any:
    """JSON API endpoint that evaluates a basic arithmetic expression.

    Expected JSON payload:
        {
            "operand1": <number>,
            "operand2": <number>,
            "operation": "<one of add, subtract, multiply, divide>"
        }

    Returns:
        JSON response with either {"result": <number>} or {"error": <message>}.
    """
    if not request.is_json:
        return jsonify(error="Request content type must be application/json."), 400

    data: Dict[str, Any] = request.get_json(silent=True) or {}
    operand1_raw = data.get("operand1")
    operand2_raw = data.get("operand2")
    operation = data.get("operation")

    # Validate presence of required fields
    missing_fields = [
        field
        for field, value in (("operand1", operand1_raw), ("operand2", operand2_raw), ("operation", operation))
        if value is None
    ]
    if missing_fields:
        return jsonify(error=f"Missing required fields: {', '.join(missing_fields)}."), 400

    # Validate numbers
    operand1 = _parse_number(operand1_raw)
    operand2 = _parse_number(operand2_raw)
    if operand1 is None or operand2 is None:
        return jsonify(error="Both operands must be valid numbers."), 400

    # Validate operation type
    if not isinstance(operation, str):
        return jsonify(error="Operation must be a string."), 400

    # Map textual operation to symbolic operator
    operation_map = {
        "add": "+",
        "subtract": "-",
        "multiply": "*",
        "divide": "/",
        "+": "+",
        "-": "-",
        "*": "*",
        "/": "/",
    }
    operator = operation_map.get(operation.strip().lower())
    if operator is None:
        return jsonify(error="Unsupported operation. Use add, subtract, multiply, or divide."), 400

    result, error = _calculate(operand1, operand2, operator)
    if error:
        return jsonify(error=error), 400

    # Return result rounded to a reasonable precision
    return jsonify(result=round(result, 10))


def register_routes(app: Flask) -> None:
    """Helper to register the blueprint with the Flask application.

    This function is called from ``app/__init__.py`` to ensure routes are active.

    Args:
        app: The Flask application instance.
    """
    app.register_blueprint(bp)