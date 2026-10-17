"use client";

import React, { useState } from "react";
import WorkspacePage from "./workspace/page";
import Link from "next/link";
import {
  Box,
  LayoutGrid,
  Sparkles,
  ArrowRight,
  Terminal,
  Activity,
  CheckCircle2,
  Clock,
  Zap,
  Globe,
  Layers,
} from "lucide-react";

export default function HomePage() {
  const [viewMode, setViewMode] = useState<"canvas" | "dashboard">("canvas");

  // If in canvas mode (default), show the exact target reference interface!
  if (viewMode === "canvas") {
    return (
      <div className="relative w-full h-screen">
        {/* Subtle toggle floating at top center left */}
        <div className="fixed top-4 left-72 z-30 pointer-events-auto flex items-center glass-pill p-1 rounded-full text-xs">
          <button
            onClick={() => setViewMode("canvas")}
            className="px-3 py-1 rounded-full bg-blue-600/35 text-blue-300 border border-blue-400/40 font-medium flex items-center gap-1.5 shadow-sm"
          >
            <Box className="w-3.5 h-3.5" />
            <span>Canvas View</span>
          </button>
          <button
            onClick={() => setViewMode("dashboard")}
            className="px-3 py-1 rounded-full text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Dashboard Overview</span>
          </button>
        </div>

        <WorkspacePage />
      </div>
    );
  }

  // Dashboard Overview Mode (Redesigned with target dark glass aesthetic)
  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto w-full pt-20">
      {/* Top Bar Switcher */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            SE Browser Agent Dashboard
          </h1>
          <p className="text-xs text-zinc-400">
            Multi-Agent Software Engineering Orchestration Engine • LangGraph Pipeline
          </p>
        </div>

        <div className="flex items-center glass-pill p-1 rounded-full text-xs">
          <button
            onClick={() => setViewMode("canvas")}
            className="px-3.5 py-1.5 rounded-full text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Box className="w-3.5 h-3.5" />
            <span>Switch to Canvas View</span>
          </button>
          <button
            onClick={() => setViewMode("dashboard")}
            className="px-3.5 py-1.5 rounded-full bg-blue-600/35 text-blue-300 border border-blue-400/40 font-medium flex items-center gap-1.5"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Dashboard Overview</span>
          </button>
        </div>
      </div>

      {/* Quick Launch Workflows */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[
          {
            title: "Full-Stack App",
            sub: "Next.js + FastAPI",
            prompt: "Build a responsive Next.js 14 full-stack app with FastAPI and PostgreSQL.",
          },
          {
            title: "AI Agent",
            sub: "LangGraph + Tools",
            prompt: "Build an autonomous AI agent system with tool use and memory.",
          },
          {
            title: "Research & Spec",
            sub: "Technical PRD",
            prompt: "Perform deep architectural research and generate technical specifications.",
          },
          {
            title: "Debug & Fix",
            sub: "Automated Patch",
            prompt: "Analyze codebase for AST syntax bugs and apply self-healing fixes.",
          },
          {
            title: "Browser E2E",
            sub: "Playwright Suite",
            prompt: "Build an automated Playwright browser test suite verifying user flows.",
          },
          {
            title: "Edge Deploy",
            sub: "Vercel / Docker",
            prompt: "Configure automated Docker containerization and production deployment.",
          },
        ].map((item, idx) => (
          <Link
            key={idx}
            href={`/workspace?query=${encodeURIComponent(item.prompt)}`}
            className="p-4 rounded-2xl bg-[#10141F]/80 backdrop-blur-xl border border-white/[0.08] hover:border-blue-500/40 hover:bg-[#141926] transition-all group flex flex-col justify-between h-28"
          >
            <div className="flex justify-between items-center text-zinc-500 group-hover:text-blue-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-mono">0{idx + 1}</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                {item.title}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{item.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Grid: Active Execution Queue & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Tasks Queue */}
        <div className="lg:col-span-8 rounded-3xl bg-[#10141F]/80 backdrop-blur-xl border border-white/[0.08] p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-sm font-semibold text-white">Active Tasks Execution Queue</h2>
            </div>
            <Link
              href="/tasks"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <span>View all tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {/* Task Item 1 */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-white">
                      Task #8821: OAuth NextAuth Implementation
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-mono font-medium">
                      CODING [Stage 4/8]
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Writing callback handlers and Supabase session bridge tokens
                  </p>
                </div>
                <Link
                  href="/workspace?session_id=8821"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shrink-0"
                >
                  Open Canvas
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/[0.05] text-[11px] text-zinc-400 font-mono">
                <div>Elapsed: <span className="text-zinc-200">08:42</span></div>
                <div>Diff: <span className="text-emerald-400">18 files</span></div>
                <div>Tests: <span className="text-zinc-200">89.4% PASS</span></div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>Synthesizing JWT strategy</span>
                  <span className="text-blue-400 font-semibold">54%</span>
                </div>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[54%]" />
                </div>
              </div>
            </div>

            {/* Task Item 2 */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-white">
                      Task #8820: Production Vercel Deployment
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-medium">
                      COMPLETED
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Playwright E2E smoke tests verified on Chromium headless
                  </p>
                </div>
                <Link
                  href="/workspace"
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 text-xs font-medium transition-colors shrink-0"
                >
                  Inspect
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* System Telemetry & Model Specs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl bg-[#10141F]/80 backdrop-blur-xl border border-white/[0.08] p-6 shadow-xl">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Orchestrator Telemetry</span>
            </h3>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex justify-between pb-2 border-b border-white/[0.05]">
                <span className="text-zinc-500">Pipeline State</span>
                <span className="text-emerald-400 font-medium">RUNNING_IDLE</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/[0.05]">
                <span className="text-zinc-500">Backend API</span>
                <span className="text-zinc-200 font-mono">FastAPI:8000</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/[0.05]">
                <span className="text-zinc-500">DOM Driver</span>
                <span className="text-zinc-200 font-mono">Playwright 1.62</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/[0.05]">
                <span className="text-zinc-500">LLM Engine</span>
                <span className="text-blue-400 font-medium">Gemini 3.8 / GPT-4o</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Memory Allocation</span>
                <span className="text-zinc-200 font-mono">4.1 GB / 16 GB</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-blue-900/30 to-[#10141F] border border-blue-500/20 p-6 shadow-xl text-white">
            <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
              Autonomous Browser Mode
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              Headless Chromium driver executes smoke tests, clicks elements, and verifies API endpoints directly inside sandbox containers.
            </p>
            <button
              onClick={() => setViewMode("canvas")}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(77,142,255,0.3)]"
            >
              <span>Launch Canvas Orchestrator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
