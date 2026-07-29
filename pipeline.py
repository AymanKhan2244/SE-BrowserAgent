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
from typing import List, Dict, Any

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
CURRENT FILE
=========================================================
Path: {file_path}

=========================================================
GENERATED SOURCE CODE
=========================================================
{code}

=========================================================
YOUR TASK
=========================================================
Review the code above and fix ALL issues including:
- Syntax errors                - Import errors / missing imports
- Circular imports             - Undefined variables or functions
- Incorrect API usage          - Runtime exceptions
- Logic bugs                   - Framework/Library misuse
- Missing CORS headers         - Security issues
- Async/Await mistakes         - Data persistence issues (if DB is used)

Also improve: exception handling, type hints, logging, structure.

=========================================================
STRICT RULES
=========================================================
- Return ONLY the corrected source code. NO markdown fences. NO explanations.
- Do NOT truncate. Return the COMPLETE file.
- Do NOT add TODO comments or placeholders.
- PRESERVE all existing functionality.
- If the file is already correct, return it as-is.
"""
)

def debugger_agent(generated_files: List[GeneratedFile]) -> List[GeneratedFile]:
    print(f"\n[4/4] Debugger Agent reviewing {len(generated_files)} files...")
    project_structure = "\n".join(f"  {f.path}" for f in generated_files)
    chain = DEBUGGER_PROMPT | LLM
    fixed: List[GeneratedFile] = []
    for i, gf in enumerate(generated_files, 1):
        print(f"     [{i:02d}/{len(generated_files):02d}] Debugging {gf.path} ...", end=" ", flush=True)
        try:
            response = chain.invoke(
                {
                    "project_structure": project_structure,
                    "file_path": gf.path,
                    "code": gf.content,
                }
            )
            content = response.content.strip()
            if content.startswith("```"):
                lines = content.splitlines()
                content = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
            fixed.append(GeneratedFile(path=gf.path, content=content))
            print("OK")
        except Exception as exc:
            print(f"FAILED (keeping original -- {exc})")
            fixed.append(gf)
    return fixed


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
    generated = coding_agent(manifest, plan)

    # 4. Debug
    debugged = debugger_agent(generated)

    # 5. Validate
    validate_project(debugged, manifest)

    # 6. Save to disk first (so terminal agent can operate on files)
    root = save_project(debugged, manifest, root=output_dir)

    # 7. Terminal agent – install + compile check
    terminal_result = terminal_agent(
        project_path=str(root),
        install_command=manifest.install_command,
    )
    if not terminal_result["success"]:
        print("\n  NOTE: Some install/compile checks failed.")
        print("  Review the generated project and fix errors manually.")
        print("  stderr summary:")
        for line in terminal_result["stderr"].splitlines()[:20]:
            print(f"    {line}")

    print("\n" + "=" * 60)
    print("  Pipeline complete!")
    print("=" * 60)
    print(f"\n  Project : {manifest.project_name}")
    print(f"  Files   : {len(debugged)}")
    print(f"  Folder  : {root.resolve()}")
    status_icon = "OK" if terminal_result["success"] else "WARNINGS"
    print(f"\n  Install check : {status_icon}")
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
