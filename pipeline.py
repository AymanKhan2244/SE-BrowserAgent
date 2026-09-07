"""
Multi-Agent Software Engineering Pipeline
==========================================
Flow:
  1. Planner Agent    – turns the user's request into a structured spec
  2. Architect Agent  – produces an explicit file manifest from the spec
  3. Coding Agent     – generates production-ready source code for every file
  4. Debugger Agent   – reviews & fixes each file
  5. Saver            – writes the project to disk

Run:
  python pipeline.py
  python pipeline.py --query "Build a REST API for a blog with posts and comments"
  python pipeline.py --query "..." --output ./my_project
"""

import os
import sys
import argparse
import zipfile
from pathlib import Path
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv
load_dotenv()

# ── LLM setup ──────────────────────────────────────────────────────────────────
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

LLM = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0.2,
    api_key=os.getenv("GROQ_API_KEY"),
)


# ══════════════════════════════════════════════════════════════════════════════
# Pydantic schemas
# ══════════════════════════════════════════════════════════════════════════════

class PlannerOutput(BaseModel):
    project_name: str = Field(description="Short slug-style project name, e.g. 'todo-app'")
    tech_stack: Dict[str, Any] = Field(
        description="Dict with keys 'backend', 'frontend', 'database'"
    )
    features: List[str] = Field(description="Bullet-list of user-visible features")
    description: str = Field(description="One-paragraph description of the project")


class FileSpec(BaseModel):
    path: str = Field(description="Relative file path, e.g. 'backend/main.py'")
    responsibility: str = Field(description="Single sentence: the ONE thing this file owns")
    imports_from: List[str] = Field(
        default_factory=list,
        description="Paths of other project files this file imports from",
    )


class ProjectManifest(BaseModel):
    project_name: str
    files: List[FileSpec]
    entrypoint: str = Field(
        description="The single file that starts the whole app, e.g. 'backend/main.py'"
    )
    run_command: str = Field(
        description="Shell command to start the app after installing deps, "
                    "e.g. 'uvicorn backend.main:app --reload'"
    )
    install_command: str = Field(
        description="Dependency install command, e.g. 'pip install -r requirements.txt'"
    )


class GeneratedFile(BaseModel):
    path: str = Field(description="Relative file path")
    content: str = Field(description="Complete, production-ready source code for this file")


# ══════════════════════════════════════════════════════════════════════════════
# Agent 1 – Planner
# ══════════════════════════════════════════════════════════════════════════════

PLANNER_PROMPT = ChatPromptTemplate.from_template(
    """You are a senior software architect. Given the user's project description,
produce a structured plan.

RULES:
- Carefully analyze the user's request to determine the required tech stack.
- If the user specifies a tech stack, strictly adhere to it.
- If the user DOES NOT explicitly request a database, DO NOT include a database in the architecture (use simple in-memory data structures or mock data instead).
- Keep the project minimal but fully runnable.

User request:
{query}
"""
)

def planner_agent(query: str) -> PlannerOutput:
    print("\n[1/4] Planner Agent running...")
    chain = PLANNER_PROMPT | LLM.with_structured_output(PlannerOutput)
    result = chain.invoke({"query": query})
    print(f"     Project  : {result.project_name}")
    print(f"     Stack    : {result.tech_stack}")
    print(f"     Features : {len(result.features)} features")
    return result


# ══════════════════════════════════════════════════════════════════════════════
# Agent 2 – Architect
# ══════════════════════════════════════════════════════════════════════════════

ARCHITECT_PROMPT = ChatPromptTemplate.from_template(
    """You are a Principal Software Architect. Given the project specification below,
produce the COMPLETE file manifest for a fully runnable project.

CRITICAL RULES:
1. Follow the exact tech stack specified in the project plan.
2. If the plan does NOT include a database, DO NOT generate any database setup, ORM, or migration files.
3. Every entity or core logic should be well-organized into separate files (e.g., routes, services, models) according to the chosen framework's best practices.
4. Include ALL necessary files: source code, frontend assets (if applicable), configuration, requirements/package files, and README.md.
5. Aim for enough files to be real but not bloated (typically 5-15 files).
6. The app must run with a single main command (e.g., `npm start`, `python main.py`, `uvicorn ...`).

Specification:
{spec}
"""
)

