"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  Box,
  Activity,
  FileCode,
  Grid,
  SlidersHorizontal,
  Plus,
  FolderGit2,
  X,
  ExternalLink,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showProjectsDrawer, setShowProjectsDrawer] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Workspace Canvas", href: "/workspace", icon: Box },
    { label: "Agent Orchestration", href: "/agent-workspace", icon: Activity },
    { label: "Code Viewer", href: "/code", icon: FileCode },
    { label: "Tasks & Pipelines", href: "/tasks", icon: Grid },
  ];

  const pinnedProjects = [
    { name: "SE Browser Agent", status: "LIVE", branch: "main", color: "bg-emerald-400" },
    { name: "AI Researcher", status: "IDLE", branch: "dev", color: "bg-zinc-500" },
    { name: "Vision RAG", status: "RUNNING", branch: "feat/cdp", color: "bg-blue-400" },
    { name: "AutoML Engineer", status: "IDLE", branch: "v1.2", color: "bg-zinc-500" },
    { name: "Medical Assistant", status: "STANDBY", branch: "eval", color: "bg-zinc-500" },
  ];

  const filteredProjects = pinnedProjects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <aside className="fixed top-0 left-0 h-screen w-16 z-40 bg-[#090C12]/90 backdrop-blur-xl border-r border-white/[0.08] flex flex-col justify-between items-center py-4 select-none">
        {/* Top Logo / Brand Starburst Icon */}
        <div className="flex flex-col items-center gap-6">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/90 hover:text-white transition-all hover:scale-105 group relative"
            title="ForgeAI - SE Browser Agent"
          >
            {/* Target 6-lobe geometric starburst emblem */}
            <svg
              className="w-6 h-6 text-slate-300 group-hover:text-blue-400 transition-colors drop-shadow-[0_0_8px_rgba(77,142,255,0.4)]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="12" cy="5" r="2.2" />
              <circle cx="18" cy="8.5" r="2.2" />
              <circle cx="18" cy="15.5" r="2.2" />
              <circle cx="12" cy="19" r="2.2" />
              <circle cx="6" cy="15.5" r="2.2" />
              <circle cx="6" cy="8.5" r="2.2" />
              <circle cx="12" cy="12" r="1.8" fill="rgba(255,255,255,0.6)" />
            </svg>
          </Link>

          {/* Navigation Rail Icons */}
          <nav className="flex flex-col items-center gap-2">
            {/* Home */}
            <Link
              href="/"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
                pathname === "/"
                  ? "bg-white/[0.1] text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
              }`}
              title="Home"
            >
              <Home className="w-4 h-4" />
              <span className="absolute left-14 ml-2 px-2.5 py-1 bg-[#141824] text-white text-xs rounded-md shadow-xl border border-white/10 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Home
              </span>
            </Link>

            {/* Search Trigger */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all group relative"
              title="Search Projects & Agents"
            >
              <Search className="w-4 h-4" />
              <span className="absolute left-14 ml-2 px-2.5 py-1 bg-[#141824] text-white text-xs rounded-md shadow-xl border border-white/10 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Search
              </span>
            </button>

            {/* Workspace / Orchestration Canvas (Cube icon) */}
            <Link
              href="/workspace"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
                pathname === "/workspace"
                  ? "bg-blue-600/25 text-blue-400 border border-blue-500/30 shadow-[0_0_20px_rgba(77,142,255,0.35)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
              }`}
              title="Agent Canvas Workspace"
            >
              <Box className="w-4 h-4" />
              <span className="absolute left-14 ml-2 px-2.5 py-1 bg-[#141824] text-white text-xs rounded-md shadow-xl border border-white/10 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Workspace Canvas
              </span>
            </Link>

            {/* Agent Orchestration Graph (Waveform/Activity) */}
            <Link
              href="/agent-workspace"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
                pathname === "/agent-workspace"
                  ? "bg-white/[0.1] text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
              }`}
              title="Agent Graph"
            >
              <Activity className="w-4 h-4" />
              <span className="absolute left-14 ml-2 px-2.5 py-1 bg-[#141824] text-white text-xs rounded-md shadow-xl border border-white/10 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Agent Pipeline
              </span>
            </Link>

            {/* Code Viewer */}
            <Link
              href="/code"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
                pathname === "/code"
                  ? "bg-white/[0.1] text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
              }`}
              title="Code Inspector"
            >
              <FileCode className="w-4 h-4" />
              <span className="absolute left-14 ml-2 px-2.5 py-1 bg-[#141824] text-white text-xs rounded-md shadow-xl border border-white/10 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Code & Files
              </span>
            </Link>

            {/* Tasks & Pipelines */}
            <Link
              href="/tasks"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
                pathname === "/tasks"
                  ? "bg-white/[0.1] text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
              }`}
              title="Tasks Overview"
            >
              <Grid className="w-4 h-4" />
              <span className="absolute left-14 ml-2 px-2.5 py-1 bg-[#141824] text-white text-xs rounded-md shadow-xl border border-white/10 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Tasks & History
              </span>
            </Link>
          </nav>
        </div>

        {/* Bottom Cluster: Pinned Projects Drawer + Profile Avatar */}
        <div className="flex flex-col items-center gap-3">
          {/* Projects & Settings popover trigger */}
          <button
            onClick={() => setShowProjectsDrawer(!showProjectsDrawer)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
              showProjectsDrawer
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            }`}
            title="Projects & Configuration"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="absolute left-14 ml-2 px-2.5 py-1 bg-[#141824] text-white text-xs rounded-md shadow-xl border border-white/10 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              Projects & Settings
            </span>
          </button>

          {/* User Profile Avatar with sleek ring */}
          <div className="relative group cursor-pointer">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 p-0.5 hover:border-blue-400 transition-colors shadow-lg">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center text-[11px] font-semibold text-white">
                AK
              </div>
            </div>
            <span className="absolute left-14 ml-2 bottom-0 px-2.5 py-1 bg-[#141824] text-white text-xs rounded-md shadow-xl border border-white/10 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              Ayman Khan • SysAdmin
            </span>
          </div>
        </div>
      </aside>

      {/* Slide-out Drawer for Pinned Projects & Settings */}
      {showProjectsDrawer && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowProjectsDrawer(false)}
          />

          {/* Drawer content */}
          <div className="relative ml-16 w-80 h-full bg-[#0D111A]/95 backdrop-blur-2xl border-r border-white/[0.08] shadow-2xl p-5 flex flex-col justify-between z-10 animate-fadeSlideIn">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-white">Workspace Projects</span>
                </div>
                <button
                  onClick={() => setShowProjectsDrawer(false)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Projects List */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">
                  Pinned Repositories ({pinnedProjects.length})
                </div>
                {pinnedProjects.map((p, idx) => (
                  <Link
                    key={idx}
                    href="/workspace"
                    onClick={() => setShowProjectsDrawer(false)}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] hover:border-blue-500/30 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${p.color} shadow-sm`} />
                      <div>
                        <div className="text-xs font-medium text-zinc-200 group-hover:text-white">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-zinc-500">{p.branch}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-zinc-400 font-mono">
                      {p.status}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Create New Task CTA */}
              <button
                onClick={() => {
                  setShowProjectsDrawer(false);
                  router.push("/new-task");
                }}
                className="mt-4 w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(77,142,255,0.3)]"
              >
                <Plus className="w-4 h-4" />
                <span>Configure New Task</span>
              </button>
            </div>

            {/* Bottom Engine Telemetry */}
            <div className="pt-4 border-t border-white/[0.08] text-[11px] text-zinc-400 space-y-2">
              <div className="flex justify-between">
                <span>FastAPI Backend</span>
                <span className="text-emerald-400 font-mono">http://localhost:8000</span>
              </div>
              <div className="flex justify-between">
                <span>CDP Headless Engine</span>
                <span className="text-blue-400 font-mono">Playwright 1.62</span>
              </div>
              <div className="flex justify-between">
                <span>Telemetry Status</span>
                <span className="text-zinc-300 font-mono">ACTIVE_SYNC</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setShowSearchModal(false)}
          />
          <div className="relative w-full max-w-lg bg-[#0F1420] border border-white/[0.1] rounded-2xl shadow-2xl p-4 z-10 animate-fadeSlideIn">
            <div className="flex items-center gap-3 px-3 py-2 bg-black/40 rounded-xl border border-white/[0.08]">
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, agent nodes, or routes..."
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-zinc-500"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 max-h-60 overflow-y-auto space-y-1">
              {filteredProjects.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setShowSearchModal(false);
                    router.push("/workspace");
                  }}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-white/[0.06] text-xs text-zinc-300 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${p.color}`} />
                    {p.name}
                  </span>
                  <span className="text-zinc-500 font-mono text-[10px]">{p.status}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
