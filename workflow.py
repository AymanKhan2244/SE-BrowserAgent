from langgraph.graph import StateGraph, END, START
from pipeline import (
    planner_agent,
    architect_agent,
    coding_agent,
    debugger_agent,
    terminal_agent,
    save_project,
    validate_project,
    PlannerOutput,
    ProjectManifest,
    GeneratedFile,
)
from browser_agent import browser_agent
from typing import List, Dict, Any
from typing_extensions import TypedDict, Optional
from pathlib import Path
import os
import sys
import json
import uuid
import asyncio
import threading
import traceback
import socket
import uvicorn
from dataclasses import dataclass
from fastapi import FastAPI, Query
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import StreamingResponse
from dotenv import load_dotenv


load_dotenv()





class PipelineState(TypedDict):
    query: str
    output_dir: str
    plan: Optional[PlannerOutput]
    manifest: Optional[ProjectManifest]
    generated_files: Optional[List[GeneratedFile]]
    debugged_files: Optional[List[GeneratedFile]]
    validation_warnings: List[str]
    project_root: Optional[str]
    terminal_result: Optional[Dict[str, Any]]
    browser_result: Optional[Dict[str, Any]]
    retry_count: int
    max_retries: int
    error: Optional[str]




def planner_node(state: PipelineState):
    query = state.get("query", "")
    plan = planner_agent(query)
    return {"plan": plan}


def architect_node(state: PipelineState):
    manifest = architect_agent(state["plan"])
    return {"manifest": manifest}


def coding_node(state: PipelineState):
    generated = coding_agent(state["manifest"], state["plan"])
    return {"generated_files": generated}


def debugger_node(state: PipelineState):
    """Run the debugger agent, passing terminal errors if available for re-debugging."""
    errors = None
    terminal_result = state.get("terminal_result")
    if terminal_result and not terminal_result.get("success"):
        errors = terminal_result.get("stderr", "")
    debugged = debugger_agent(state["generated_files"], errors=errors)
    return {"generated_files": debugged}


def save_project_node(state: PipelineState):
    """Save the project to disk using the planner's project_name as the folder name."""
    plan = state.get("plan")
    if plan and hasattr(plan, "project_name") and plan.project_name:
        project_slug = plan.project_name.strip().lower().replace(" ", "-")
        output_dir = str(Path("generated_projects") / project_slug)
    else:
        output_dir = state.get("output_dir", "generated_project")

    root = save_project(state["generated_files"], state["manifest"], root=output_dir)
    return {"project_root": str(root), "output_dir": output_dir}


def terminal_node(state: PipelineState):
    result = terminal_agent(state["project_root"], state["manifest"].install_command)
    return {"terminal_result": result}


def browser_agent_node_fn(state: PipelineState):
    result = browser_agent(
        project_root=state["project_root"],
        run_command=state["manifest"].run_command,
    )
    return {"browser_result": result}


def validate_node(state: PipelineState):
    validate_project(state["generated_files"], state["manifest"])
    return {}




build = StateGraph(PipelineState)

build.add_node("planner_agent", planner_node)
build.add_node("architect_agent", architect_node)
build.add_node("coding_agent", coding_node)
build.add_node("debugger_agent", debugger_node)
build.add_node("save_the_project_agent", save_project_node)
build.add_node("terminal_agent", terminal_node)
build.add_node("browser_agent_node", browser_agent_node_fn)
build.add_node("validate_agent", validate_node)

build.add_edge(START, "planner_agent")
build.add_edge("planner_agent", "architect_agent")
build.add_edge("architect_agent", "coding_agent")
build.add_edge("coding_agent", "debugger_agent")
build.add_edge("debugger_agent", "save_the_project_agent")
build.add_edge("save_the_project_agent", "terminal_agent")
build.add_edge("terminal_agent", "browser_agent_node")
build.add_edge("browser_agent_node", "validate_agent")
build.add_edge("validate_agent", END)

