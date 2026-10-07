"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TasksPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("All Projects");

  const tasksData = [
    {
      id: "8821",
      title: "NextAuth OAuth Implementation",
      meta: "feat/auth-pkce • commit c319af2",
      project: "SE Browser Agent",
      step: "● CODING (Stage 4/8)",
      stepBadge: "bg-surface-container-highest border-secondary-container text-secondary-container",
      duration: "08:42",
      tokens: "84.2K",
      changed: "18 files",
      changedDiff: "(+14 / -0)",
      tests: "24 PASS",
      status: "RUNNING",
      statusBadge: "bg-primary-fixed text-on-primary-fixed font-bold border-surface-container-lowest",
      actionText: "[OPEN WORKSPACE >]",
      actionStyle: "bg-primary-fixed text-on-primary-fixed border-surface-container-lowest",
      link: "/workspace",
    },
    {
      id: "8820",
      title: "Production Vercel Deployment & Schema Migration",
      meta: "release/v2.4.1 • schema/db-v4",
      project: "AI Researcher",
      step: "⚠ DEPLOYMENT APPROVAL",
      stepBadge: "bg-error-container text-on-error-container border-error font-bold",
      duration: "14:20",
      tokens: "112.5K",
      changed: "32 files",
      changedDiff: "(+412 / -18)",
      tests: "48 PASS",
      status: "ATTENTION REQUIRED",
      statusBadge: "bg-error-container text-on-error-container font-bold border-error",
      actionText: "[REVIEW GATE >]",
      actionStyle: "bg-error-container text-on-error-container border-error",
      link: "/workspace",
    },
    {
      id: "8819",
      title: "Stripe Webhook Idempotency & Customer Portal",
      meta: "fix/stripe-idemp • merge 44ba90",
      project: "SE Browser Agent",
      step: "✓ COMPLETED",
      stepBadge: "bg-surface-container-high border-outline text-primary",
      duration: "04:15",
      tokens: "42.1K",
      changed: "6 files",
      changedDiff: "",
      tests: "18 PASS",
      status: "DEPLOYED",
      statusBadge: "bg-surface-container-highest border-outline text-primary font-bold",
      actionText: "[Inspect Logs]",
      actionStyle: "text-on-surface hover:text-primary-fixed border-outline-variant hover:border-primary-fixed",
      link: "/workspace",
    },
    {
      id: "8818",
      title: "ArXiv Paper Deep Research & Vector Indexing",
      meta: "pipeline/arxiv-sync • batch_2991",
      project: "AI Researcher",
      step: "✓ COMPLETED",
      stepBadge: "bg-surface-container-high border-outline text-primary",
      duration: "22:10",
      tokens: "184K",
      changed: "4 md files",
      changedDiff: "",
      tests: "N/A",
      status: "COMPLETED",
      statusBadge: "bg-surface-container-highest border-outline text-on-surface font-bold",
      actionText: "[Inspect Artifacts]",
      actionStyle: "text-on-surface hover:text-primary-fixed border-outline-variant hover:border-primary-fixed",
      link: "/workspace",
    },
    {
      id: "8817",
      title: "Headless DOM Interaction Benchmark",
      meta: "eval/headless-bench • playwright_run_8",
      project: "Vision RAG",
      step: "✕ TEST ERROR",
      stepBadge: "bg-error-container text-on-error-container border-error font-bold",
      duration: "02:08",
      tokens: "19.4K",
      changed: "0 files",
      changedDiff: "",
      tests: "2 FAIL",
      status: "FAILED (Missing API Secret)",
      statusBadge: "bg-error-container text-error border-error font-bold",
      actionText: "[Retry with Secret]",
      actionStyle: "bg-surface-container-high text-primary border-outline-variant hover:border-primary-fixed hover:text-primary-fixed",
      link: "/workspace",
    },
  ];

  const filteredTasks = tasksData.filter((t) => {
    const matchesFilter =
      activeFilter === "ALL" ||
      (activeFilter === "RUNNING" && t.status === "RUNNING") ||
      (activeFilter === "COMPLETED" && (t.status === "COMPLETED" || t.status === "DEPLOYED")) ||
      (activeFilter === "AWAITING APPROVAL" && t.status === "ATTENTION REQUIRED") ||
      (activeFilter === "FAILED" && t.status.includes("FAILED"));

    const matchesProject = selectedProject === "All Projects" || t.project === selectedProject;

    const matchesQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.includes(searchQuery) ||
      t.meta.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesProject && matchesQuery;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto flex flex-col gap-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-2 border-outline-variant bg-surface-container-low p-5 shadow-[4px_4px_0px_#000000]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed text-[10px] font-label-sm font-bold">
              DISPATCHER v2.4
            </span>
            <span className="text-on-surface-variant font-code-stream text-xs">
              / ROOT / SWE_TASKS_MATRIX
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface uppercase">
            TASK ORCHESTRATION & RUNS
          </h1>
          <p className="font-code-stream text-code-stream text-on-surface-variant text-sm mt-1">
            Audit, manage, and inspect autonomous SWE agent task executions and pipelines across projects.
          </p>
        </div>
        <button
          onClick={() => router.push("/new-task")}
          className="px-5 py-2.5 bg-primary-fixed text-on-primary-fixed font-headline-md font-bold text-sm uppercase flex items-center gap-2 border-2 border-surface-container-lowest shadow-[3px_3px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-base font-bold">add</span>
          <span>[+ START NEW TASK]</span>
        </button>
      </div>

      {/* FILTER CONTROLS & BARS */}
      <div className="flex flex-col gap-3">
        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-surface-container border-2 border-outline-variant shadow-[3px_3px_0px_#000000]">
          {[
            { label: "ALL", count: "48", countColor: "bg-surface-container-lowest text-primary-fixed" },
            { label: "RUNNING", count: "3", countColor: "bg-surface-container-high text-secondary-container border border-outline-variant" },
            { label: "COMPLETED", count: "38", countColor: "bg-surface-container-high text-on-surface-variant border border-outline-variant" },
            { label: "AWAITING APPROVAL", count: "2", countColor: "bg-error-container text-on-error-container font-bold border border-error" },
            { label: "PAUSED", count: "1", countColor: "bg-surface-container-high text-on-surface-variant border border-outline-variant" },
            { label: "FAILED", count: "4", countColor: "bg-error-container text-error border border-outline-variant" },
          ].map((pill) => {
            const isActive = activeFilter === pill.label;
            return (
              <button
                key={pill.label}
                onClick={() => setActiveFilter(pill.label)}
                className={`px-3 py-1.5 font-label-md text-label-md flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary-fixed text-on-primary-fixed border border-surface-container-lowest shadow-[2px_2px_0px_#000000] font-bold"
                    : "bg-surface-container-low text-on-surface hover:text-primary-fixed border border-outline-variant"
                }`}
              >
                <span>{pill.label}</span>
                <span className={`px-1.5 py-0.2 text-[10px] ${pill.countColor}`}>{pill.count}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar and Dropdown Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-container font-code-stream text-sm">
              &gt;
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest border-2 border-outline-variant pl-8 pr-4 py-2 font-code-stream text-code-stream text-on-surface focus:border-primary-fixed focus:shadow-[2px_2px_0px_#fde400] outline-none"
              placeholder="Filter tasks by name, commit, or agent step..."
              type="text"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-surface-container-low border-2 border-outline-variant px-3 py-2 font-code-stream text-code-stream text-on-surface focus:border-primary-fixed outline-none cursor-pointer"
            >
              <option>All Projects</option>
              <option>SE Browser Agent</option>
              <option>AI Researcher</option>
              <option>Vision RAG</option>
            </select>
          </div>
        </div>
      </div>

      {/* TASKS DATA MATRIX / TABLE */}
      <div className="border-2 border-outline-variant bg-surface-container-low shadow-[4px_4px_0px_#000000] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container border-b-2 border-outline-variant text-[11px] font-label-md text-on-surface-variant tracking-wider uppercase">
              <th className="p-3 border-r border-outline-variant">TASK / IDENTIFIER</th>
              <th className="p-3 border-r border-outline-variant">PROJECT</th>
              <th className="p-3 border-r border-outline-variant">CURRENT STEP</th>
              <th className="p-3 border-r border-outline-variant">DURATION</th>
              <th className="p-3 border-r border-outline-variant">TOKENS</th>
              <th className="p-3 border-r border-outline-variant">CHANGED</th>
              <th className="p-3 border-r border-outline-variant">TESTS</th>
              <th className="p-3 border-r border-outline-variant">STATUS</th>
              <th className="p-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="font-code-stream text-xs divide-y divide-outline-variant">
            {filteredTasks.map((t) => (
              <tr key={t.id} className="bg-surface hover:bg-surface-container-high transition-colors">
                <td className="p-3 border-r border-outline-variant">
                  <div className="font-bold text-primary flex items-center gap-1.5">
                    <span className={t.status.includes("FAILED") || t.status === "ATTENTION REQUIRED" ? "text-error" : "text-primary-fixed"}>
                      #{t.id}:
                    </span>
                    <span>{t.title}</span>
                  </div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5 font-code-stream">{t.meta}</div>
                </td>
                <td className="p-3 border-r border-outline-variant text-on-surface">{t.project}</td>
                <td className="p-3 border-r border-outline-variant">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-label-sm text-[10px] border ${t.stepBadge}`}>
                    {t.step}
                  </span>
                </td>
                <td className="p-3 border-r border-outline-variant text-on-surface">{t.duration}</td>
                <td className="p-3 border-r border-outline-variant text-on-surface font-bold">{t.tokens}</td>
                <td className="p-3 border-r border-outline-variant">
                  <span className="text-primary-fixed">{t.changed}</span>
                  {t.changedDiff && <span className="text-[10px] text-on-surface-variant block">{t.changedDiff}</span>}
                </td>
                <td className="p-3 border-r border-outline-variant">
                  <span className={`px-1.5 py-0.2 text-[10px] border ${t.tests.includes("FAIL") ? "border-error bg-error-container text-on-error-container font-bold" : "border-outline bg-surface-container text-primary"}`}>
                    {t.tests}
                  </span>
                </td>
                <td className="p-3 border-r border-outline-variant">
                  <span className={`px-2 py-0.5 text-[10px] ${t.statusBadge}`}>{t.status}</span>
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={t.link}
                    className={`inline-block px-3 py-1.5 font-headline-md font-bold text-xs uppercase border shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all ${t.actionStyle}`}
                  >
                    {t.actionText}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BOTTOM PAGINATION & CLUSTER SUMMARY */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-surface-container border-2 border-outline-variant text-xs font-code-stream shadow-[3px_3px_0px_#000000]">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="text-on-surface font-bold">Showing 1–{filteredTasks.length} of 48 tasks</span>
          <span>|</span>
          <span>
            Cluster: <span className="text-secondary-container">dev_cluster_01</span>
          </span>
          <span>|</span>
          <span>
            Active Workers: <span className="text-primary-fixed font-bold">6/8</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="px-2.5 py-1 bg-surface-container-low border border-outline-variant text-on-surface-variant hover:text-on-surface disabled:opacity-50">
            &lt; PREV
          </button>
          <button className="px-2.5 py-1 bg-primary-fixed text-on-primary-fixed font-bold border border-surface-container-lowest">
            1
          </button>
          <button className="px-2.5 py-1 bg-surface-container-low border border-outline-variant text-on-surface hover:text-primary-fixed">
            2
          </button>
          <button className="px-2.5 py-1 bg-surface-container-low border border-outline-variant text-on-surface hover:text-primary-fixed">
            3
          </button>
          <button className="px-2.5 py-1 bg-surface-container-low border border-outline-variant text-on-surface hover:text-on-surface">
            NEXT &gt;
          </button>
        </div>
      </div>

      {/* SECONDARY BENTO WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Node Health */}
        <div className="p-3 border-2 border-outline-variant bg-surface-container-low shadow-[3px_3px_0px_#000000] flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-outline-variant pb-1.5">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              POD QUEUE CAPACITY
            </span>
            <span className="px-1.5 py-0.2 bg-secondary-container text-on-secondary-container text-[10px] font-bold">
              NORMAL
            </span>
          </div>
          <div className="flex justify-between items-center text-xs font-code-stream">
            <span className="text-on-surface-variant">Allocated GPUs:</span>
            <span className="text-on-surface font-bold">4x A100 (80GB)</span>
          </div>
          <div className="w-full bg-surface-container-highest h-2 border border-outline-variant">
            <div className="bg-primary-fixed h-full w-[72%]"></div>
          </div>
          <div className="flex justify-between text-[10px] font-code-stream text-on-surface-variant">
            <span>Utilization: 72%</span>
            <span>Max Parallel: 12</span>
          </div>
        </div>

        {/* Orchestrator Rate */}
        <div className="p-3 border-2 border-outline-variant bg-surface-container-low shadow-[3px_3px_0px_#000000] flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-outline-variant pb-1.5">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              STEP DISPATCH LATENCY
            </span>
            <span className="text-primary-fixed font-code-stream text-xs font-bold">42ms avg</span>
          </div>
          <div className="flex justify-between items-center text-xs font-code-stream">
            <span className="text-on-surface-variant">DOM Intercept Loop:</span>
            <span className="text-secondary-container font-bold">18ms (Fast)</span>
          </div>
          <div className="flex justify-between items-center text-xs font-code-stream">
            <span className="text-on-surface-variant">LLM Inference RTT:</span>
            <span className="text-on-surface font-bold">410ms (DeepSeek-V3)</span>
          </div>
          <div className="text-[10px] text-on-surface-variant font-code-stream">
            <span>Network Gateway: 0 dropped frames</span>
          </div>
        </div>

        {/* Security & Sandbox Lock */}
        <div className="p-3 border-2 border-outline-variant bg-surface-container-low shadow-[3px_3px_0px_#000000] flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-outline-variant pb-1.5">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              ISOLATION SANDBOX
            </span>
            <span className="px-1.5 py-0.2 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
              SECURED
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-code-stream">
            <span className="text-on-surface-variant">V8 Isolation Engine:</span>
            <span className="text-on-surface">ENABLED</span>
          </div>
          <div className="flex items-center justify-between text-xs font-code-stream">
            <span className="text-on-surface-variant">Network Policy:</span>
            <span className="text-primary-fixed">EGRESS_WHITELISTED</span>
          </div>
          <div className="text-[10px] text-on-surface-variant font-code-stream">
            <span>Container: gVisor RunSC sandbox-node-2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
