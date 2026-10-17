"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download, ExternalLink, Bell, Sparkles } from "lucide-react";

interface HeaderProps {
  status?: string;
  tokenCount?: string | number;
  onSave?: () => void;
  onNewProject?: () => void;
}

export default function Header({
  status = "ONLINE",
  tokenCount = "12.4K",
  onSave,
  onNewProject,
}: HeaderProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleSaveClick = () => {
    if (onSave) {
      onSave();
    } else {
      // Default: copy or notify save
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNewProjectClick = () => {
    if (onNewProject) {
      onNewProject();
    } else {
      router.push("/new-task");
    }
  };

  return (
    <header className="fixed top-5 left-20 right-8 z-30 pointer-events-none flex items-center justify-between">
      {/* Left: Minimal subtle status dot */}
      <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121622]/70 backdrop-blur-md border border-white/[0.06] text-[11px] text-zinc-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-medium text-zinc-300">SE Browser Agent</span>
        <span className="text-zinc-600 font-mono text-[10px]">v2.4</span>
      </div>

      {/* Center/Right: Target Reference Top Actions (+ New Project, Save, Expand) */}
      <div className="pointer-events-auto flex items-center gap-3">
        {/* + New Project Pill Button */}
        <button
          onClick={handleNewProjectClick}
          className="h-9 px-4 rounded-full bg-[#141824]/80 hover:bg-[#1B2130] text-zinc-300 hover:text-white border border-white/[0.1] hover:border-white/[0.2] transition-all text-xs font-normal flex items-center gap-1.5 shadow-md active:scale-95"
        >
          <span className="text-zinc-400 text-sm font-light">+</span>
          <span>New Project</span>
        </button>

        {/* Save White Pill Button with Download Icon (Target exact appearance) */}
        <button
          onClick={handleSaveClick}
          className="h-9 px-5 rounded-full bg-white hover:bg-zinc-100 text-[#090C12] font-semibold text-xs flex items-center gap-1.5 shadow-[0_4px_20px_rgba(255,255,255,0.25)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.35)] transition-all active:scale-95"
          title="Save Project Snapshot"
        >
          <Download className="w-3.5 h-3.5 text-[#090C12] stroke-[2.5]" />
          <span>{copied ? "Saved!" : "Save"}</span>
        </button>

        {/* Expand / Fullscreen Button */}
        <button
          onClick={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen?.();
            } else {
              document.documentElement.requestFullscreen?.();
            }
          }}
          className="w-9 h-9 rounded-xl bg-[#141824]/70 hover:bg-[#1B2130] text-zinc-400 hover:text-white border border-white/[0.08] flex items-center justify-center transition-all shadow-md active:scale-95"
          title="Toggle Fullscreen"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
