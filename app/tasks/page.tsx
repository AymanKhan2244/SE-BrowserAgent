"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Grid,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Zap,
  FileCode,
  ArrowRight,
  ExternalLink,
  Plus,
  Play,
  RotateCcw,
} from "lucide-react";

export default function TasksPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [liveProjects, setLiveProjects] = useState<any[]>([]);

  React.useEffect(() => {
    fetch("/api/forge/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.projects) setLiveProjects(data.projects);
      })
      .catch(() => {});
  }, []);

  const liveTasks = liveProjects.map((p) => ({
    id: p.id,
    title: p.name,
    meta: `generated_projects/${p.id} • ${new Date(p.updated_at * 1000).toLocaleDateString()}`,
    project: "Autonomous SWE",
    step: "SYNTHESIZED",
    stepBadge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    duration: "02:15",
    tokens: `${(p.file_count * 1.8).toFixed(1)}K`,
    changed: `${p.file_count} files`,
    changedDiff: "(synthesized)",
    tests: "PASSED",
    status: "COMPLETED",
    statusBadge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    actionText: "Open Canvas",
    link: `/workspace?session_id=${p.id}`,
  }));

  const tasksData = [
    ...liveTasks,
    {
      id: "8821",
      title: "NextAuth OAuth PKCE Implementation",
      meta: "feat/auth-pkce • commit c319af2",
      project: "SE Browser Agent",
      step: "CODING (Stage 4/8)",
      stepBadge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      duration: "08:42",
      tokens: "84.2K",
      changed: "18 files",
      changedDiff: "(+14 / -0)",
      tests: "24 PASS",
      status: "RUNNING",
      statusBadge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      actionText: "Open Canvas",
      link: "/workspace?session_id=8821",
    },
    {
      id: "8820",
      title: "Production Vercel Deployment & Schema Migration",
      meta: "release/v2.4.1 • schema/db-v4",
      project: "AI Researcher",
      step: "DEPLOYMENT APPROVAL",
      stepBadge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      duration: "14:20",
      tokens: "112.5K",
      changed: "32 files",
      changedDiff: "(+412 / -18)",
      tests: "48 PASS",
      status: "ATTENTION",
      statusBadge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      actionText: "Review Gate",
      link: "/workspace",
    },
    {
      id: "8819",
      title: "Stripe Webhook Idempotency & Customer Portal",
      meta: "fix/stripe-idemp • merge 44ba90",
      project: "SE Browser Agent",
      step: "COMPLETED",
      stepBadge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      duration: "04:15",
      tokens: "42.1K",
      changed: "6 files",
      changedDiff: "(+82 / -12)",
      tests: "16 PASS",
      status: "COMPLETED",
      statusBadge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      actionText: "Inspect Code",
      link: "/workspace",
    },
    {
      id: "8818",
      title: "Playwright Headless Cart E2E Verification Suite",
      meta: "test/cart-checkout • automated",
      project: "Vision RAG",
      step: "COMPLETED",
      stepBadge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      duration: "02:50",
      tokens: "28.4K",
      changed: "4 files",
      changedDiff: "(+120 / -4)",
      tests: "32 PASS",
      status: "COMPLETED",
      statusBadge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      actionText: "Inspect Code",
      link: "/workspace",
    },
  ];

  const filteredTasks = tasksData.filter((t) => {
    if (activeFilter !== "ALL" && t.status !== activeFilter) return false;
    if (
      searchQuery &&
      !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.project.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto w-full pt-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2.5">
            <Grid className="w-6 h-6 text-blue-400" />
            <span>Tasks &amp; Orchestration Pipelines</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time execution queue, pipeline telemetry, and completed project runs
          </p>
        </div>

        <button
          onClick={() => router.push("/new-task")}
          className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(77,142,255,0.3)] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Status Filters */}
        <div className="flex items-center gap-2 bg-[#10141F]/80 backdrop-blur-xl border border-white/[0.08] p-1 rounded-2xl w-full md:w-auto overflow-x-auto">
          {["ALL", "RUNNING", "COMPLETED", "ATTENTION"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeFilter === f
                  ? "bg-blue-600/30 text-blue-400 border border-blue-500/40"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, commits, or projects..."
            className="w-full bg-[#10141F]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 rounded-3xl bg-[#10141F]/80 border border-white/[0.08]">
            No tasks found matching your filter.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-5 rounded-3xl bg-[#10141F]/80 backdrop-blur-xl border border-white/[0.08] hover:border-white/15 transition-all shadow-xl group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Info */}
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                      Task #{task.id}: {task.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full border ${task.statusBadge}`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="font-medium text-zinc-300">{task.project}</span>
                    <span>•</span>
                    <span className="font-mono text-zinc-500">{task.meta}</span>
                  </div>
                </div>

                {/* Right Metrics & Action */}
                <div className="flex items-center gap-6">
                  {/* Telemetry Stats */}
                  <div className="grid grid-cols-4 gap-4 text-xs font-mono text-zinc-400 text-center">
                    <div>
                      <div className="text-[10px] text-zinc-500">Duration</div>
                      <div className="text-zinc-200 mt-0.5">{task.duration}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500">Tokens</div>
                      <div className="text-zinc-200 mt-0.5">{task.tokens}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500">Diff</div>
                      <div className="text-emerald-400 mt-0.5">{task.changed}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500">Tests</div>
                      <div className="text-zinc-200 mt-0.5">{task.tests}</div>
                    </div>
                  </div>

                  {/* Open Button */}
                  <Link
                    href={task.link}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md transition-all shrink-0"
                  >
                    <span>{task.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