def architect_agent(plan: PlannerOutput) -> ProjectManifest:
    print("\n[2/4] Architect Agent running...")
    spec_text = (
        f"Project: {plan.project_name}\n"
        f"Description: {plan.description}\n"
        f"Tech Stack: {plan.tech_stack}\n"
        f"Features:\n" + "\n".join(f"  - {f}" for f in plan.features)
    )
    chain = ARCHITECT_PROMPT | LLM.with_structured_output(ProjectManifest)
    result = chain.invoke({"spec": spec_text})
    print(f"     Files planned : {len(result.files)}")
    print(f"     Entrypoint    : {result.entrypoint}")
    print(f"     Run with      : {result.run_command}")
    return result


# ══════════════════════════════════════════════════════════════════════════════
# Agent 3 – Coding Agent
# ══════════════════════════════════════════════════════════════════════════════

CODING_PROMPT = ChatPromptTemplate.from_template(
    """You are a Senior Full-Stack Engineer. Write the COMPLETE source code for the file
described below. The code must be production-ready and immediately executable.

=========================================================
PROJECT OVERVIEW
=========================================================
{project_overview}

=========================================================
ALL FILES IN THE PROJECT
=========================================================
{all_files}

=========================================================
ALREADY GENERATED FILES (for context)
=========================================================
{context_files}

=========================================================
FILE TO WRITE NOW
=========================================================
Path        : {file_path}
Responsibility: {responsibility}
May import from: {imports_from}

=========================================================
STRICT RULES
=========================================================
- Return ONLY the raw source code - no markdown fences (no backtick blocks), no explanations.
- The code must be complete and runnable - no placeholders, no TODOs, no ellipsis.
- Use type hints/types, proper docstrings/comments, and error handling.
- For dependency files (e.g., requirements.txt, package.json): list required packages accurately based on the stack.
- For README.md: include setup, install, and run instructions.
- If no database was requested, DO NOT use a database (use in-memory lists/dicts or mocks).
- Ensure cross-origin requests (CORS) are properly handled if separating frontend and backend.
- CRITICAL: The entrypoint file (e.g., app.py, main.py, index.js) MUST explicitly import and register all routes, blueprints, or controllers. Do not just import the file; you must actively register the routes with the application instance to prevent 404 errors.
- CRITICAL: Ensure exact naming consistency for functions, variables, and models across imported files.
"""
)

def coding_agent(manifest: ProjectManifest, plan: PlannerOutput) -> List[GeneratedFile]:
    print(f"\n[3/4] Coding Agent generating {len(manifest.files)} files...")
    project_overview = (
        f"Project: {manifest.project_name}\n"
        f"Description: {plan.description}\n"
        f"Tech Stack: {plan.tech_stack}\n"
        f"Entrypoint: {manifest.entrypoint}\n"
        f"Run: {manifest.run_command}"
    )
    all_files_txt = "\n".join(
        f"  {f.path}  ->  {f.responsibility}" for f in manifest.files
    )

    generated: List[GeneratedFile] = []
    for i, file_spec in enumerate(manifest.files, 1):
        print(f"     [{i:02d}/{len(manifest.files):02d}] Generating {file_spec.path} ...", end=" ", flush=True)
        
        # Build context from previously generated files
        context_files = ""
        for gf in generated:
            if gf.path in file_spec.imports_from or any(dep in gf.path for dep in file_spec.imports_from):
                context_files += f"\n--- {gf.path} ---\n{gf.content}\n"
        if not context_files:
            context_files = "(No dependencies generated yet or no dependencies specified.)"

        try:
            response = (CODING_PROMPT | LLM).invoke(
                {
                    "project_overview": project_overview,
                    "all_files": all_files_txt,
                    "context_files": context_files,
                    "file_path": file_spec.path,
                    "responsibility": file_spec.responsibility,
                    "imports_from": ", ".join(file_spec.imports_from) or "none",
                }
            )
            content = response.content.strip()
            # Strip accidental markdown code fences if the model adds them
            if content.startswith("```"):
                lines = content.splitlines()
                content = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
            generated.append(GeneratedFile(path=file_spec.path, content=content))
            print("OK")
        except Exception as exc:
            print(f"FAILED  ({exc})")
            generated.append(GeneratedFile(path=file_spec.path, content=f"# Generation failed: {exc}\n"))
    return generated


