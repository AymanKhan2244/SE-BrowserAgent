# Basic Calculator

A minimal web‑based calculator that performs basic arithmetic operations (addition, subtraction, multiplication, division) via a Flask backend. The frontend is built with plain HTML, CSS and vanilla JavaScript, sending user input to the server through AJAX and displaying the computed result without a page reload.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Usage](#api-usage)
- [Development](#development)
- [License](#license)

## Features
- Simple UI with a responsive layout.
- Supports addition, subtraction, multiplication, and division.
- Real‑time calculation via a JSON API (`/api/calculate`).
- Input validation and graceful error handling.
- No database or external services required.

## Tech Stack
| Layer   | Technology |
|---------|------------|
| Backend | Flask 3.0, Python 3.11, Flask‑CORS |
| Frontend| HTML5, CSS3, JavaScript (ES6) |
| Build   | `requirements.txt` for Python dependencies |

## Prerequisites
- Python 3.11 or newer installed and available on `PATH`.
- Git (optional, for cloning the repository).

## Installation
1. **Clone the repository** (or download the source archive):
   ```bash
   git clone https://github.com/yourusername/basic-calculator.git
   cd basic-calculator
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

## Running the Application
You can start the development server in two equivalent ways:

### Option 1 – Using the entrypoint script
```bash
python main.py
```

### Option 2 – Using Flask CLI
```bash
export FLASK_APP=main.py   # On Windows: set FLASK_APP=main.py
flask run
```

The application will be available at **http://127.0.0.1:5000**. Open this URL in a browser to use the calculator.

## API Usage
The calculator logic is exposed via a JSON endpoint:

- **URL**: `/api/calculate`
- **Method**: `POST`
- **Content‑Type**: `application/json`
- **Request Body**:
  ```json
  {
    "operand1": 12.5,
    "operand2": 3,
    "operator": "+"
  }
  ```
  Supported operators: `"+"`, `"-"`, `"*"`, `"/"`.

- **Successful Response** (`200 OK`):
  ```json
  {
    "result": 15.5
  }
  ```

- **Error Response** (`400 Bad Request`):
  ```json
  {
    "error": "Division by zero is not allowed."
  }
  ```

The frontend (`script.js`) handles all AJAX calls automatically; you normally won’t need to call the API manually.

## Development
If you wish to modify the project:

1. **Enable hot‑reloading** (Flask debug mode):
   ```bash
   export FLASK_ENV=development   # Windows: set FLASK_ENV=development
   python main.py
   ```

2. **Linting & Formatting** (optional):
   ```bash
   pip install flake8 black
   flake8 app/
   black app/
   ```

3. **Testing** – The project currently does not include automated tests, but you can add them under a `tests/` directory using `pytest`.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.