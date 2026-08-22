# hello-world-flask

## Project Overview
A minimal full‑stack web application that serves a single **"Hello, World!"** page.  
The backend is built with **Python Flask**, and the frontend consists of a simple HTML page styled with CSS.

## Tech Stack
- **Backend:** Python 3.9+, Flask
- **Frontend:** HTML5, CSS3

## Prerequisites
- Python 3.9 or newer installed on your system.
- (Optional) Git, if you want to clone the repository.

## Setup & Installation

1. **Clone the repository** (skip if you already have the files):
   ```bash
   git clone https://github.com/yourusername/hello-world-flask.git
   cd hello-world-flask
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**  
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows (PowerShell):
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - On Windows (cmd.exe):
     ```cmd
     .\venv\Scripts\activate.bat
     ```

4. **Install dependencies**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

## Running the Application

```bash
python main.py
```

The Flask development server will start and listen on `http://127.0.0.1:5000/`.  
Open your web browser and navigate to that URL to see the **Hello, World!** page.

### Development Mode
The server runs with `debug=True` by default, enabling auto‑reload on code changes.  
To disable debug mode, edit `main.py` and set `debug=False` in the `app.run()` call.

## Project Structure

```
hello-world-flask/
├── app/
│   ├── __init__.py      # Flask app factory and blueprint registration
│   └── routes.py        # Route definitions
├── static/
│   └── css/
│       └── style.css    # Page styling
├── templates/
│   └── index.html       # HTML template
├── main.py               # Application entry point
├── requirements.txt      # Python dependencies
└── README.md             # This file
```

## Testing the Endpoint
You can verify the service with `curl`:

```bash
curl http://127.0.0.1:5000/
```

You should receive the HTML content of the **Hello, World!** page.

## License
This project is released under the MIT License. Feel free to use, modify, and distribute it.