# ══════════════════════════════════════════════════════════════════════════════
# Agent 4 – Debugger Agent
# ══════════════════════════════════════════════════════════════════════════════

DEBUGGER_PROMPT = ChatPromptTemplate.from_template(
    """You are a Principal Software Engineer with 20+ years of experience.
You are acting as an autonomous Debugger Agent.

=========================================================
PROJECT STRUCTURE
=========================================================
{project_structure}

=========================================================
OTHER PROJECT FILES (for cross-file consistency checking)
=========================================================
{cross_file_context}

=========================================================
CURRENT FILE TO DEBUG
=========================================================
Path: {file_path}

=========================================================
GENERATED SOURCE CODE
=========================================================
{code}
{error_section}
=========================================================
YOUR TASK
=========================================================
Thoroughly review the code above and fix ALL issues including:

CODE QUALITY:
- Syntax errors, typos, missing brackets/parens
- Import errors / missing imports / wrong import paths
- Circular imports
- Undefined variables, functions, or classes
- Incorrect API usage or wrong function signatures
- Runtime exceptions (NoneType, KeyError, IndexError, etc.)

FRAMEWORK & LIBRARY:
- Flask: Ensure blueprints are properly registered with the app, routes use correct decorators
- Express/Node: Ensure middleware order is correct, routes are mounted properly
- Missing CORS headers when frontend and backend are separate
- Ensure the entrypoint file actually imports and registers all routes/blueprints
- Async/Await mistakes (missing await, sync calls in async context)

CROSS-FILE CONSISTENCY:
- Verify all imports reference functions/classes that actually exist in the other files
- Check that function signatures match how they are called from other files
- Ensure HTML files reference correct CSS/JS file paths
- Ensure API endpoint URLs in frontend JS match the backend route definitions
- Verify model/schema field names are consistent across files

DEPENDENCY FILES:
- If this is requirements.txt or package.json, ensure ALL packages used in the code are listed
- Verify version compatibility

Also improve: exception handling, type hints, logging, structure.

=========================================================
STRICT RULES
=========================================================
- Return ONLY the corrected source code. NO markdown fences. NO explanations.
- Do NOT wrap the code in ``` backtick blocks.
- Do NOT truncate. Return the COMPLETE file.
- Do NOT add TODO comments or placeholders.
- PRESERVE all existing functionality.
- If the file is already correct, return it as-is.
"""
)

import concurrent.futures
import time as _time
import re as _re


def _strip_markdown_fences(content: str) -> str:
    """Remove markdown code fences from LLM output, handling various formats."""
    content = content.strip()
    # Match opening fence with optional language tag: ```python, ```js, ```html, etc.
    if _re.match(r'^```\w*\s*$', content.splitlines()[0] if content else ''):
        lines = content.splitlines()
        # Find the closing fence
        if lines[-1].strip() == '```':
            content = '\n'.join(lines[1:-1])
        else:
            content = '\n'.join(lines[1:])
    return content