graph = build.compile()


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

# Serve Next.js static assets (_next/static chunks, images, etc.)
_NEXT_STATIC = Path(__file__).parent / "out" / "_next"
if _NEXT_STATIC.exists():
    app.mount("/_next", StaticFiles(directory=str(_NEXT_STATIC)), name="next_assets")

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

# ── Next.js Static Export — Frontend Routes ───────────────────────────────────
# These routes serve the pre-rendered HTML pages from the Next.js `out/` build.
# Run `npm run build` to regenerate after frontend changes.

def _serve_next_page(page: str) -> HTMLResponse:
    """Read a page from the Next.js static export and return it as HTML."""
    out_dir = Path(__file__).parent / "out"
    html_path = out_dir / page
    if not html_path.exists():
        # Fallback: try index.html in a subdirectory
        html_path = out_dir / page.replace(".html", "") / "index.html"
    if not html_path.exists():
        return HTMLResponse("<h1>Page not found — run <code>npm run build</code></h1>", status_code=404)
    return HTMLResponse(html_path.read_text(encoding="utf-8"))


@app.get("/", response_class=HTMLResponse)
async def serve_home():
    """Serve the Next.js home page."""
    return _serve_next_page("index.html")

@app.get("/workspace", response_class=HTMLResponse)
async def serve_workspace():
    """Serve the Next.js workspace canvas page."""
    return _serve_next_page("workspace.html")

@app.get("/new-task", response_class=HTMLResponse)
async def serve_new_task():
    """Serve the Next.js new-task configuration page."""
    return _serve_next_page("new-task.html")

@app.get("/tasks", response_class=HTMLResponse)
async def serve_tasks():
    """Serve the Next.js tasks list page."""
    return _serve_next_page("tasks.html")

@app.get("/agent-workspace", response_class=HTMLResponse)
async def serve_agent_workspace():
    """Serve the Next.js agent workspace architecture page."""
    return _serve_next_page("agent-workspace.html")

@app.get("/code", response_class=HTMLResponse)
async def serve_code():
    """Serve the Next.js code inspector page."""
    return _serve_next_page("code.html")


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
                    "preview_url": f"/preview/{session_id}/",
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
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )


@app.get("/api/health")
async def health_check():
    """Return API health status."""
    return {"status": "ok", "service": "ForgeAI Multi-Agent Pipeline", "version": "2.4.0"}


@app.get("/api/forge/projects")
async def list_projects():
    """List all generated projects available on disk and in memory."""
    projects = []
    if OUTPUT_BASE.exists():
        for d in sorted(OUTPUT_BASE.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True):
            if d.is_dir():
                file_count = sum(1 for _ in d.rglob("*") if _.is_file())
                has_zip = Path(str(d) + ".zip").exists()
                projects.append({
                    "id": d.name,
                    "name": d.name.replace("-", " ").title(),
                    "path": str(d),
                    "file_count": file_count,
                    "has_zip": has_zip,
                    "updated_at": d.stat().st_mtime,
                })
    return {"projects": projects}


@app.get("/api/forge/{session_id}/files")
async def get_files(session_id: str):
    """Return the generated files (path + content) for a session, checking in-memory and disk."""
    session = sessions.get(session_id)
    if session and "files" in session and session["files"]:
        return {
            "files": [
                {"path": gf.path if hasattr(gf, "path") else gf["path"], 
                 "content": gf.content if hasattr(gf, "content") else gf["content"]}
                for gf in session["files"]
            ]
        }

    # Fallback to disk scan
    target_dir = OUTPUT_BASE / session_id
    if not target_dir.exists():
        for d in OUTPUT_BASE.iterdir():
            if d.is_dir() and (session_id in d.name or d.name in session_id):
                target_dir = d
                break

    if target_dir.exists() and target_dir.is_dir():
        disk_files = []
        for f in sorted(target_dir.rglob("*")):
            if f.is_file() and not f.name.endswith(".zip") and ".git" not in str(f) and "node_modules" not in str(f):
                try:
                    rel = f.relative_to(target_dir).as_posix()
                    content = f.read_text(encoding="utf-8", errors="replace")
                    disk_files.append({"path": rel, "content": content})
                except Exception:
                    pass
        return {"files": disk_files}

    return JSONResponse({"error": "Session not found"}, status_code=404)


