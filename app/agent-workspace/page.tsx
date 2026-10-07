"use client";

import React, { useState } from "react";
import Link from "next/link";

interface AgentNodeInfo {
  id: string;
  name: string;
  role: string;
  badge: string;
  badgeStyle: string;
  systemPrompt: string;
  capabilities: string[];
  inputSchema: string;
  outputSchema: string;
  sampleLog: string;
}

export default function AgentWorkspacePage() {
  const nodes: AgentNodeInfo[] = [
    {
      id: "planner",
      name: "01 PLANNER AGENT",
      role: "Requirements & Tech Stack Specialist",
      badge: "ACTIVE",
      badgeStyle: "bg-primary-fixed text-on-primary-fixed border-surface-container-lowest",
      systemPrompt:
        "You are the Lead Technical Planner. Analyze user requirements, determine optimal architecture, select framework and database dependencies, and output structured engineering specification.",
      capabilities: [
        "Prompt Specification Parsing",
        "Framework & Database Selection",
        "Feature Decomposition & Mapping",
        "Dependency Constraint Resolution",
      ],
      inputSchema: `{ "query": "string", "autonomy_level": "string" }`,
      outputSchema: `{ "project_name": "string", "tech_stack": "object", "features": "string[]" }`,
      sampleLog: "[PLANNER] Tech stack identified: Next.js 14, Tailwind, TypeScript. Features count: 6.",
    },
    {
      id: "architect",
      name: "02 ARCHITECT AGENT",
      role: "File Manifest & DAG Designer",
      badge: "READY",
      badgeStyle: "bg-secondary-container text-on-secondary-container border-outline",
      systemPrompt:
        "You are the Solutions Architect. Design the project directory tree, file manifests, entrypoint script paths, and build/run scripts.",
      capabilities: [
        "Directory Tree Schema Design",
        "Entrypoint Resolution",
        "Build & Run Script Generation",
        "Import Path Resolution Graphing",
      ],
      inputSchema: `{ "plan": "PlannerOutput" }`,
      outputSchema: `{ "files": "FileSpec[]", "entrypoint": "string", "run_command": "string" }`,
      sampleLog: "[ARCHITECT] Created project manifest: 12 files. Entrypoint: app/page.tsx.",
    },
    {
      id: "coder",
      name: "03 CODING AGENT",
      role: "Full-Stack Code Synthesizer",
      badge: "READY",
      badgeStyle: "bg-secondary-container text-on-secondary-container border-outline",
      systemPrompt:
        "You are the Senior Full-Stack Engineer. Synthesize complete, production-ready code files matching the manifest specs.",
      capabilities: [
        "React & Next.js Code Synthesis",
        "FastAPI & Python Logic",
        "Neo-Brutalist Tailwind Styling",
        "AST Clean Code Formatting",
      ],
      inputSchema: `{ "manifest": "ProjectManifest", "plan": "PlannerOutput" }`,
      outputSchema: `{ "generated_files": "GeneratedFile[]" }`,
      sampleLog: "[CODER] Generated app/page.tsx (3.4 KB) & components/Sidebar.tsx (2.1 KB).",
    },
    {
      id: "debugger",
      name: "04 DEBUGGER AGENT",
      role: "AST Review & Self-Healing Agent",
      badge: "READY",
      badgeStyle: "bg-secondary-container text-on-secondary-container border-outline",
      systemPrompt:
        "You are the AST Syntax Inspector & Self-Healing Debugger. Parse code for type errors, missing imports, or runtime crashes and repair them.",
      capabilities: [
        "AST Code Tree Verification",
        "Missing Import Resolution",
        "Self-Healing Code Hotpatching",
        "Subprocess Log Traceback Analysis",
      ],
      inputSchema: `{ "generated_files": "GeneratedFile[]", "errors": "string" }`,
      outputSchema: `{ "debugged_files": "GeneratedFile[]" }`,
      sampleLog: "[DEBUGGER] Syntax verification complete. 0 AST errors detected.",
    },
    {
      id: "terminal",
      name: "05 TERMINAL AGENT",
      role: "Build & Package Verification",
      badge: "READY",
      badgeStyle: "bg-secondary-container text-on-secondary-container border-outline",
      systemPrompt:
        "You are the Build & Sandbox Engineer. Execute npm/pip dependency installations and run static type checking.",
      inputSchema: `{ "project_root": "string", "install_command": "string" }`,
      outputSchema: `{ "success": "boolean", "stderr": "string", "executed_commands": "string[]" }`,
      capabilities: [
        "Subprocess Execution",
        "Dependency Resolution (npm/pip)",
        "Build & Linting Verification",
        "Terminal Stderr Intercept",
      ],
      sampleLog: "[TERMINAL] Dependencies resolved. Build exit code 0.",
    },
    {
      id: "browser",
      name: "06 BROWSER AGENT",
      role: "Playwright CDP E2E Smoke Tester",
      badge: "READY",
      badgeStyle: "bg-secondary-container text-on-secondary-container border-outline",
      systemPrompt:
        "You are the Playwright E2E Tester. Launch the generated web app in a headless browser, interact with buttons, and verify DOM functionality.",
      inputSchema: `{ "project_root": "string", "run_command": "string" }`,
      outputSchema: `{ "success": "boolean", "page_title": "string", "screenshot_path": "string" }`,
      capabilities: [
        "Playwright Headless Chrome Control",
        "DOM Event & Form Intercept",
        "Automated Screenshot Capture",
        "E2E Smoke Verification",
      ],
      sampleLog: "[BROWSER] Playwright smoke test passed. Page Title: 'SE BROWSER AGENT'.",
    },
  ];

  const [selectedId, setSelectedId] = useState("planner");
  const selectedNode = nodes.find((n) => n.id === selectedId) || nodes[0];

  return (
    <div className="p-6 max-w-[1600px] mx-auto flex flex-col gap-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-2 border-outline-variant bg-surface-container-low p-5 shadow-[4px_4px_0px_#000000]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed text-[10px] font-label-sm font-bold">
              LANGGRAPH DAG v2.4
            </span>
            <span className="text-on-surface-variant font-code-stream text-xs">
              / GRAPH / ORCHESTRATION_NODES
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface uppercase">
            MULTI-AGENT ARCHITECTURE &amp; MEMORY GRAPH
          </h1>
          <p className="font-code-stream text-code-stream text-on-surface-variant text-sm mt-1">
            Inspect individual agent node instructions, capabilities, input/output schemas, and execution state graph.
          </p>
        </div>
        <Link
          href="/workspace"
          className="px-5 py-2.5 bg-primary-fixed text-on-primary-fixed font-headline-md font-bold text-sm uppercase flex items-center gap-2 border-2 border-surface-container-lowest shadow-[3px_3px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <span className="material-symbols-outlined text-base font-bold">terminal</span>
          <span>[OPEN WORKSPACE &gt;]</span>
        </Link>
      </div>

      {/* HORIZONTAL DAG CHAIN FLOW */}
      <div className="border-2 border-outline-variant bg-surface-container-low p-4 shadow-[4px_4px_0px_#000000] overflow-x-auto">
        <div className="flex items-center gap-3 min-w-[950px] justify-between font-code-stream text-xs">
          <div className="px-3 py-2 bg-surface-container-lowest border-2 border-outline-variant font-bold text-on-surface">
            START
          </div>
          <span className="text-secondary-container font-bold">&gt;&gt;</span>

          {nodes.map((node) => {
            const isSelected = node.id === selectedId;
            return (
              <React.Fragment key={node.id}>
                <button
                  onClick={() => setSelectedId(node.id)}
                  className={`p-3 border-2 shadow-[2px_2px_0px_#000000] flex-1 text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-surface-container border-primary-fixed shadow-[3px_3px_0px_#fde400]"
                      : "bg-surface-container-lowest border-outline-variant hover:border-on-surface"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-1.5 py-0.2 font-label-sm text-[9px] font-bold border ${node.badgeStyle}`}>
                      {node.badge}
                    </span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-primary-fixed animate-ping"></span>}
                  </div>
                  <div className={`font-bold text-[11px] truncate ${isSelected ? "text-primary-fixed" : "text-on-surface"}`}>
                    {node.name}
                  </div>
                  <div className="text-[9px] text-on-surface-variant truncate mt-0.5">{node.role}</div>
                </button>
                <span className="text-secondary-container font-bold">&gt;&gt;</span>
              </React.Fragment>
            );
          })}

          <div className="px-3 py-2 bg-surface-container-lowest border-2 border-primary-fixed font-bold text-primary-fixed">
            END
          </div>
        </div>
      </div>

      {/* SELECTED NODE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: System Prompt & Capabilities (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="border-2 border-outline-variant bg-surface-container-low shadow-[4px_4px_0px_#000000] p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
              <span className="font-headline-md font-bold text-primary-fixed uppercase">
                {selectedNode.name} — SYSTEM SPECIFICATION
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold border ${selectedNode.badgeStyle}`}>
                {selectedNode.badge}
              </span>
            </div>

            <div>
              <span className="font-code-stream text-[10px] text-on-surface-variant uppercase font-bold">
                SYSTEM PROMPT &amp; INSTRUCTIONS
              </span>
              <p className="mt-1.5 p-3 bg-surface-container-lowest border border-outline-variant font-code-stream text-xs text-on-surface leading-relaxed">
                {selectedNode.systemPrompt}
              </p>
            </div>

            <div>
              <span className="font-code-stream text-[10px] text-on-surface-variant uppercase font-bold mb-1.5 block">
                NODE CAPABILITIES &amp; AGENT ACTIONS
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-code-stream text-xs">
                {selectedNode.capabilities.map((cap, idx) => (
                  <div key={idx} className="p-2 bg-surface-container-lowest border border-outline-variant text-on-surface flex items-center gap-2">
                    <span className="text-secondary-container font-bold">▸</span>
                    {cap}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Schemas & Log Emissions (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="border-2 border-outline-variant bg-surface-container-low shadow-[4px_4px_0px_#000000] p-4 flex flex-col gap-4 font-code-stream text-xs">
            <div className="font-headline-md font-bold text-secondary-container border-b border-outline-variant pb-2">
              STATE SCHEMA &amp; TELEMETRY
            </div>

            <div>
              <span className="text-on-surface-variant font-bold text-[10px] uppercase">INPUT STATE SCHEMA</span>
              <pre className="mt-1 p-2 bg-surface-container-lowest border border-outline-variant text-secondary-container text-xs overflow-x-auto">
                {selectedNode.inputSchema}
              </pre>
            </div>

            <div>
              <span className="text-on-surface-variant font-bold text-[10px] uppercase">OUTPUT STATE SCHEMA</span>
              <pre className="mt-1 p-2 bg-surface-container-lowest border border-outline-variant text-primary-fixed text-xs overflow-x-auto">
                {selectedNode.outputSchema}
              </pre>
            </div>

            <div>
              <span className="text-on-surface-variant font-bold text-[10px] uppercase">RECENT TELEMETRY LOG</span>
              <div className="mt-1 p-2 bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-mono">
                {selectedNode.sampleLog}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
