# auth-system

## Setup

```bash
cd generated_projects\auth-system
pip install -r backend/requirements.txt && npm install --prefix frontend
```

## Run

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

## Entrypoint
`backend/main.py`
