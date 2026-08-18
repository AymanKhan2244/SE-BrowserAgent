"""
ForgeAI Server
==============
FastAPI backend that wraps the multi-agent pipeline and exposes it
via Server-Sent Events (SSE) for real-time frontend updates.

Run:
    python server.py
    # or: uvicorn server:app --reload --port 8000
"""

import os
import sys
import json
import uuid
import asyncio
import threading
import traceback
from pathlib import Path
from typing import Dict, Any

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Query
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse

# ── Import pipeline components ────────────────────────────────────────────────
from pipeline import (
    planner_agent,
    architect_agent,
    coding_agent,
    debugger_agent,
    terminal_agent,
    browser_agent,
    save_project,
    validate_project,
    PlannerOutput,
    ProjectManifest,
    GeneratedFile,
)

# ══════════════════════════════════════════════════════════════════════════════
# App setup
# ══════════════════════════════════════════════════════════════════════════════

app = FastAPI(title="ForgeAI", description="AI-Powered Code Generation Dashboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store: session_id -> session data
sessions: Dict[str, Dict[str, Any]] = {}

OUTPUT_BASE = Path("generated_projects")
OUTPUT_BASE.mkdir(exist_ok=True)


# ══════════════════════════════════════════════════════════════════════════════
# Routes
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    """Serve the ForgeAI dashboard HTML."""
    html_path = Path(__file__).parent / "forgeai-frontend" / "code.html"
    return HTMLResponse(html_path.read_text(encoding="utf-8"))


@app.get("/api/forge/stream")
async def forge_stream(query: str = Query(..., description="Project description")):
    """
    SSE endpoint that runs the full pipeline and streams real-time events.
    
    Event types:
        session       – carries the session_id for later API calls
        agent_start   – an agent has started working
        agent_log     – a log line from an agent
        agent_complete– an agent finished successfully
        pipeline_complete – entire pipeline done
        error         – something went wrong
    """
    session_id = str(uuid.uuid4())[:8]
    output_dir = str(OUTPUT_BASE / f"forge-{session_id}")

    # asyncio queue for thread -> SSE bridge
    loop = asyncio.get_event_loop()
    queue: asyncio.Queue = asyncio.Queue()

    def emit(event: dict):
        """Thread-safe push of an event into the async queue."""
        loop.call_soon_threadsafe(queue.put_nowait, event)

    def emit_log(text: str, color: str = "on-surface"):
        """Convenience: emit a terminal log line."""
        emit({"type": "agent_log", "text": text, "color": color})

    # ── Pipeline thread ───────────────────────────────────────────────────────
    def run_pipeline_thread():
        try:
            # ── 1. Planner ────────────────────────────────────────────────
            emit({"type": "agent_start", "agent": "planner"})
            emit_log("[PLANNER] Analyzing your prompt...", "primary")

            plan = planner_agent(query)

            emit_log(f"  Project : {plan.project_name}", "on-surface")
            emit_log(f"  Stack   : {json.dumps(plan.tech_stack)}", "on-surface")
            emit_log(f"  Features: {len(plan.features)} identified", "on-surface")
            emit({
                "type": "agent_complete", "agent": "planner",
                "data": {
                    "project_name": plan.project_name,
                    "tech_stack": plan.tech_stack,
                    "features": plan.features,
                    "description": plan.description,
                }
            })

            # ── 2. Architect ──────────────────────────────────────────────
            emit({"type": "agent_start", "agent": "architect"})
            emit_log("[ARCHITECT] Designing project structure...", "secondary")

            manifest = architect_agent(plan)

            emit_log(f"  Files planned : {len(manifest.files)}", "on-surface")
            emit_log(f"  Entrypoint    : {manifest.entrypoint}", "on-surface")
            emit_log(f"  Run command   : {manifest.run_command}", "on-surface")
            emit({
                "type": "agent_complete", "agent": "architect",
                "data": {
                    "files_count": len(manifest.files),
                    "entrypoint": manifest.entrypoint,
                    "run_command": manifest.run_command,
                    "install_command": manifest.install_command,
                    "file_list": [f.path for f in manifest.files],
                }
            })

            # ── 3. Coder ─────────────────────────────────────────────────
            emit({"type": "agent_start", "agent": "coder"})
            emit_log(f"[CODER] Generating {len(manifest.files)} files...", "tertiary")

            current_files = coding_agent(manifest, plan)

            for gf in current_files:
                emit_log(f"  ✓ {gf.path} ({len(gf.content)} bytes)", "on-surface")
            emit({
                "type": "agent_complete", "agent": "coder",
                "data": {"files_generated": len(current_files)}
            })

            # ── 4. Debugger (iterative) ───────────────────────────────────
            emit({"type": "agent_start", "agent": "debugger"})
            emit_log("[DEBUGGER] Reviewing and fixing code...", "tertiary-fixed")

            max_iterations = 2  # keep it fast for the web UI
            errors = None
            terminal_result = None
            root = None

            for iteration in range(max_iterations):
                if iteration > 0:
                    emit_log(f"  --- Debug iteration {iteration + 1} ---", "on-surface")

                current_files = debugger_agent(current_files, errors=errors)
                emit_log(f"  Debug pass {iteration + 1} complete", "on-surface")

                # Validate
                validate_project(current_files, manifest)

                # Save to disk
                root = save_project(current_files, manifest, root=output_dir)

                # ── 5. Terminal agent ─────────────────────────────────────
                if iteration == 0:
                    emit({"type": "agent_complete", "agent": "debugger",
                          "data": {"iterations": iteration + 1}})
                    emit({"type": "agent_start", "agent": "terminal"})
                    emit_log("[TERMINAL] Installing dependencies & compile-checking...", "primary-fixed")

                terminal_result = terminal_agent(
                    project_path=str(root),
                    install_command=manifest.install_command,
                )

                if terminal_result["success"]:
                    emit_log("  All checks passed!", "tertiary")
                    break
                else:
                    errors = terminal_result["stderr"]
                    error_preview = errors.splitlines()[:5]
                    for line in error_preview:
                        emit_log(f"  ⚠ {line.strip()}", "error")
                    emit_log("  Re-running debugger with error context...", "on-surface")

            emit({
                "type": "agent_complete", "agent": "terminal",
                "data": {
                    "success": terminal_result["success"] if terminal_result else False,
                    "commands": terminal_result.get("executed_commands", []) if terminal_result else [],
                }
            })

            # ── 6. Browser agent ──────────────────────────────────────────
            emit({"type": "agent_start", "agent": "browser"})
            emit_log("[BROWSER] Running smoke tests with Playwright...", "secondary-fixed")

            browser_result = browser_agent(
                project_root=str(root),
                run_command=manifest.run_command,
            )

            if browser_result.get("success"):
                emit_log(f"  Page title: {browser_result.get('page_title', 'N/A')}", "on-surface")
                emit_log("  All smoke tests passed!", "tertiary")
            else:
                for err in browser_result.get("errors", []):
                    emit_log(f"  ⚠ {err}", "error")

            emit({
                "type": "agent_complete", "agent": "browser",
                "data": {
                    "success": browser_result.get("success", False),
                    "page_title": browser_result.get("page_title", ""),
                    "screenshot": browser_result.get("screenshot_path"),
                }
            })

            # ── Store session data ────────────────────────────────────────
            sessions[session_id] = {
                "files": current_files,
                "manifest": manifest,
                "plan": plan,
                "output_dir": output_dir,
                "terminal_result": terminal_result,
                "browser_result": browser_result,
            }

            # ── Pipeline complete ─────────────────────────────────────────
            emit_log(f"\n[SYSTEM] Forge complete! Project: {plan.project_name}", "tertiary")
            emit({
                "type": "pipeline_complete",
                "session_id": session_id,
                "data": {
                    "project_name": plan.project_name,
                    "description": plan.description,
                    "tech_stack": plan.tech_stack,
                    "features": plan.features,
                    "files_count": len(current_files),
                    "entrypoint": manifest.entrypoint,
                    "run_command": manifest.run_command,
                    "install_command": manifest.install_command,
                    "terminal_success": terminal_result["success"] if terminal_result else False,
                    "browser_success": browser_result.get("success", False),
                }
            })

        except Exception as exc:
            tb = traceback.format_exc()
            emit_log(f"\n[ERROR] Pipeline failed: {exc}", "error")
            emit({"type": "error", "message": str(exc), "traceback": tb})

        finally:
            # Sentinel to close the SSE stream
            emit(None)

    # ── Start pipeline in background thread ───────────────────────────────────
    thread = threading.Thread(target=run_pipeline_thread, daemon=True)
    thread.start()

    # ── SSE event generator ───────────────────────────────────────────────────
    async def event_generator():
        # First event: session ID so the frontend can make follow-up API calls
        yield f"data: {json.dumps({'type': 'session', 'session_id': session_id})}\n\n"

        while True:
            event = await queue.get()
            if event is None:
                # Send a final "done" event and close
                yield f"data: {json.dumps({'type': 'done'})}\n\n"
                break
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/api/forge/{session_id}/files")
async def get_files(session_id: str):
    """Return the generated files (path + content) for a session."""
    session = sessions.get(session_id)
    if not session:
        return JSONResponse({"error": "Session not found"}, status_code=404)

    files = session["files"]
    return {
        "files": [
            {"path": gf.path, "content": gf.content}
            for gf in files
        ]
    }


@app.get("/api/forge/{session_id}/download")
async def download_zip(session_id: str):
    """Download the generated project as a ZIP file."""
    session = sessions.get(session_id)
    if not session:
        return JSONResponse({"error": "Session not found"}, status_code=404)

    zip_path = Path(session["output_dir"] + ".zip")
    if not zip_path.exists():
        return JSONResponse({"error": "ZIP not found"}, status_code=404)

    project_name = session["manifest"].project_name
    return FileResponse(
        str(zip_path),
        media_type="application/zip",
        filename=f"{project_name}.zip",
    )


# ══════════════════════════════════════════════════════════════════════════════
# Entry point
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("  ForgeAI Server")
    print("  Open http://localhost:8000 in your browser")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
