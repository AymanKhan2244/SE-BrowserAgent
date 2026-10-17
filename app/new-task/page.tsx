"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Play,
  Layers,
  Globe,
  Code2,
  Bug,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  FolderGit2,
  GitBranch,
} from "lucide-react";

export default function NewTaskPage() {
  const router = useRouter();

  const [promptText, setPromptText] = useState(
    "Build a responsive authentication system using React, FastAPI, and PostgreSQL, including login, registration, protected routes, validation, and automated tests."
  );

  const [selectedMode, setSelectedMode] = useState("01");
  const [targetRepo, setTargetRepo] = useState("se-browser-agent-core");
  const [gitBranch, setGitBranch] = useState("feat/auth-system");
  const [techStack, setTechStack] = useState("Next.js 14 + Tailwind + FastAPI");
  const [enableBrowserTests, setEnableBrowserTests] = useState(true);
  const [enableAutoFix, setEnableAutoFix] = useState(true);

  const handleLaunchTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    router.push(`/workspace?query=${encodeURIComponent(promptText.trim())}`);
  };

  const modes = [
    {
      id: "01",
      title: "Full Build Pipeline",
      desc: "Autonomous end-to-end execution: requirements breakdown, full-stack code synthesis, browser DOM testing, and automated fixes.",
      tag: "Autonomous SWE",
    },
    {
      id: "02",
      title: "Research & Spec",
      desc: "Deep architectural reconnaissance, external API discovery, competitor mapping, and actionable technical PRDs.",
      tag: "Analysis",
    },
    {
      id: "03",
      title: "Coding Only",
      desc: "Surgical codebase synthesis, component generation, unit tests, and typing enforcement without spinning up headless browser sessions.",
      tag: "Code Synthesis",
    },
    {
      id: "04",
      title: "Debugging & Fix",
      desc: "Log parsing, stack trace isolation, memory leak diagnosis, and targeted self-healing code hotpatching.",
      tag: "Self-Healing",
    },
    {
      id: "05",
      title: "Browser Automation",
      desc: "Pure client-side DOM interactions: web scraping, synthetic user flows, checkout testing, and multi-step verification.",
      tag: "Playwright CDP",
    },
    {
      id: "06",
      title: "Deployment & CI",
      desc: "Infrastructure orchestration, Docker image optimization, CI/CD pipeline triggering, and production deployment validation.",
      tag: "DevOps",
    },
  ];

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto w-full pt-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span>Configure New Engineering Task</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Define task intent, target repository parameters, and execution permissions
          </p>
        </div>
      </div>

      <form onSubmit={handleLaunchTask} className="space-y-6">
        {/* Task Directive Card */}
        <div className="rounded-3xl bg-[#10141F]/80 backdrop-blur-xl border border-white/[0.08] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white uppercase tracking-wider">
              Task Directive &amp; Specification
            </label>
            <span className="text-[11px] font-mono text-zinc-500">UTF-8 • STRICT_SWE</span>
          </div>

          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={4}
            placeholder="Describe what you want your autonomous SWE engine to build..."
            className="w-full rounded-2xl bg-[#090C12] border border-white/[0.08] p-4 text-xs font-mono leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50"
          />

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setPromptText(
                    "Build a responsive multi-tenant SaaS dashboard with Next.js 14, Supabase auth, Stripe billing, and Playwright tests."
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs text-zinc-300 border border-white/[0.06] transition-colors"
              >
                Insert SaaS Template
              </button>
            </div>

            <button
              type="submit"
              disabled={!promptText.trim()}
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(77,142,255,0.35)] transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Agent Pipeline</span>
            </button>
          </div>
        </div>

        {/* Execution Mode Grid */}
        <div className="rounded-3xl bg-[#10141F]/80 backdrop-blur-xl border border-white/[0.08] p-6 shadow-xl space-y-4">
          <label className="text-xs font-semibold text-white uppercase tracking-wider block">
            Execution Mode
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {modes.map((m) => {
              const isSelected = selectedMode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMode(m.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#141B2B] border-blue-500/50 shadow-[0_0_25px_rgba(77,142,255,0.2)]"
                      : "bg-[#090C12] border-white/[0.06] hover:bg-white/[0.02]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-white">{m.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-zinc-400">
                        {m.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Environment & Repository Configuration */}
        <div className="rounded-3xl bg-[#10141F]/80 backdrop-blur-xl border border-white/[0.08] p-6 shadow-xl space-y-4">
          <label className="text-xs font-semibold text-white uppercase tracking-wider block">
            Target Environment &amp; Parameters
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1.5 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Target Repository</span>
              </label>
              <input
                type="text"
                value={targetRepo}
                onChange={(e) => setTargetRepo(e.target.value)}
                className="w-full rounded-xl bg-[#090C12] border border-white/[0.08] px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1.5 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                <span>Git Branch</span>
              </label>
              <input
                type="text"
                value={gitBranch}
                onChange={(e) => setGitBranch(e.target.value)}
                className="w-full rounded-xl bg-[#090C12] border border-white/[0.08] px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Tech Stack</span>
              </label>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                className="w-full rounded-xl bg-[#090C12] border border-white/[0.08] px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableBrowserTests}
                onChange={(e) => setEnableBrowserTests(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-black/40 border-white/20 focus:ring-0"
              />
              <span className="text-xs text-zinc-300">
                Execute automated Playwright browser tests
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableAutoFix}
                onChange={(e) => setEnableAutoFix(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-black/40 border-white/20 focus:ring-0"
              />
              <span className="text-xs text-zinc-300">
                Enable AST self-healing debugger hotpatching
              </span>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