def debugger_agent(generated_files: List[GeneratedFile], errors: str = None) -> List[GeneratedFile]:
    """
    Debug all generated files with cross-file context awareness.
    Uses sequential processing with retry/backoff to avoid rate limits.
    """
    blacklist_extensions = {
        '.md', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.ico',
        '.gitignore', '.env', '.toml', '.lock', '.zip', '.svg',
    }

    files_to_debug = []
    skipped_files = []

    for gf in generated_files:
        ext = Path(gf.path).suffix.lower()
        if ext in blacklist_extensions:
            skipped_files.append(gf)
            continue

        if errors:
            filename = Path(gf.path).name
            if gf.path in errors or filename in errors:
                files_to_debug.append(gf)
            else:
                skipped_files.append(gf)
        else:
            files_to_debug.append(gf)

    print(f"\n[DEBUGGER] Reviewing {len(files_to_debug)}/{len(generated_files)} files (skipped {len(skipped_files)})...")
    if not files_to_debug:
        return generated_files

    project_structure = "\n".join(f"  {f.path}" for f in generated_files)
    chain = DEBUGGER_PROMPT | LLM

    error_section = ""
    if errors:
        # Truncate very long error output to avoid token limits
        truncated_errors = errors[:3000] if len(errors) > 3000 else errors
        error_section = (
            f"\n=========================================================\n"
            f"PREVIOUS ERRORS (Address these!)\n"
            f"=========================================================\n"
            f"{truncated_errors}\n"
        )

    def _build_cross_file_context(current_path: str) -> str:
        """Build a summary of all other files for cross-file consistency checking."""
        context_parts = []
        for gf in generated_files:
            if gf.path == current_path:
                continue
            # For code files, include the full content (truncated if very large)
            file_content = gf.content
            if len(file_content) > 2000:
                file_content = file_content[:2000] + "\n... (truncated)"
            context_parts.append(f"--- {gf.path} ---\n{file_content}")
        return "\n\n".join(context_parts) if context_parts else "(No other files in the project)"

    def debug_file_with_retry(gf: GeneratedFile, max_retries: int = 3) -> GeneratedFile:
        """Debug a single file with retry logic for rate limit errors."""
        cross_context = _build_cross_file_context(gf.path)

        for attempt in range(max_retries):
            print(f"     [>] Debugging {gf.path} ...", flush=True)
            try:
                response = chain.invoke(
                    {
                        "project_structure": project_structure,
                        "cross_file_context": cross_context,
                        "file_path": gf.path,
                        "code": gf.content,
                        "error_section": error_section,
                    }
                )
                content = _strip_markdown_fences(response.content.strip())
                print(f"     [OK] {gf.path}", flush=True)
                return GeneratedFile(path=gf.path, content=content)

            except Exception as exc:
                exc_str = str(exc)
                # Handle rate limit errors with backoff
                if "429" in exc_str or "rate_limit" in exc_str.lower():
                    # Try to extract the retry delay from the error message
                    wait_match = _re.search(r'try again in (\d+\.?\d*)', exc_str)
                    wait_time = float(wait_match.group(1)) + 1.0 if wait_match else (5.0 * (attempt + 1))
                    print(f"     [RATE LIMITED] {gf.path} — waiting {wait_time:.1f}s (attempt {attempt + 1}/{max_retries})", flush=True)
                    _time.sleep(wait_time)
                    continue
                else:
                    print(f"     [FAILED] {gf.path} (keeping original — {exc})", flush=True)
                    return gf

        print(f"     [FAILED] {gf.path} (max retries exhausted)", flush=True)
        return gf

    # Process files sequentially to avoid rate limits
    # (Groq's free tier has very low TPM limits)
    fixed_files = []
    for gf in files_to_debug:
        fixed = debug_file_with_retry(gf)
        fixed_files.append(fixed)

    debug_map = {gf.path: gf for gf in fixed_files}
    result = []
    for gf in generated_files:
        if gf.path in debug_map:
            result.append(debug_map[gf.path])
        else:
            result.append(gf)

    return result



# ══════════════════════════════════════════════════════════════════════════════
# Saver – write files to disk + create zip
# ══════════════════════════════════════════════════════════════════════════════

