"""
LangGraph Workflow
==================
Defines the multi-agent pipeline as a LangGraph StateGraph.
Imported by server.py to run the pipeline via graph.stream().
"""

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
