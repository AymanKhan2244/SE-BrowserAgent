"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTaskPage() {
  const router = useRouter();

  const [promptText, setPromptText] = useState(
    "Build a multi-tenant billing portal with Stripe webhooks, Next.js server actions, and automated Playwright browser verification for end-to-end checkout flow."
  );

  const [selectedMode, setSelectedMode] = useState("01");

  const [targetRepo, setTargetRepo] = useState("se-browser-agent-core");
  const [gitBranch, setGitBranch] = useState("feat/billing-webhooks");
  const [techStack, setTechStack] = useState("Next.js 14 + Tailwind + Supabase");

  const [autonomyLevel, setAutonomyLevel] = useState("FULL_AUTONOMY");
  const [maxBudget, setMaxBudget] = useState("5.00");
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
      title: "FULL BUILD",
      desc: "Autonomous end-to-end pipeline: spec breakdown, full-stack code synthesis, browser DOM testing, and automated PR submission.",
      footerL: "DOM Intercept: YES",
      footerR: "100% Autonomy",
    },
    {
      id: "02",
      title: "RESEARCH & SPEC",
      desc: "Deep web reconnaissance, external API discovery, competitor architecture mapping, and machine-actionable technical PRDs.",
      footerL: "Web Crawler: ACTIVE",
      footerR: "No Write Perms",
    },
    {
      id: "03",
      title: "CODING ONLY",
      desc: "Surgical codebase refactoring, component generation, unit tests, and typing enforcement without spinning up headless browser sessions.",
      footerL: "Headless: OFF",
      footerR: "Fast Latency",
    },
    {
      id: "04",
      title: "DEBUGGING & FIX",
      desc: "Log parsing, stack trace isolation, memory leak diagnosis, and targeted mutation testing with runtime breakpoint inspection.",
      footerL: "Source Maps: ON",
      footerR: "Iterative Patch",
    },
    {
      id: "05",
      title: "BROWSER AUTOMATION",
      desc: "Pure client-side DOM interactions: web scraping, synthetic user flows, checkout testing, visual regressions, and multi-step forms.",
      footerL: "CDP Protocol: TRUE",
      footerR: "Playwright / Puppeteer",
    },
    {
      id: "06",
      title: "DEPLOYMENT ONLY",
      desc: "Infrastructure orchestration, Docker image optimization, CI/CD pipeline triggering, canary deployments, and DNS validation.",
      footerL: "Cloud Intercept",
      footerR: "Zero Dev State",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-5 space-y-5 px-6">
      {/* SECTION 1: HEADER BANNER */}
      <div className="p-4 bg-surface-container-low border-2 border-outline-variant shadow-[3px_3px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold border border-surface-container-lowest">
              TASK:INIT
            </span>
            <span className="font-code-stream text-code-stream text-secondary-container">
              NODE_INSTANCE #8491-PROD
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface uppercase">
            START NEW ENGINEERING TASK
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Configure agent autonomy parameters, target repositories, runtime sandbox, and execution permissions.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto bg-surface-container-lowest p-2 border border-outline-variant font-code-stream text-code-stream">
          <div className="flex flex-col text-right pr-3 border-r border-outline-variant">
            <span className="font-label-sm text-label-sm text-on-surface-variant">SANDBOX ENGINE</span>
            <span className="text-secondary-fixed font-bold">V8 CHROMIUM 124</span>
          </div>
          <div className="flex flex-col pl-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant">AUTONOMY LIMIT</span>
            <span className="text-primary-fixed font-bold">UNRESTRICTED</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleLaunchTask} className="space-y-5">
        {/* SECTION 2: COMMAND CONSOLE / PROMPT EDITOR */}
        <section className="bg-surface-container-low border-2 border-outline-variant shadow-[3px_3px_0px_#000000]">
          <div className="h-8 bg-surface-container-lowest border-b-2 border-outline-variant px-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase">
              <span className="w-2.5 h-2.5 bg-primary-fixed inline-block"></span>
              <span className="text-primary font-bold">TASK_INTENT_SPECIFICATION.PROMPT</span>
              <span className="text-on-surface-variant">| UTF-8</span>
            </div>
            <div className="flex items-center gap-4 font-code-stream text-code-stream text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="text-secondary-container font-bold">&gt;_</span> AGENT STREAM ACTIVE
              </span>
              <span className="text-outline">LN 1, COL 142</span>
            </div>
          </div>

          <div className="flex bg-surface-container-lowest min-h-[148px]">
            <div className="w-12 select-none py-3 bg-surface-container border-r border-outline-variant flex flex-col items-end pr-2.5 font-code-stream text-code-stream text-on-surface-variant/40 space-y-1">
              <span>01</span>
              <span>02</span>
              <span>03</span>
              <span>04</span>
              <span>05</span>
            </div>
            <div className="flex-1 p-3 font-code-stream text-body-md text-on-surface relative">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full bg-transparent border-0 p-0 text-on-surface font-code-stream text-body-md focus:ring-0 resize-none leading-relaxed focus:outline-none placeholder:text-on-surface-variant/40"
                rows={4}
                spellCheck="false"
              />
              <div className="flex items-center gap-1.5 mt-2 text-secondary-container font-code-stream text-body-sm">
                <span className="animate-pulse">▌</span>
                <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                  Awaiting execution blueprint generation...
                </span>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-surface-container border-t-2 border-outline-variant flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="px-2.5 py-1 bg-surface-container-high border border-outline-variant hover:border-secondary-container hover:text-secondary-container font-label-md text-label-md text-on-surface transition-all flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 shadow-[1px_1px_0px_#000000]"
              >
                <span className="material-symbols-outlined text-sm">attach_file</span>
                <span>[Attach PRD / Spec]</span>
              </button>
              <button
                type="button"
                className="px-2.5 py-1 bg-surface-container-high border border-outline-variant hover:border-secondary-container hover:text-secondary-container font-label-md text-label-md text-on-surface transition-all flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 shadow-[1px_1px_0px_#000000]"
              >
                <span className="material-symbols-outlined text-sm">image</span>
                <span>[Upload Mockup]</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 bg-surface-container-lowest border border-outline-variant font-code-stream text-code-stream text-on-surface-variant flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary-fixed"></span>
                <span>
                  [Context: <strong className="text-primary-fixed">12.4k</strong> / 200k tokens]
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPromptText("")}
                className="px-2 py-1 bg-surface-container-high border border-outline-variant hover:border-primary-fixed text-on-surface font-label-sm text-label-sm uppercase flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">refresh</span>
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 3: AGENT MODE SELECTOR */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-4 bg-primary-fixed"></span>
              <h2 className="font-headline-md text-headline-md font-bold uppercase tracking-tight text-on-surface">
                AGENT MODE SELECTOR
              </h2>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">PIPELINE EXECUTION ARCHITECTURE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {modes.map((m) => {
              const isSelected = selectedMode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMode(m.id)}
                  className={`p-3.5 border-2 shadow-[3px_3px_0px_#000000] cursor-pointer group transition-all ${
                    isSelected
                      ? "bg-surface-container border-primary-fixed shadow-[4px_4px_0px_#000000]"
                      : "bg-surface-container-low border-outline-variant hover:border-secondary-container"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 flex items-center justify-center font-bold text-xs border ${
                          isSelected
                            ? "bg-primary-fixed text-on-primary-fixed border-surface-container-lowest"
                            : "bg-surface-container-highest text-on-surface border-outline-variant"
                        }`}
                      >
                        {m.id}
                      </span>
                      <span
                        className={`font-headline-md text-headline-md font-bold tracking-wide ${
                          isSelected ? "text-primary-fixed" : "text-on-surface group-hover:text-secondary-container"
                        }`}
                      >
                        {m.title}
                      </span>
                    </div>
                    {isSelected ? (
                      <span className="px-1.5 py-0.5 bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold flex items-center gap-1 border border-surface-container-lowest">
                        <span className="material-symbols-outlined text-xs font-bold">check</span>
                        ACTIVE
                      </span>
                    ) : (
                      <span className="font-code-stream text-code-stream text-on-surface-variant">[MODE]</span>
                    )}
                  </div>
                  <p className={`font-body-sm text-body-sm mt-2.5 leading-relaxed ${isSelected ? "text-on-surface" : "text-on-surface-variant"}`}>
                    {m.desc}
                  </p>
                  <div className="mt-3 pt-2 border-t border-outline-variant/60 flex items-center justify-between font-code-stream text-code-stream">
                    <span className={isSelected ? "text-secondary-container" : "text-on-surface-variant"}>{m.footerL}</span>
                    <span className={isSelected ? "text-primary-fixed" : "text-on-surface-variant"}>{m.footerR}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: CONFIGURATION MATRIX */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-code-stream text-xs">
          {/* Target Settings */}
          <div className="bg-surface-container-low border-2 border-outline-variant p-4 shadow-[3px_3px_0px_#000000] flex flex-col gap-3">
            <div className="font-bold text-primary-fixed text-sm border-b border-outline-variant pb-1">
              01 // PROJECT &amp; TARGET CONFIG
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-on-surface-variant uppercase text-[10px]">Target Repository</label>
              <input
                value={targetRepo}
                onChange={(e) => setTargetRepo(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant p-2 text-on-surface focus:border-primary-fixed outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-on-surface-variant uppercase text-[10px]">Git Branch</label>
              <input
                value={gitBranch}
                onChange={(e) => setGitBranch(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant p-2 text-on-surface focus:border-primary-fixed outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-on-surface-variant uppercase text-[10px]">Target Tech Stack</label>
              <input
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant p-2 text-on-surface focus:border-primary-fixed outline-none"
              />
            </div>
          </div>

          {/* Autonomy Controls */}
          <div className="bg-surface-container-low border-2 border-outline-variant p-4 shadow-[3px_3px_0px_#000000] flex flex-col gap-3">
            <div className="font-bold text-secondary-container text-sm border-b border-outline-variant pb-1">
              02 // AGENT AUTONOMY CONTROLS
            </div>
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/40">
              <span className="text-on-surface">Enable Browser Playwright Tests</span>
              <input
                type="checkbox"
                checked={enableBrowserTests}
                onChange={(e) => setEnableBrowserTests(e.target.checked)}
                className="w-4 h-4 accent-primary-fixed cursor-pointer"
              />
            </div>
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/40">
              <span className="text-on-surface">Automated AST Syntax Debugger</span>
              <input
                type="checkbox"
                checked={enableAutoFix}
                onChange={(e) => setEnableAutoFix(e.target.checked)}
                className="w-4 h-4 accent-primary-fixed cursor-pointer"
              />
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-on-surface">Max Token Budget ($ USD)</span>
              <input
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-20 bg-surface-container-lowest border border-outline-variant p-1 text-right text-primary-fixed font-bold outline-none"
              />
            </div>
          </div>
        </section>

        {/* BOTTOM TRIGGER BUTTON */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 bg-primary-fixed text-on-primary-fixed font-headline-md text-base font-bold uppercase tracking-wider border-2 border-surface-container-lowest shadow-[4px_4px_0px_#000000] hover:bg-primary-fixed-dim active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-3 cursor-pointer"
          >
            <span>LAUNCH AUTONOMOUS AGENT ⚡</span>
          </button>
        </div>
      </form>
    </div>
  );
}