# ══════════════════════════════════════════════════════════════════════════════
# Agent 5 – Terminal Agent (install deps + compile check)
# ══════════════════════════════════════════════════════════════════════════════

import subprocess

def terminal_agent(project_path: str, install_command: str) -> dict:
    """
    Runs inside the generated project folder:
    1. pip install -r requirements.txt
    2. python -m py_compile on every .py file
    Returns a dict with success, executed_commands, stdout, stderr, exit_code.
    """
    print(f"\n[5/5] Terminal Agent running in '{project_path}'...")
    root = Path(project_path)
    commands: list = []
    stdout_logs: list = []
    stderr_logs: list = []
    final_exit_code = 0

    # --- Install dependencies ---
    if (root / "requirements.txt").exists():
        commands.append(install_command)
    else:
        print("     WARNING: requirements.txt not found, skipping install")

    # --- Compile-check every Python file ---
    py_files = list(root.rglob("*.py"))
    if py_files:
        relative_paths = " ".join(str(p.relative_to(root)) for p in py_files)
        commands.append(f"python -m py_compile {relative_paths}")

    for command in commands:
        print(f"     $ {command}")
        try:
            result = subprocess.run(
                command,
                cwd=str(root),
                shell=True,
                capture_output=True,
                text=True,
                timeout=120,
            )
            stdout_logs.append(f"\n===== {command} =====\n{result.stdout}")
            stderr_logs.append(f"\n===== {command} =====\n{result.stderr}")
            if result.returncode != 0:
                final_exit_code = result.returncode
                print(f"     FAILED (exit {result.returncode})")
                if result.stderr:
                    print(f"     {result.stderr[:300]}")
            else:
                print("     OK")
        except subprocess.TimeoutExpired:
            stderr_logs.append(f"\n===== {command} =====\nTIMEOUT")
            final_exit_code = -1
            print("     TIMEOUT")
        except Exception as exc:
            stderr_logs.append(f"\n===== {command} =====\n{exc}")
            final_exit_code = -1
            print(f"     ERROR: {exc}")

    result_dict = {
        "success": final_exit_code == 0,
        "executed_commands": commands,
        "stdout": "\n".join(stdout_logs),
        "stderr": "\n".join(stderr_logs),
        "exit_code": final_exit_code,
    }
    if result_dict["success"]:
        print("     All checks passed!")
    else:
        print("     Some checks failed - see stderr above")
    return result_dict


# ══════════════════════════════════════════════════════════════════════════════
# Agent 6 – Browser Agent (Playwright smoke tests)
# ══════════════════════════════════════════════════════════════════════════════

import time
import socket
import threading
import urllib.request
import urllib.error

def _detect_port(run_command: str) -> int:
    """
    Infer the local port from the project's run command.
    Supports Flask (5000), Uvicorn/FastAPI (8000), Node/npm (3000).
    Falls back to 8000.
    """
    import re
    # Explicit --port flag  (uvicorn, gunicorn, etc.)
    m = re.search(r"--port[=\s]+(\d+)", run_command)
    if m:
        return int(m.group(1))
    # Flask / python app.py
    if "flask" in run_command.lower() or "app.py" in run_command.lower():
        return 5000
    # Node / npm
    if "node" in run_command.lower() or "npm" in run_command.lower():
        return 3000
    # uvicorn / fastapi default
    if "uvicorn" in run_command.lower() or "fastapi" in run_command.lower():
        return 8000
    return 8000


def _find_chromium_executable() -> Optional[str]:
    """
    Auto-discover the Playwright Chromium executable installed on this machine.
    Looks in ms-playwright cache for the latest chromium-XXXX folder.
    Returns None if not found (Playwright will use its default, which may fail
    if the headless-shell is not installed).
    """
    import glob as _glob
    candidates = [
        os.path.expandvars(r"%LOCALAPPDATA%\ms-playwright"),  # Windows
        os.path.expanduser("~/.cache/ms-playwright"),           # Linux
        os.path.expanduser("~/Library/Caches/ms-playwright"),  # macOS
    ]
    for base in candidates:
        if not os.path.isdir(base):
            continue
        dirs = sorted(
            [d for d in _glob.glob(os.path.join(base, "chromium-*"))
             if os.path.isdir(d) and "headless" not in d],
            reverse=True,
        )
        for d in dirs:
            for exe_name in (
                "chrome-win64/chrome.exe",
                "chrome-linux/chrome",
                "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
            ):
                exe = os.path.join(d, exe_name)
                if os.path.isfile(exe):
                    return exe
    return None


