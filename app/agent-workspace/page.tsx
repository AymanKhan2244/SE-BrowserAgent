"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bot,
  Layers,
  Sparkles,
  ArrowRight,
  Code2,
  Terminal,
  Globe,
  Bug,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  FileCode,
  Zap,
} from "lucide-react";

interface AgentNodeInfo {
  id: string;
  name: string;
  role: string;
  icon: any;
  badge: string;
  badgeColor: string;
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
      name: "Planner Agent",
      role: "Requirements & Architecture Planning",
      icon: Cpu,
      badge: "ACTIVE",
      badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
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
      name: "Architect Agent",
      role: "File Manifest & DAG Designer",
      icon: Layers,
      badge: "READY",
      badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
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
      name: "Coding Agent",
      role: "Full-Stack Code Synthesizer",
      icon: Code2,
      badge: "READY",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      systemPrompt:
        "You are the Senior Full-Stack Engineer. Synthesize complete, production-ready code files matching the manifest specs.",
      capabilities: [
        "React & Next.js Code Synthesis",
        "FastAPI & Python Logic",
        "Modern Glassmorphism Tailwind Styling",
        "AST Clean Code Formatting",
      ],
      inputSchema: `{ "manifest": "ProjectManifest", "plan": "PlannerOutput" }`,
      outputSchema: `{ "generated_files": "GeneratedFile[]" }`,
      sampleLog: "[CODER] Generated app/page.tsx (3.4 KB) & components/Sidebar.tsx (2.1 KB).",
    },
    {
      id: "debugger",
      name: "Debugger Agent",
      role: "AST Review & Self-Healing",
      icon: Bug,
      badge: "READY",
      badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
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
      name: "Terminal Agent",
      role: "Build & Sandbox Execution",
      icon: Terminal,
      badge: "READY",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      systemPrompt:
        "You are the Build & Sandbox Engineer. Execute npm/pip dependency installations and run static type checking.",
      capabilities: [
        "Subprocess Sandbox Spawning",
        "Virtual Environment Isolation",
        "Dependency Resolution",
        "Exit Code Interception",
      ],
      inputSchema: `{ "manifest": "ProjectManifest" }`,
      outputSchema: `{ "build_status": "string", "exit_code": "number" }`,
      sampleLog: "[TERMINAL] Dependencies installed cleanly. Next.js ready on port 3000.",
    },
    {
      id: "browser",
      name: "Browser Agent",
      role: "Playwright Headless DOM Verification",
      icon: Globe,
      badge: "READY",
      badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      systemPrompt:
        "You are the Autonomous Browser Verification Agent. Navigate the running web app using Playwright CDP, test critical interactive user flows, and capture screenshots.",
      capabilities: [
        "Playwright Chromium Execution",
        "DOM Tree Inspection & Snapshot",
        "Form Filling & Route Validation",
        "Visual Regression & Error Capture",
      ],
      inputSchema: `{ "port": "number", "entrypoint": "string" }`,
      outputSchema: `{ "passed": "boolean", "test_logs": "string[]" }`,
      sampleLog: "[BROWSER] All smoke tests passed. HTTP 200 on all endpoints.",
    },
  ];

  const [selectedAgentId, setSelectedAgentId] = useState<string>("planner");
  const selectedAgent = nodes.find((n) => n.id === selectedAgentId) || nodes[0];

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto w-full pt-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-blue-400" />
            <span>Multi-Agent Orchestration Architecture</span>
          </h1>
          <p className="text-xs text-zinc-400">
            LangGraph stateful agent topology • 6 autonomous specialist nodes
          </p>
        </div>

        <Link
          href="/workspace"
          className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(77,142,255,0.3)] transition-all"
        >
          <span>Launch Live Canvas</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* DAG Flow Visualization Strip */}
      <div className="mb-8 p-5 rounded-3xl bg-[#10141F]/80 backdrop-blur-xl border border-white/[0.08] shadow-xl">
        <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-4">
          Pipeline Flow Execution Graph
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            const isSelected = selectedAgentId === node.id;
            return (
              <React.Fragment key={node.id}>
                <button
                  onClick={() => setSelectedAgentId(node.id)}
                  className={`px-3.5 py-2.5 rounded-2xl border transition-all flex items-center gap-2.5 text-xs shrink-0 ${
                    isSelected
                      ? "bg-blue-600/30 text-white border-blue-500/50 shadow-[0_0_25px_rgba(77,142,255,0.35)]"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-blue-400" : "text-zinc-500"}`} />
                  <span className="font-medium">{node.name}</span>
                </button>
                {index < nodes.length - 1 && (
                  <span className="text-zinc-600 text-xs shrink-0">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Agent Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Node List */}
        <div className="lg:col-span-5 space-y-3">
          {nodes.map((node) => {
            const Icon = node.icon;
            const isSelected = selectedAgentId === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setSelectedAgentId(node.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between group ${
                  isSelected
                    ? "bg-[#141B2B] border-blue-500/40 shadow-[0_0_30px_rgba(77,142,255,0.25)]"
                    : "bg-[#10141F]/80 border-white/[0.08] hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? "bg-blue-600/20 border-blue-500/40 text-blue-400"
                        : "bg-white/[0.05] border-white/[0.08] text-zinc-400 group-hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {node.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{node.role}</div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${node.badgeColor}`}
                >
                  {node.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Node Specification & System Prompt */}
        <div className="lg:col-span-7 rounded-3xl bg-[#10141F]/80 backdrop-blur-xl border border-white/[0.08] p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div>
              <h2 className="text-lg font-bold text-white">{selectedAgent.name}</h2>
              <p className="text-xs text-zinc-400">{selectedAgent.role}</p>
            </div>
            <span
              className={`text-xs font-mono px-3 py-1 rounded-full border ${selectedAgent.badgeColor}`}
            >
              {selectedAgent.badge}
            </span>
          </div>

          {/* System Prompt */}
          <div>
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
              System Instruction
            </div>
            <div className="p-3.5 rounded-2xl bg-[#090C12] border border-white/[0.06] text-xs text-zinc-300 leading-relaxed font-mono">
              {selectedAgent.systemPrompt}
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
              Core Capabilities
            </div>
            <div className="grid grid-cols-2 gap-2">
              {selectedAgent.capabilities.map((cap, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-300 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Schemas */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                Input Schema
              </div>
              <div className="p-2.5 rounded-xl bg-[#090C12] border border-white/[0.06] text-blue-300 text-[11px] overflow-x-auto">
                {selectedAgent.inputSchema}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                Output Schema
              </div>
              <div className="p-2.5 rounded-xl bg-[#090C12] border border-white/[0.06] text-emerald-300 text-[11px] overflow-x-auto">
                {selectedAgent.outputSchema}
              </div>
            </div>
          </div>

          {/* Sample Log */}
          <div>
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
              Sample Subprocess Trace
            </div>
            <div className="p-3 rounded-xl bg-[#090C12] border border-white/[0.06] text-[11px] text-zinc-400 font-mono">
              {selectedAgent.sampleLog}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