@app.get("/api/forge/{session_id}/download")
async def download_zip(session_id: str):
    """Download the generated project as a ZIP file, supporting disk-based archives."""
    session = sessions.get(session_id)
    zip_path = None
    project_name = session_id

    if session and session.get("output_dir"):
        zip_path = Path(session["output_dir"] + ".zip")
        if session.get("plan") and hasattr(session["plan"], "project_name"):
            project_name = session["plan"].project_name
    
    if not zip_path or not zip_path.exists():
        direct_zip = OUTPUT_BASE / f"{session_id}.zip"
        if direct_zip.exists():
            zip_path = direct_zip
        else:
            for z in OUTPUT_BASE.glob("*.zip"):
                if session_id in z.stem or z.stem in session_id:
                    zip_path = z
                    project_name = z.stem
                    break

    if not zip_path or not zip_path.exists():
        target_dir = OUTPUT_BASE / session_id
        if not target_dir.exists():
            for d in OUTPUT_BASE.iterdir():
                if d.is_dir() and (session_id in d.name or d.name in session_id):
                    target_dir = d
                    project_name = d.name
                    break
        if target_dir.exists() and target_dir.is_dir():
            import shutil
            shutil.make_archive(str(target_dir), "zip", str(target_dir))
            zip_path = Path(str(target_dir) + ".zip")

    if not zip_path or not zip_path.exists():
        return JSONResponse({"error": "ZIP not found"}, status_code=404)

    return FileResponse(
        str(zip_path),
        media_type="application/zip",
        filename=f"{project_name}.zip",
    )


@dataclass
class AppInstance:
    session_id: str
    port: int
    process: asyncio.subprocess.Process
    base_url: str

    @property
    def is_alive(self):
        return self.process.returncode is None

registry: Dict[str, AppInstance] = {}

async def get_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("", 0))
        return s.getsockname()[1]

