"""
ForgeAI Server
==============
FastAPI backend that wraps the LangGraph multi-agent pipeline and exposes it
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

# ── Import the LangGraph workflow ─────────────────────────────────────────────
from workflow import graph, PipelineState
from pipeline import GeneratedFile, ProjectManifest, PlannerOutput

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
# Node-to-agent mapping (maps LangGraph node names to frontend agent names)
# ══════════════════════════════════════════════════════════════════════════════

NODE_AGENT_MAP = {
    "planner_agent":         "planner",
    "architect_agent":       "architect",
    "coding_agent":          "coder",
    "debugger_agent":        "debugger",
    "save_the_project_agent": None,       # No UI card for saver
    "terminal_agent":        "terminal",
    "browser_agent_node":    "browser",
    "validate_agent":        None,         # No UI card for validator
}

NODE_START_MESSAGES = {
    "planner_agent":         ("[PLANNER] Analyzing your prompt...", "primary"),
    "architect_agent":       ("[ARCHITECT] Designing project structure...", "secondary"),
    "coding_agent":          ("[CODER] Generating code files...", "tertiary"),
    "debugger_agent":        ("[DEBUGGER] Reviewing and fixing code...", "tertiary-fixed"),
    "save_the_project_agent": ("[SAVER] Writing project to disk...", "on-surface"),
    "terminal_agent":        ("[TERMINAL] Installing dependencies & compile-checking...", "primary-fixed"),
    "browser_agent_node":    ("[BROWSER] Running smoke tests with Playwright...", "secondary-fixed"),
    "validate_agent":        ("[VALIDATOR] Running final validation...", "on-surface"),
}


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
    SSE endpoint that runs the full LangGraph pipeline and streams real-time events.

    Uses graph.stream() to get node-by-node outputs and translates them into
    the same SSE event types the frontend expects:
        session        – carries the session_id for later API calls
        agent_start    – an agent has started working
        agent_log      – a log line from an agent
        agent_complete – an agent finished successfully
        pipeline_complete – entire pipeline done
        error          – something went wrong
    """
    session_id = str(uuid.uuid4())[:8]

    # asyncio queue for thread -> SSE bridge
    loop = asyncio.get_running_loop()
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
            # Build the initial state
            initial_state = {
                "query": query,
                "output_dir": "",     # Will be set by save_project_node
                "plan": None,
                "manifest": None,
                "generated_files": None,
                "debugged_files": None,
                "validation_warnings": [],
                "project_root": None,
                "terminal_result": None,
                "browser_result": None,
                "retry_count": 0,
                "max_retries": 2,
                "error": None,
            }

            # Track accumulated state for building the final summary
            accumulated_state = dict(initial_state)

            # ── Stream the graph node by node ─────────────────────────────
            for chunk in graph.stream(initial_state, stream_mode="updates"):
                # chunk is a dict like {"planner_agent": {"plan": ...}}
                for node_name, node_output in chunk.items():
                    agent_name = NODE_AGENT_MAP.get(node_name)

                    # Emit agent_start BEFORE the node runs — but since stream
                    # yields AFTER each node completes, we emit start+complete
                    # together. The frontend handles this fine.
                    if agent_name:
                        emit({"type": "agent_start", "agent": agent_name})

                    # Emit the start message
                    if node_name in NODE_START_MESSAGES:
                        msg, color = NODE_START_MESSAGES[node_name]
                        emit_log(msg, color)

                    # Merge node output into accumulated state
                    if isinstance(node_output, dict):
                        accumulated_state.update(node_output)

                    # ── Emit node-specific log details ────────────────────
                    if node_name == "planner_agent":
                        plan = node_output.get("plan")
                        if plan:
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

                    elif node_name == "architect_agent":
                        manifest = node_output.get("manifest")
                        if manifest:
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

                    elif node_name == "coding_agent":
                        files = node_output.get("generated_files", [])
                        for gf in files:
                            emit_log(f"  ✓ {gf.path} ({len(gf.content)} bytes)", "on-surface")
                        emit({
                            "type": "agent_complete", "agent": "coder",
                            "data": {"files_generated": len(files)}
                        })

                    elif node_name == "debugger_agent":
                        files = node_output.get("generated_files", [])
                        emit_log(f"  Debug pass complete — {len(files)} files reviewed", "on-surface")
                        emit({
                            "type": "agent_complete", "agent": "debugger",
                            "data": {"files_reviewed": len(files)}
                        })

                    elif node_name == "save_the_project_agent":
                        project_root = node_output.get("project_root", "")
                        output_dir = node_output.get("output_dir", "")
                        emit_log(f"  Project saved to: {project_root}", "on-surface")

                    elif node_name == "terminal_agent":
                        terminal_result = node_output.get("terminal_result", {})
                        if terminal_result.get("success"):
                            emit_log("  All checks passed!", "tertiary")
                        else:
                            stderr = terminal_result.get("stderr", "")
                            for line in stderr.splitlines()[:5]:
                                emit_log(f"  ⚠ {line.strip()}", "error")
                        emit({
                            "type": "agent_complete", "agent": "terminal",
                            "data": {
                                "success": terminal_result.get("success", False),
                                "commands": terminal_result.get("executed_commands", []),
                            }
                        })

                    elif node_name == "browser_agent_node":
                        browser_result = node_output.get("browser_result", {})
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

                    elif node_name == "validate_agent":
                        emit_log("  Validation complete", "on-surface")

            # ── Build final state from accumulated data ───────────────────
            plan = accumulated_state.get("plan")
            manifest = accumulated_state.get("manifest")
            current_files = accumulated_state.get("generated_files", [])
            terminal_result = accumulated_state.get("terminal_result", {})
            browser_result = accumulated_state.get("browser_result", {})
            output_dir = accumulated_state.get("output_dir", "")

            # Store session data
            sessions[session_id] = {
                "files": current_files,
                "manifest": manifest,
                "plan": plan,
                "output_dir": output_dir,
                "terminal_result": terminal_result,
                "browser_result": browser_result,
            }

            # Pipeline complete
            project_name = plan.project_name if plan else "unknown"
            emit_log(f"\n[SYSTEM] Forge complete! Project: {project_name}", "tertiary")
            emit({
                "type": "pipeline_complete",
                "session_id": session_id,
                "data": {
                    "project_name": project_name,
                    "description": plan.description if plan else "",
                    "tech_stack": plan.tech_stack if plan else {},
                    "features": plan.features if plan else [],
                    "files_count": len(current_files) if current_files else 0,
                    "entrypoint": manifest.entrypoint if manifest else "",
                    "run_command": manifest.run_command if manifest else "",
                    "install_command": manifest.install_command if manifest else "",
                    "terminal_success": terminal_result.get("success", False) if terminal_result else False,
                    "browser_success": browser_result.get("success", False) if browser_result else False,
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

    project_name = session["plan"].project_name if session.get("plan") else "project"
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
    print("  ForgeAI Server (LangGraph Pipeline)")
    print("  Open http://localhost:8000 in your browser")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
