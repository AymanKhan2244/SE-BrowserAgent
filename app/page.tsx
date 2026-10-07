"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [promptDirective, setPromptDirective] = useState("");

  const handleStartAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptDirective.trim()) return;
    router.push(`/workspace?query=${encodeURIComponent(promptDirective.trim())}`);
  };

  const setPresetPrompt = (text: string) => {
    setPromptDirective(text);
  };

  return (
    <div className="p-5 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* SECTION 1: HERO TASK DISPATCHER */}
      <section className="bg-surface-container-low brutal-border brutal-shadow p-5 relative overflow-hidden">
        {/* Industrial accent corner tag */}
        <div className="absolute top-0 right-0 bg-primary-fixed text-on-primary-fixed font-code-stream text-[10px] font-bold px-3 py-0.5 border-b border-l border-surface-container-lowest">
          AI_ENGINE_DISPATCH: STANDBY
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-fixed text-[26px]">smart_toy</span>
            <h1 className="font-headline-xl text-headline-xl text-primary uppercase tracking-tight">
              WHAT DO YOU WANT TO BUILD TODAY?
            </h1>
          </div>
          {/* Model tag & Autonomy Toggle */}
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-surface-container-highest border border-outline-variant font-code-stream text-body-sm text-secondary-container">
              [Claude 3.5 Sonnet + Headless CDP]
            </span>
            <div className="flex items-center gap-2 bg-surface-container-lowest px-2.5 py-1 border border-outline-variant">
              <span className="font-code-stream text-label-sm text-on-surface-variant">Deterministic Autonomy</span>
              <span className="font-code-stream text-label-sm font-bold text-primary-fixed">[ON]</span>
            </div>
          </div>
        </div>

        {/* Big AI Engineering Prompt Box */}
        <form onSubmit={handleStartAgent} className="relative bg-surface-container-lowest border-2 border-outline-variant brutal-shadow-sm focus-within:border-primary-fixed focus-within:shadow-[3px_3px_0px_#fde400] transition-all">
          <div className="px-3 py-1.5 bg-surface border-b border-outline-variant flex items-center justify-between font-code-stream text-label-sm text-outline">
            <div className="flex items-center gap-2">
              <span className="text-secondary-container font-bold">&gt;&gt;&gt;</span>
              <span>AGENT DOM DIRECTIVE</span>
            </div>
            <span>CTX_WINDOW: 200K / STRICT_SWE_POLICY</span>
          </div>
          <textarea
            value={promptDirective}
            onChange={(e) => setPromptDirective(e.target.value)}
            className="w-full bg-transparent border-0 text-on-surface font-code-stream text-body-lg p-3.5 placeholder:text-outline-variant focus:ring-0 focus:outline-none resize-none leading-relaxed"
            placeholder="Describe what you want your autonomous AI engineer to build... e.g. Build a SaaS dashboard with Next.js 14, Supabase auth, Stripe billing and automated Playwright browser tests."
            rows={3}
          />
          {/* Prompt Controls Strip */}
          <div className="p-2.5 bg-surface border-t border-outline-variant flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-variant text-on-surface font-code-stream text-body-sm border border-outline-variant flex items-center gap-1.5 hover:border-secondary-container transition-all brutal-btn-press"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary-container">attach_file</span>
                <span>[+ Attach Specs / PRD]</span>
              </button>
              <button
                type="button"
                onClick={() => setPresetPrompt("Build a full-stack Next.js 14 application with Supabase authentication and Tailwind styling.")}
                className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-variant text-on-surface font-code-stream text-body-sm border border-outline-variant flex items-center gap-1.5 hover:border-secondary-container transition-all brutal-btn-press"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary-container">dashboard_customize</span>
                <span>[Use Template]</span>
              </button>
              <Link
                href="/new-task"
                className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-variant text-on-surface font-code-stream text-body-sm border border-outline-variant flex items-center gap-1.5 hover:border-secondary-container transition-all brutal-btn-press"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary-container">tune</span>
                <span>[Advanced Sandbox Config]</span>
              </Link>
            </div>
            {/* Primary Execute Action */}
            <button
              type="submit"
              disabled={!promptDirective.trim()}
              className="px-6 py-2 bg-primary-fixed text-on-primary-fixed font-headline-md text-headline-md font-bold border-2 border-surface-container-lowest shadow-[3px_3px_0px_#000000] hover:bg-primary-fixed-dim transition-all flex items-center gap-2 brutal-btn-press disabled:opacity-50 cursor-pointer"
            >
              <span>START AGENT ⚡</span>
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 2: QUICK WORKFLOWS ACTION CARDS */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setPresetPrompt("Build a Full-Stack application with Next.js 14, TypeScript, Tailwind, and PostgreSQL.")}
          className="p-3 bg-surface-container-low brutal-border brutal-shadow hover:border-primary-fixed hover:-translate-y-0.5 transition-all text-left group flex flex-col justify-between h-24 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="material-symbols-outlined text-secondary-container group-hover:text-primary-fixed transition-colors">web</span>
            <span className="font-code-stream text-[10px] text-outline">[01]</span>
          </div>
          <div>
            <span className="font-label-lg text-label-lg font-bold block text-on-surface group-hover:text-primary-fixed">FULL-STACK APP</span>
            <span className="font-code-stream text-[10px] text-outline">Next.js + Postgres</span>
          </div>
        </button>

        <button
          onClick={() => setPresetPrompt("Build an Autonomous AI Agent system using LangChain, OpenAI tools, and browser automation.")}
          className="p-3 bg-surface-container-low brutal-border brutal-shadow hover:border-primary-fixed hover:-translate-y-0.5 transition-all text-left group flex flex-col justify-between h-24 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="material-symbols-outlined text-secondary-container group-hover:text-primary-fixed transition-colors">smart_toy</span>
            <span className="font-code-stream text-[10px] text-outline">[02]</span>
          </div>
          <div>
            <span className="font-label-lg text-label-lg font-bold block text-on-surface group-hover:text-primary-fixed">AI AGENT</span>
            <span className="font-code-stream text-[10px] text-outline">LangChain + Tool Use</span>
          </div>
        </button>

        <button
          onClick={() => setPresetPrompt("Perform deep web research and generate a technical PRD specification document.")}
          className="p-3 bg-surface-container-low brutal-border brutal-shadow hover:border-primary-fixed hover:-translate-y-0.5 transition-all text-left group flex flex-col justify-between h-24 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="material-symbols-outlined text-secondary-container group-hover:text-primary-fixed transition-colors">description</span>
            <span className="font-code-stream text-[10px] text-outline">[03]</span>
          </div>
          <div>
            <span className="font-label-lg text-label-lg font-bold block text-on-surface group-hover:text-primary-fixed">RESEARCH & SPEC</span>
            <span className="font-code-stream text-[10px] text-outline">Deep DOM scraping</span>
          </div>
        </button>

        <button
          onClick={() => setPresetPrompt("Analyze code repository for AST bugs, type errors, and apply automated hotpatches.")}
          className="p-3 bg-surface-container-low brutal-border brutal-shadow hover:border-primary-fixed hover:-translate-y-0.5 transition-all text-left group flex flex-col justify-between h-24 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="material-symbols-outlined text-secondary-container group-hover:text-primary-fixed transition-colors">bug_report</span>
            <span className="font-code-stream text-[10px] text-outline">[04]</span>
          </div>
          <div>
            <span className="font-label-lg text-label-lg font-bold block text-on-surface group-hover:text-primary-fixed">DEBUG & FIX</span>
            <span className="font-code-stream text-[10px] text-outline">Automated Hotpatch</span>
          </div>
        </button>

        <button
          onClick={() => setPresetPrompt("Build an automated Playwright E2E browser test suite verifying user interaction workflows.")}
          className="p-3 bg-surface-container-low brutal-border brutal-shadow hover:border-primary-fixed hover:-translate-y-0.5 transition-all text-left group flex flex-col justify-between h-24 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="material-symbols-outlined text-secondary-container group-hover:text-primary-fixed transition-colors">task_alt</span>
            <span className="font-code-stream text-[10px] text-outline">[05]</span>
          </div>
          <div>
            <span className="font-label-lg text-label-lg font-bold block text-on-surface group-hover:text-primary-fixed">BROWSER TEST</span>
            <span className="font-code-stream text-[10px] text-outline">Playwright E2E Suite</span>
          </div>
        </button>

        <button
          onClick={() => setPresetPrompt("Deploy project onto Vercel serverless edge with automated environment validation.")}
          className="p-3 bg-surface-container-low brutal-border brutal-shadow hover:border-primary-fixed hover:-translate-y-0.5 transition-all text-left group flex flex-col justify-between h-24 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="material-symbols-outlined text-secondary-container group-hover:text-primary-fixed transition-colors">rocket_launch</span>
            <span className="font-code-stream text-[10px] text-outline">[06]</span>
          </div>
          <div>
            <span className="font-label-lg text-label-lg font-bold block text-on-surface group-hover:text-primary-fixed">DEPLOY</span>
            <span className="font-code-stream text-[10px] text-outline">Vercel & Fly.io Edge</span>
          </div>
        </button>
      </section>

      {/* SECTION 3: MIDDLE SPLIT (ACTIVE TASKS & LIVE SYSTEM STREAM) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: ACTIVE TASKS TABLE */}
        <div className="lg:col-span-7 bg-surface-container-low brutal-border brutal-shadow flex flex-col">
          <div className="h-9 px-3 bg-surface-container border-b-2 border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-primary-fixed inline-block"></span>
              <span className="font-headline-md text-body-md font-bold tracking-wider text-on-surface">
                ACTIVE TASKS EXECUTION QUEUE
              </span>
            </div>
            <div className="flex items-center gap-2 font-code-stream text-label-sm text-outline">
              <span>THREADS: 2 RUNNING</span>
              <span>|</span>
              <Link href="/tasks" className="text-secondary-container hover:underline">
                VIEW ALL &gt;
              </Link>
            </div>
          </div>

          <div className="p-3 flex flex-col gap-3 flex-1">
            {/* Active Task 1 */}
            <div className="p-3 bg-surface-container border-2 border-outline-variant relative">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-code-stream text-body-sm font-bold text-on-surface">
                      Task #8821: OAuth NextAuth Implementation
                    </span>
                    <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed font-code-stream font-bold text-[10px] border border-surface-container-lowest">
                      CODING [Stage 4/8]
                    </span>
                  </div>
                  <p className="font-code-stream text-[11px] text-on-surface-variant">
                    Writing callback handlers &amp; Supabase session bridge tokens
                  </p>
                </div>
                <Link
                  href="/workspace?session_id=8821"
                  className="px-3 py-1 bg-surface-container-highest border border-outline-variant font-code-stream text-label-sm text-primary-fixed hover:bg-primary-fixed hover:text-on-primary-fixed hover:border-surface-container-lowest transition-all brutal-btn-press whitespace-nowrap"
                >
                  OPEN WORKSPACE &gt;
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2 font-code-stream text-label-sm py-1.5 my-1.5 border-y border-surface-container-high text-outline">
                <div>ELAPSED: <span className="text-on-surface font-semibold">08:42</span></div>
                <div>DIFF: <span className="text-secondary-container font-semibold">18 files changed</span></div>
                <div>TEST COVERAGE: <span className="text-on-surface font-semibold">89.4%</span></div>
              </div>

              <div className="mt-2">
                <div className="flex justify-between font-code-stream text-[10px] text-outline mb-1">
                  <span>STEP: SYNTHESIZING_JWT_STRATEGY</span>
                  <span className="text-primary-fixed font-bold">54%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-lowest border border-outline-variant p-[1px]">
                  <div className="h-full bg-primary-fixed w-[54%]"></div>
                </div>
              </div>
            </div>

            {/* Active Task 2 */}
            <div className="p-3 bg-surface-container border border-outline-variant">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-code-stream text-body-sm font-bold text-on-surface">
                      Task #8819: Stripe Webhook Idempotency
                    </span>
                    <span className="px-2 py-0.5 bg-surface-container-highest text-secondary-container font-code-stream font-bold text-[10px] border border-secondary-container">
                      RESEARCHING
                    </span>
                  </div>
                  <p className="font-code-stream text-[11px] text-on-surface-variant">
                    Analyzing stripe-event-signature replay attacks and redis locks
                  </p>
                </div>
                <Link
                  href="/workspace?session_id=8819"
                  className="px-3 py-1 bg-surface-container-highest border border-outline-variant font-code-stream text-label-sm text-on-surface hover:border-secondary-container transition-all brutal-btn-press whitespace-nowrap"
                >
                  INSPECT &gt;
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2 font-code-stream text-label-sm py-1.5 my-1.5 border-y border-surface-container-high text-outline">
                <div>ELAPSED: <span className="text-on-surface font-semibold">02:15</span></div>
                <div>DIFF: <span className="text-secondary-container font-semibold">3 files spec'd</span></div>
                <div>BROWSER CDP: <span className="text-primary-fixed font-semibold">ACTIVE</span></div>
              </div>

              <div className="mt-2">
                <div className="flex justify-between font-code-stream text-[10px] text-outline mb-1">
                  <span>STEP: FETCHING_STRIPE_API_DOCS</span>
                  <span className="text-secondary-container font-bold">25%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-lowest border border-outline-variant p-[1px]">
                  <div className="h-full bg-secondary-container w-[25%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE SYSTEM STREAM */}
        <div className="lg:col-span-5 bg-surface-container-low brutal-border brutal-shadow flex flex-col">
          <div className="h-9 px-3 bg-surface-container border-b-2 border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-ping"></span>
              <span className="font-headline-md text-body-md font-bold tracking-wider text-on-surface">
                LIVE SYSTEM STREAM
              </span>
            </div>
            <span className="font-code-stream text-[10px] text-outline">STREAM_PORT: 8089/WS</span>
          </div>

          <div className="p-3 bg-surface-container-lowest font-code-stream text-body-sm flex-1 flex flex-col justify-between gap-1.5 overflow-hidden">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between py-1 border-b border-surface-container-high">
                <div className="flex items-center gap-2">
                  <span className="text-outline text-label-sm">10:42</span>
                  <span className="text-primary-fixed font-bold">✓</span>
                  <span className="text-on-surface">Research completed</span>
                </div>
                <span className="text-[10px] text-outline">DOM.dump(142kb)</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-surface-container-high">
                <div className="flex items-center gap-2">
                  <span className="text-outline text-label-sm">10:44</span>
                  <span className="text-primary-fixed font-bold">✓</span>
                  <span className="text-on-surface">14 files generated</span>
                </div>
                <span className="text-[10px] text-outline">+2,410 LOC</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-surface-container-high">
                <div className="flex items-center gap-2">
                  <span className="text-outline text-label-sm">10:47</span>
                  <span className="text-secondary-container font-bold">→</span>
                  <span className="text-secondary-container">Browser testing</span>
                </div>
                <span className="text-[10px] text-secondary-container bg-surface-container px-1">HEADLESS CHROME</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-surface-container-high bg-error-container/20 px-1 border-l-2 border-l-error">
                <div className="flex items-center gap-2">
                  <span className="text-outline text-label-sm">10:49</span>
                  <span className="text-error font-bold">⚠</span>
                  <span className="text-error font-medium">Authentication failed</span>
                </div>
                <span className="text-[10px] text-error font-bold">ERR_401</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-surface-container-high">
                <div className="flex items-center gap-2">
                  <span className="text-outline text-label-sm">10:50</span>
                  <span className="text-primary-fixed font-bold">✓</span>
                  <span className="text-on-surface">Auto-patch applied</span>
                </div>
                <span className="text-[10px] text-primary-fixed font-bold">SELF_HEALED</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