def _wait_for_server(host: str, port: int, timeout: int = 60) -> bool:
    """
    Poll until http://host:port/ responds or timeout (seconds) is reached.
    First waits for TCP connectivity, then confirms with an HTTP GET.
    Returns True if the server is ready, False otherwise.
    """
    url = f"http://{host}:{port}/"
    deadline = time.time() + timeout

    # Phase 1: wait for TCP port to accept connections
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=2):
                break  # port is open
        except (OSError, ConnectionRefusedError):
            time.sleep(0.5)
    else:
        return False  # TCP never became reachable

    # Phase 2: wait for HTTP to return a non-error response
    while time.time() < deadline:
        try:
            resp = urllib.request.urlopen(url, timeout=3)
            if resp.status < 500:
                return True
        except urllib.error.HTTPError as e:
            # If we got an HTTP error, the server responded, so it is up
            if e.code < 500:
                return True
        except (urllib.error.URLError, OSError):
            pass
        time.sleep(0.5)
    return False


def browser_agent(
    project_root: str,
    run_command: str,
    host: str = "127.0.0.1",
) -> dict:
    """
    Step 6 – Browser Agent.

    1. Starts the generated app as a background subprocess.
    2. Waits for the HTTP server to be ready.
    3. Uses Playwright (sync API) to:
       - Navigate to the app URL.
       - Perform generic smoke tests (title present, no HTTP 500, screenshot).
    4. Kills the app process.
    5. Returns a result dict.
    """
    print(f"\n[6/6] Browser Agent testing the generated app...")
    root = Path(project_root)
    port = _detect_port(run_command)
    url = f"http://{host}:{port}/"
    print(f"     App URL      : {url}")
    print(f"     Run command  : {run_command}")

    # ── Start the app ─────────────────────────────────────────────────────────
    # Set env vars to prevent common startup issues:
    #   FLASK_DEBUG=0  – disables the Werkzeug reloader (avoids double-spawn delay)
    #   PYTHONUNBUFFERED=1 – ensures output isn't silently buffered
    env = os.environ.copy()
    env["FLASK_DEBUG"] = "0"
    env["PYTHONUNBUFFERED"] = "1"

    try:
        app_process = subprocess.Popen(
            run_command,
            cwd=str(root),
            shell=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            env=env,
        )
    except Exception as exc:
        print(f"     ERROR: Could not start the app: {exc}")
        return {
            "success": False,
            "url": url,
            "error": str(exc),
            "screenshot_path": None,
        }

    # Check that the process hasn't immediately crashed
    time.sleep(1)
    if app_process.poll() is not None:
        print(f"CRASHED (exit code {app_process.returncode})")
        return {
            "success": False,
            "url": url,
            "error": f"App process exited immediately with code {app_process.returncode}",
            "screenshot_path": None,
        }

    # ── Wait for server to be ready ───────────────────────────────────────────
    print("     Waiting for server to be ready...", end=" ", flush=True)
    ready = _wait_for_server(host, port, timeout=60)
    if not ready:
        app_process.kill()
        print("TIMEOUT")
        return {
            "success": False,
            "url": url,
            "error": "Server did not start within 30 seconds.",
            "screenshot_path": None,
        }
    print("READY")

    # ── Playwright smoke tests ────────────────────────────────────────────────
    screenshot_path = str(root / "browser_test_screenshot.png")
    errors = []
    page_title = ""
    status_code = None

    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as pw:
            # Use full Chromium directly (avoids dependency on headless-shell)
            chromium_exe = _find_chromium_executable()
            launch_kwargs: dict = {"headless": True}
            if chromium_exe:
                launch_kwargs["executable_path"] = chromium_exe
            browser = pw.chromium.launch(**launch_kwargs)
            context = browser.new_context()
            page = context.new_page()

            # Navigate with response capture
            try:
                response = page.goto(url, wait_until="networkidle", timeout=15000)
                status_code = response.status if response else None
                if status_code and status_code >= 500:
                    errors.append(f"HTTP {status_code} returned by the server.")
            except Exception as nav_exc:
                errors.append(f"Navigation failed: {nav_exc}")

            # Wait a moment for JS to settle
            page.wait_for_timeout(2000)

            # Smoke test 1: page title is not empty
            page_title = page.title()
            if not page_title.strip():
                errors.append("Page title is empty — the page may not have loaded correctly.")
            else:
                print(f"     Page title   : {page_title}")

            # Smoke test 2: body has visible text content
            body_text = page.locator("body").inner_text(timeout=5000)
            if len(body_text.strip()) < 5:
                errors.append("Page body appears empty — the app may have crashed.")

            # Screenshot
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"     Screenshot   : {screenshot_path}")

            context.close()
            browser.close()

    except ImportError:
        errors.append(
            "Playwright is not installed. Run: pip install playwright && playwright install"
        )
    except Exception as exc:
        errors.append(f"Playwright error: {exc}")
    finally:
        # Always kill the app subprocess
        app_process.kill()
        try:
            app_process.wait(timeout=5)
        except Exception:
            pass

    success = len(errors) == 0
    if success:
        print("     All smoke tests passed!")
    else:
        print(f"     {len(errors)} smoke test(s) failed:")
        for err in errors:
            print(f"       - {err}")

    return {
        "success": success,
        "url": url,
        "page_title": page_title,
        "status_code": status_code,
        "errors": errors,
        "screenshot_path": screenshot_path if Path(screenshot_path).exists() else None,
    }