async def launch_app(session_id: str, project_root: str, run_command: str) -> AppInstance:
    port = await get_free_port()
    env = os.environ.copy()
    env["PORT"] = str(port)
    
    process = await asyncio.create_subprocess_shell(
        run_command,
        cwd=project_root,
        env=env,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    
    instance = AppInstance(
        session_id=session_id,
        port=port,
        process=process,
        base_url=f"http://localhost:{port}"
    )
    registry[session_id] = instance
    return instance


@app.post("/api/forge/{session_id}/preview")
async def launch_preview(session_id: str):
    """Launch the generated app and return its reverse proxy URL."""
    session = sessions.get(session_id)

    # Check if already running
    existing = registry.get(session_id)
    if existing and existing.is_alive:
        return {
            "status": "already_running",
            "preview_url": f"/preview/{session_id}/",
            "port": existing.port,
            "base_url": existing.base_url,
        }

    output_dir = session.get("output_dir") if session else None
    manifest = session.get("manifest") if session else None

    # Fallback to disk scan if server was restarted
    if not output_dir or not Path(output_dir).exists():
        target_dir = OUTPUT_BASE / session_id
        if not target_dir.exists():
            for d in OUTPUT_BASE.iterdir():
                if d.is_dir() and (session_id in d.name or d.name in session_id):
                    target_dir = d
                    break
        if target_dir.exists():
            output_dir = str(target_dir)

    if not output_dir:
        return JSONResponse(
            {"error": "Session is incomplete — no output directory found"},
            status_code=400,
        )

    run_cmd = manifest.run_command if manifest else None
    if not run_cmd:
        pkg_json = Path(output_dir) / "package.json"
        if pkg_json.exists():
            run_cmd = "npm start"
        elif (Path(output_dir) / "main.py").exists():
            run_cmd = "python main.py"
        elif (Path(output_dir) / "app.py").exists():
            run_cmd = "python app.py"

    if run_cmd:
        try:
            app_instance = await launch_app(
                session_id=session_id,
                project_root=output_dir,
                run_command=run_cmd,
            )
            return {
                "status": "started",
                "preview_url": f"/preview/{session_id}/",
                "port": app_instance.port,
                "base_url": app_instance.base_url,
            }
        except Exception:
            pass

    # Static preview fallback
    return {
        "status": "static_ready",
        "preview_url": f"/preview/{session_id}/",
        "port": 8000,
        "base_url": f"http://localhost:8000/preview/{session_id}/",
    }


@app.get("/preview/{session_id}/{path:path}")
@app.get("/preview/{session_id}")
async def serve_preview(session_id: str, path: str = ""):
    """Serve preview for the session, either via running process or static files."""
    instance = registry.get(session_id)
    if instance and instance.is_alive:
        import urllib.request
        target_url = f"http://localhost:{instance.port}/{path}"
        try:
            req = urllib.request.Request(target_url)
            with urllib.request.urlopen(req, timeout=4) as response:
                content = response.read()
                content_type = response.headers.get("content-type", "text/html")
                return HTMLResponse(content=content.decode("utf-8", errors="replace"), media_type=content_type)
        except Exception:
            pass

    # Static fallback from disk
    target_dir = OUTPUT_BASE / session_id
    if not target_dir.exists():
        for d in OUTPUT_BASE.iterdir():
            if d.is_dir() and (session_id in d.name or d.name in session_id):
                target_dir = d
                break

    if target_dir.exists():
        file_to_serve = target_dir / (path if path else "index.html")
        if file_to_serve.is_file():
            if file_to_serve.suffix == ".html":
                return HTMLResponse(file_to_serve.read_text(encoding="utf-8", errors="replace"))
            return FileResponse(str(file_to_serve))
        index_file = target_dir / "index.html"
        if index_file.is_file():
            return HTMLResponse(index_file.read_text(encoding="utf-8", errors="replace"))

    return HTMLResponse(
        f"""
        <!DOCTYPE html>
        <html>
        <head><title>Preview - {session_id}</title><style>body {{ background: #0A0D14; color: #E2E8F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }} .box {{ text-align: center; padding: 2.5rem; border-radius: 1.5rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 20px 40px rgba(0,0,0,0.5); backdrop-filter: blur(20px); }} h2 {{ margin-top: 0; color: #60A5FA; }} code {{ background: rgba(255,255,255,0.08); padding: 0.2rem 0.5rem; border-radius: 0.4rem; }}</style></head>
        <body>
            <div class="box">
                <h2>Autonomous Sandbox App</h2>
                <p>Project Identifier: <code>{session_id}</code></p>
                <p style="color: #94A3B8; font-size: 14px;">The code files are active and inspected in the Workspace Code Inspector.</p>
            </div>
        </body>
        </html>
        """
    )


@app.post("/api/forge/{session_id}/preview/stop")
async def stop_preview_endpoint(session_id: str):
    """Stop a running preview app."""
    instance = registry.get(session_id)
    if instance and instance.is_alive:
        try:
            instance.process.terminate()
            del registry[session_id]
            return {"status": "stopped", "session_id": session_id}
        except Exception as e:
            return JSONResponse({"error": str(e)}, status_code=500)
    return JSONResponse(
        {"error": "No active preview for this session"},
        status_code=404,
    )


# ══════════════════════════════════════════════════════════════════════════════
# Entry point
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    
    print("=" * 60)
    print("  ForgeAI Server (LangGraph Pipeline)")
    print("  Open http://localhost:8000 in your browser")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