# ══════════════════════════════════════════════════════════════════════════════
# Saver – write files to disk + create zip
# ══════════════════════════════════════════════════════════════════════════════

def save_project(
    files: List[GeneratedFile],
    manifest: ProjectManifest,
    root: str = "generated_project",
) -> Path:
    root_path = Path(root)
    root_path.mkdir(parents=True, exist_ok=True)

    for gf in files:
        full_path = root_path / gf.path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_text(gf.content, encoding="utf-8")

    # Write a top-level SETUP.md with run instructions
    setup_md = (
        f"# {manifest.project_name}\n\n"
        f"## Setup\n\n"
        f"```bash\n"
        f"cd {root}\n"
        f"{manifest.install_command}\n"
        f"```\n\n"
        f"## Run\n\n"
        f"```bash\n"
        f"{manifest.run_command}\n"
        f"```\n\n"
        f"## Entrypoint\n"
        f"`{manifest.entrypoint}`\n"
    )
    (root_path / "SETUP.md").write_text(setup_md, encoding="utf-8")

    # Create a zip archive next to the project folder
    zip_path = Path(root + ".zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for gf in files:
            zf.write(root_path / gf.path, gf.path)
        zf.writestr("SETUP.md", setup_md)

    print(f"\nProject saved  ->  {root_path.resolve()}")
    print(f"Zip archive    ->  {zip_path.resolve()}")
    return root_path


# ══════════════════════════════════════════════════════════════════════════════
# Validation – quick sanity check
# ══════════════════════════════════════════════════════════════════════════════

def validate_project(files: List[GeneratedFile], manifest: ProjectManifest) -> None:
    print("\nValidating project...")
    paths = {gf.path for gf in files}

    if manifest.entrypoint in paths:
        print(f"     Entrypoint found     : {manifest.entrypoint}")
    else:
        print(f"     WARNING: Entrypoint MISSING : {manifest.entrypoint}")

    if any("requirements.txt" in p for p in paths):
        print("     requirements.txt found")
    else:
        print("     WARNING: requirements.txt NOT found")

    tiny = [gf.path for gf in files if len(gf.content.strip()) < 10]
    if tiny:
        print(f"     WARNING: Suspiciously short files: {tiny}")
    else:
        print(f"     All {len(files)} files have content")


# ══════════════════════════════════════════════════════════════════════════════
# Main pipeline
# ══════════════════════════════════════════════════════════════════════════════

def run_pipeline(query: str, output_dir: str = "generated_project") -> None:
    print("=" * 60)
    print("  Multi-Agent Software Engineering Pipeline")
    print("=" * 60)
    print(f"\nQuery: {query}\n")

    # 1. Plan
    plan = planner_agent(query)

    # 2. Architect
    manifest = architect_agent(plan)

    # 3. Code
    current_files = coding_agent(manifest, plan)

    # iterative debug
    max_iterations = 3
    errors = None
    terminal_result = None
    root = None

    for iteration in range(max_iterations):
        if iteration > 0:
            print(f"\n--- Debug Iteration {iteration + 1} ---")
            
        # 4. Debug
        current_files = debugger_agent(current_files, errors=errors)

        # 5. Validate
        validate_project(current_files, manifest)

        # 6. Save to disk first (so terminal agent can operate on files)
        root = save_project(current_files, manifest, root=output_dir)

        # 7. Terminal agent – install + compile check
        terminal_result = terminal_agent(
            project_path=str(root),
            install_command=manifest.install_command,
        )
        
        if terminal_result["success"]:
            print("\n  No errors found, stopping iteration.")
            break
        else:
            errors = terminal_result["stderr"]
            print(f"\n  Errors found, passing to next debug iteration...")

    if not terminal_result["success"]:
        print("\n  NOTE: Some install/compile checks failed after maximum iterations.")
        print("  Review the generated project and fix errors manually.")
        print("  stderr summary:")
        for line in terminal_result["stderr"].splitlines()[:20]:
            print(f"    {line}")

    # 8. Browser Agent – smoke test the running app
    browser_result = browser_agent(
        project_root=str(root),
        run_command=manifest.run_command,
    )

    print("\n" + "=" * 60)
    print("  Pipeline complete!")
    print("=" * 60)
    print(f"\n  Project : {manifest.project_name}")
    print(f"  Files   : {len(current_files)}")
    print(f"  Folder  : {root.resolve()}")
    status_icon = "OK" if terminal_result["success"] else "WARNINGS"
    print(f"\n  Install check  : {status_icon}")
    browser_icon = "OK" if browser_result["success"] else "WARNINGS"
    print(f"  Browser tests  : {browser_icon}")
    if browser_result.get("screenshot_path"):
        print(f"  Screenshot     : {browser_result['screenshot_path']}")
    print(f"\n  To run the app:")
    print(f"    cd {root}")
    print(f"    {manifest.install_command}")
    print(f"    {manifest.run_command}")
    print()



# ══════════════════════════════════════════════════════════════════════════════
# CLI entry point
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Multi-Agent Software Engineering Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python pipeline.py
  python pipeline.py --query "Build a REST API for a blog with posts and comments"
  python pipeline.py --query "..." --output ./blog_project
        """,
    )
    parser.add_argument(
        "--query",
        type=str,
        default=None,
        help="Describe the project you want to build",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="generated_project",
        help="Output directory for the generated project (default: generated_project)",
    )
    args = parser.parse_args()

    if args.query:
        query = args.query
    else:
        print("Describe the project you want to build.")
        print("Examples:")
        print("  - A todo list app with add, complete, and delete")
        print("  - A blog REST API with posts and comments")
        print("  - A student grade tracker\n")
        query = input("Your request: ").strip()
        if not query:
            print("No query provided. Exiting.")
            sys.exit(1)

    run_pipeline(query, output_dir=args.output)
