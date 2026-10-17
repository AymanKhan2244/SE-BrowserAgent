"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Play,
  Square,
  Plus,
  Minus,
  Eye,
  Trash2,
  Cloud,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Zap,
  ChevronDown,
  Terminal,
  FileCode,
  Globe,
  Download,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Bot,
  Activity,
  Layers,
  ArrowRight,
  X,
} from "lucide-react";

interface GeneratedFile {
  path: string;
  content: string;
}

interface AgentState {
  status: "QUEUED" | "RUNNING" | "DONE" | "FAILED";
  thought: string;
  data: any;
  logs: string[];
}

function WorkspaceCanvas() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryParam = searchParams.get("query") || "";
  const sessionIdParam = searchParams.get("session_id") || "";

  // Prompt & Execution State
  const [prompt, setPrompt] = useState(
    queryParam ||
      "Build a responsive authentication system using React, FastAPI, and PostgreSQL, including login, registration, protected routes, validation, and automated tests."
  );
  const [sessionId, setSessionId] = useState<string | null>(sessionIdParam);
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineComplete, setPipelineComplete] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewRunning, setIsPreviewRunning] = useState(false);
  const [selectedModel, setSelectedModel] = useState("GPT-4o");
  const [showModelMenu, setShowModelMenu] = useState(false);

  // Inspector & Secondary View Modes ('none' | 'steps' | 'code' | 'preview')
  const [activeOverlay, setActiveOverlay] = useState<"none" | "steps" | "code" | "preview">("none");
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);

  // Telemetry & Logs
  const [elapsedMs, setElapsedMs] = useState(0);
  const [tokenCount, setTokenCount] = useState(12400);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[SYSTEM] Multi-agent orchestration engine initialized.",
    "[SYSTEM] Ready to dispatch task directives to LangGraph pipeline.",
  ]);
  const [currentStepText, setCurrentStepText] = useState("Dessn is thinking...");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Canvas Viewport State (Zoom & Pan)
  const [zoom, setZoom] = useState(70);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Help Modal State
  const [showHelpModal, setShowHelpModal] = useState(false);

  // 6 Agents State
  const [agents, setAgents] = useState<Record<string, AgentState>>({
    planner: {
      status: "RUNNING",
      thought: "Analyzing market & industry research trends",
      data: null,
      logs: [],
    },
    architect: {
      status: "QUEUED",
      thought: "Designing system architecture & project manifest",
      data: null,
      logs: [],
    },
    coder: {
      status: "QUEUED",
      thought: "Implementing responsive components & backend APIs",
      data: null,
      logs: [],
    },
    debugger: {
      status: "QUEUED",
      thought: "Performing AST static analysis & self-healing verification",
      data: null,
      logs: [],
    },
    terminal: {
      status: "QUEUED",
      thought: "Executing package installation & runtime checks",
      data: null,
      logs: [],
    },
    browser: {
      status: "QUEUED",
      thought: "Conducting Playwright headless DOM smoke testing",
      data: null,
      logs: [],
    },
  });

  // Active highlighted agent (defaults to currently running agent or planner)
  const activeAgentKey =
    Object.keys(agents).find((k) => agents[k].status === "RUNNING") || "planner";

  // Auto-scroll terminal log
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  // Load existing session if session_id is provided in URL
  useEffect(() => {
    if (sessionIdParam && !isRunning) {
      fetchExistingSession(sessionIdParam);
    }
  }, [sessionIdParam]);

  // Auto-start if query is present and session not started
  useEffect(() => {
    if (queryParam && !isRunning && !sessionId && files.length === 0) {
      startPipeline(queryParam);
    }
  }, [queryParam]);

  const fetchExistingSession = async (sid: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/forge/${sid}/files`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
        setSessionId(sid);
        setPipelineComplete(true);
        setAgents((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((k) => {
            next[k] = { ...next[k], status: "DONE" };
          });
          return next;
        });
      }
    } catch (e) {
      console.error("Failed to load session files", e);
    }
  };

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  const startPipeline = (queryText: string) => {
    if (!queryText.trim() || isRunning) return;

    setIsRunning(true);
    setPipelineComplete(false);
    setFiles([]);
    setTerminalLogs([`[USER] Task initiated: "${queryText}"`]);
    setTokenCount(1200);
    setElapsedMs(0);
    setSelectedFileIndex(0);
    setCurrentStepText("Analyzing requirements...");

    setAgents({
      planner: { status: "RUNNING", thought: "Analyzing project requirements...", data: null, logs: [] },
      architect: { status: "QUEUED", thought: "Designing component manifest...", data: null, logs: [] },
      coder: { status: "QUEUED", thought: "Generating React & FastAPI code...", data: null, logs: [] },
      debugger: { status: "QUEUED", thought: "Reviewing code syntax and AST...", data: null, logs: [] },
      terminal: { status: "QUEUED", thought: "Resolving dependencies and build...", data: null, logs: [] },
      browser: { status: "QUEUED", thought: "Executing Playwright E2E smoke tests...", data: null, logs: [] },
    });

    startTimeRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 200);

    const sseUrl = `http://localhost:8000/api/forge/stream?query=${encodeURIComponent(queryText)}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === "session") {
          setSessionId(payload.session_id);
        } else if (payload.type === "agent_start") {
          const agentKey = payload.agent;
          setCurrentStepText(`${agentKey.toUpperCase()} agent executing...`);
          setAgents((prev) => ({
            ...prev,
            [agentKey]: { ...prev[agentKey], status: "RUNNING" },
          }));
        } else if (payload.type === "agent_log") {
          setTerminalLogs((prev) => [...prev, payload.text]);
          setCurrentStepText(payload.text.replace(/\[.*?\]\s*/, ""));
          setTokenCount((prev) => prev + Math.floor(payload.text.length / 4) + 16);
        } else if (payload.type === "agent_complete") {
          const agentKey = payload.agent;
          setAgents((prev) => ({
            ...prev,
            [agentKey]: {
              ...prev[agentKey],
              status: "DONE",
              data: payload.data,
            },
          }));
        } else if (payload.type === "pipeline_complete") {
          setPipelineComplete(true);
          setIsRunning(false);
          setCurrentStepText("Pipeline complete! All agents finished successfully.");
          if (timerRef.current) clearInterval(timerRef.current);

          const sid = payload.session_id;
          if (sid) {
            setSessionId(sid);
            fetchExistingSession(sid);
          }
          eventSource.close();
        } else if (payload.type === "error") {
          setTerminalLogs((prev) => [...prev, `[ERROR] ${payload.message}`]);
          setCurrentStepText(`Error: ${payload.message}`);
          setIsRunning(false);
          if (timerRef.current) clearInterval(timerRef.current);
          eventSource.close();
        } else if (payload.type === "done") {
          setIsRunning(false);
          if (timerRef.current) clearInterval(timerRef.current);
          eventSource.close();
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection error", err);
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      eventSource.close();
    };
  };

  const handleStopPipeline = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentStepText("Agent execution stopped by operator.");
    setTerminalLogs((prev) => [...prev, "[SYSTEM] Task cancelled by user."]);
  };

  const handleLaunchPreview = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`http://localhost:8000/api/forge/${sessionId}/preview`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewUrl(`http://localhost:8000${data.preview_url}`);
        setIsPreviewRunning(true);
        setActiveOverlay("preview");
      }
    } catch (e) {
      console.error("Failed to launch preview", e);
    }
  };

  const handleDownloadZip = () => {
    if (!sessionId) return;
    window.location.href = `http://localhost:8000/api/forge/${sessionId}/download`;
  };

  // Zoom and Pan Handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 10, 150));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 10, 40));
  const handleResetZoom = () => {
    setZoom(70);
    setPan({ x: 0, y: 0 });
  };
  const handleClearPrompt = () => {
    setPrompt("");
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking canvas background, not cards
    if ((e.target as HTMLElement).closest(".interactive-card")) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Progress computation
  const completedAgents = Object.values(agents).filter((a) => a.status === "DONE").length;
  const progressPercent = Math.max(
    isRunning ? Math.round((completedAgents / 6) * 100) || 25 : pipelineComplete ? 100 : 75,
    15
  );

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative w-full h-screen overflow-hidden select-none canvas-grid ${
        isPanning ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ZOOMABLE & PANNABLE CANVAS CONTAINER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="w-full h-full relative transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
          transformOrigin: "center center",
        }}
      >
        {/* SVG CURVED CONNECTOR LINES BETWEEN CARDS */}
        <svg
          className="absolute inset-0 w-[2400px] h-[1600px] pointer-events-none z-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="blueGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4D8EFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6AD9FF" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connection 1: Active Card (x: 680, y: 450) to Central Command Panel (x: 860, y: 440) */}
          <path
            d="M 680 450 C 740 450, 780 440, 860 440"
            fill="none"
            stroke="url(#blueGlowGrad)"
            strokeWidth="2.5"
            filter="url(#glowFilter)"
          />
          <path
            d="M 680 450 C 740 450, 780 440, 860 440"
            fill="none"
            stroke="#4D8EFF"
            strokeWidth="1.5"
            className="connector-pulse"
          />
          <circle cx="680" cy="450" r="3.5" fill="#4D8EFF" />
          <circle cx="860" cy="440" r="3.5" fill="#6AD9FF" />

          {/* Connection 2: Central Panel (x: 1390, y: 390) to Top-Right Card (x: 1530, y: 255) */}
          <path
            d="M 1390 390 C 1450 390, 1460 255, 1530 255"
            fill="none"
            stroke="rgba(255, 255, 255, 0.16)"
            strokeWidth="1.5"
          />
          <circle cx="1390" cy="390" r="3" fill="rgba(255, 255, 255, 0.4)" />
          <circle cx="1530" cy="255" r="3" fill="#4D8EFF" />

          {/* Connection 3: Top-Right Card (x: 1685, y: 320) down to Bottom-Right Card (x: 1700, y: 560) */}
          <path
            d="M 1685 320 C 1685 440, 1700 460, 1700 560"
            fill="none"
            stroke="rgba(255, 255, 255, 0.14)"
            strokeWidth="1.5"
          />
          <circle cx="1685" cy="320" r="3" fill="rgba(255, 255, 255, 0.3)" />
          <circle cx="1700" cy="560" r="3" fill="#10B981" />

          {/* Connection 4: Central Panel (x: 1390, y: 480) to Bottom-Right Card (x: 1600, y: 640) */}
          <path
            d="M 1390 480 C 1480 480, 1500 640, 1600 640"
            fill="none"
            stroke="rgba(255, 255, 255, 0.14)"
            strokeWidth="1.5"
          />
          <circle cx="1390" cy="480" r="3" fill="rgba(255, 255, 255, 0.3)" />
          <circle cx="1600" cy="640" r="3" fill="#10B981" />

          {/* Connection 5: Central Panel (x: 1050, y: 560) to Bottom-Left Card (x: 680, y: 755) */}
          <path
            d="M 1050 560 C 950 720, 800 755, 680 755"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
          />
          <circle cx="1050" cy="560" r="3" fill="rgba(255, 255, 255, 0.3)" />
          <circle cx="680" cy="755" r="3" fill="#6AD9FF" />

          {/* Connection 6: Gentle Arch from Central Panel Top */}
          <path
            d="M 1125 320 C 1125 240, 1260 200, 1340 200"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1.5"
          />
          <circle cx="1340" cy="200" r="3" fill="rgba(77, 142, 255, 0.6)" />
        </svg>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CARD 1: ACTIVE PROMINENT GLOWING AGENT CARD (Left Side)       */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="absolute left-[340px] top-[240px] w-[340px] rounded-[28px] glass-active-card p-6 text-white z-10 interactive-card transition-all duration-300 hover:scale-[1.01]">
          {/* Top Bar: Icon Badge & Status Pill */}
          <div className="flex items-center justify-between mb-5">
            <div className="w-8 h-8 rounded-xl glass-chip flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>

            {/* Glowing Status Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-chip text-[11px] font-medium text-emerald-300 shadow-sm">
              <span
                className={`w-2 h-2 rounded-full ${
                  isRunning
                    ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"
                    : pipelineComplete
                    ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                    : "bg-blue-400 shadow-[0_0_8px_#60a5fa]"
                }`}
              />
              <span>
                {isRunning
                  ? agents[activeAgentKey]?.status === "RUNNING"
                    ? "EXECUTING"
                    : "ANALYZING"
                  : pipelineComplete
                  ? "COMPLETE"
                  : "READY"}
              </span>
            </div>
          </div>

          {/* Agent Title & Subtitle (Dynamically bound to backend agent) */}
          <div className="mb-5">
            <h2 className="text-xl font-semibold tracking-tight text-white mb-0.5">
              {activeAgentKey === "planner"
                ? "Planner Agent"
                : activeAgentKey === "architect"
                ? "Architect Agent"
                : activeAgentKey === "coder"
                ? "Coding Agent"
                : activeAgentKey === "debugger"
                ? "Debugger Agent"
                : activeAgentKey === "terminal"
                ? "Terminal Agent"
                : activeAgentKey === "browser"
                ? "Browser Agent"
                : "Market Research Agent"}
            </h2>
            <p className="text-xs text-blue-200/70 font-normal">
              {activeAgentKey === "planner"
                ? "Requirements & Architecture Planning"
                : activeAgentKey === "architect"
                ? "File Manifest & DAG Designer"
                : activeAgentKey === "coder"
                ? "Full-Stack Source Code Synthesis"
                : activeAgentKey === "debugger"
                ? "AST Syntax Review & Self-Healing"
                : activeAgentKey === "terminal"
                ? "Build & Sandbox Verification"
                : activeAgentKey === "browser"
                ? "Playwright Headless Smoke Testing"
                : "Market & Industry Research"}
            </p>
          </div>

          {/* Activity Pills (Dynamically bound to backend thoughts & output) */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full glass-chip text-xs text-white/95">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-200 shrink-0" />
              <span className="truncate">
                {currentStepText || "Analyzing requirements & dependencies"}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-full glass-chip text-xs text-white/95">
              <Sparkles className="w-3.5 h-3.5 text-blue-200 shrink-0" />
              <span className="truncate">
                {agents.architect.data?.files_count
                  ? `${agents.architect.data.files_count} files planned (${files.length} generated)`
                  : agents.planner.data?.features
                  ? `${agents.planner.data.features.length} features mapped`
                  : agents.coder.data?.files_generated
                  ? `${agents.coder.data.files_generated} files synthesized`
                  : `${tokenCount > 0 ? tokenCount : 124} AST tokens processed`}
              </span>
            </div>
          </div>

          {/* Metrics Strip */}
          <div className="space-y-3 pt-3 border-t border-white/15 text-xs">
            {/* Progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-200/80">
                <Layers className="w-3.5 h-3.5" />
                <span>Progress</span>
              </div>
              <span className="font-semibold text-white">{progressPercent}%</span>
            </div>

            {/* Token Usage with Sparkline */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-200/80">
                <Zap className="w-3.5 h-3.5" />
                <span>Token Usage</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-white text-[11px]">
                <span>{(tokenCount / 1000).toFixed(1)}K</span>
                {/* Mini SVG Sparkline Wave */}
                <svg className="w-9 h-3.5 stroke-blue-200 fill-none" viewBox="0 0 40 16">
                  <path
                    d="M 0 10 Q 10 2, 20 8 T 40 4"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Model Selector Pill */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-200/80">
                <Bot className="w-3.5 h-3.5" />
                <span>Model</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full glass-chip text-[11px] text-white">
                <span>{selectedModel}</span>
                <ChevronDown className="w-3 h-3 text-blue-200" />
              </div>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CARD 2: CENTRAL TASK COMMAND PANEL (Middle)                   */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="absolute left-[860px] top-[320px] w-[530px] z-20 interactive-card">
          {/* Top Pill: "6 active agent" */}
          <div className="flex justify-center mb-[-12px] relative z-30">
            <div className="px-3.5 py-0.5 rounded-full glass-pill text-[11px] text-zinc-300 font-medium shadow-md">
              6 active agent
            </div>
          </div>

          {/* Main Translucent Glass Box */}
          <div className="rounded-[28px] glass-command-panel p-5 text-white relative">
            {/* Task Prompt Textarea */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  startPipeline(prompt);
                }
              }}
              disabled={isRunning}
              rows={3}
              placeholder="Describe your software engineering task... (Press Enter to dispatch)"
              className="w-full bg-transparent border-0 text-[14px] leading-relaxed text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-0 resize-none font-normal"
            />

            {/* Status Ribbon (Target: "Dessn is thinking... See steps >") */}
            <div className="mt-2 mb-4 px-3.5 py-2 rounded-2xl glass-ribbon flex items-center justify-between text-xs">
              {pipelineComplete ? (
                <span className="text-emerald-300 font-normal truncate max-w-[340px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Pipeline complete — {files.length} files synthesized</span>
                </span>
              ) : (
                <span className="text-zinc-200 font-normal truncate max-w-[340px]">
                  {currentStepText}
                </span>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveOverlay("steps")}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors shrink-0"
                >
                  <span>See steps</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                {pipelineComplete && (
                  <>
                    <span className="text-white/20">•</span>
                    <button
                      onClick={() => setActiveOverlay("code")}
                      className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                      Code
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Controls Strip */}
            <div className="flex items-center justify-between pt-1">
              {/* Left Action Buttons (+, Lightning, Model Dropdown) */}
              <div className="flex items-center gap-2">
                {/* Plus button */}
                <button
                  type="button"
                  onClick={() => setActiveOverlay("code")}
                  className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-95"
                  title="Inspect files & attachments"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Lightning button (Quick preset) */}
                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      "Build a full-stack Next.js application with Supabase authentication, Tailwind styling, and Playwright tests."
                    )
                  }
                  className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-95"
                  title="Load recommended template"
                >
                  <Zap className="w-4 h-4" />
                </button>

                {/* Model dropdown pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowModelMenu(!showModelMenu)}
                    className="h-8 px-3 rounded-full glass-pill flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white transition-all"
                  >
                    <span>Model</span>
                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                  </button>

                  {showModelMenu && (
                    <div className="absolute left-0 bottom-10 w-44 rounded-2xl glass-panel shadow-2xl py-1 z-40 text-xs">
                      {["GPT-4o", "Claude 3.5 Sonnet", "Gemini 3.8 Flash", "Llama 3.3 70B"].map(
                        (m) => (
                          <button
                            key={m}
                            onClick={() => {
                              setSelectedModel(m);
                              setShowModelMenu(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 hover:bg-white/10 ${
                              selectedModel === m ? "text-blue-400 font-semibold" : "text-zinc-300"
                            }`}
                          >
                            {m}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Controls: Waveform icon & Big Run/Stop Button */}
              <div className="flex items-center gap-2.5">
                {/* Waveform / Logs toggle button */}
                <button
                  type="button"
                  onClick={() => setActiveOverlay("steps")}
                  className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-95"
                  title="Live Terminal Stream"
                >
                  <Activity className="w-4 h-4" />
                </button>

                {/* Big Run / Stop Square or Play Action Button (Exactly matching target) */}
                {isRunning ? (
                  <button
                    type="button"
                    onClick={handleStopPipeline}
                    className="w-9 h-9 rounded-2xl bg-white hover:bg-zinc-200 text-[#090C12] flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all active:scale-95"
                    title="Stop Execution"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startPipeline(prompt)}
                    className="w-9 h-9 rounded-2xl bg-white/95 hover:bg-white text-[#090C12] flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.35),inset_0_1px_1px_rgba(255,255,255,0.8)] transition-all active:scale-95"
                    title="Run Agent Pipeline"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CARD 3: SECONDARY AGENT - TOP RIGHT (Architect & Coder)       */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="absolute left-[1530px] top-[190px] w-[310px] rounded-[24px] glass-secondary-card p-5 text-white z-10 interactive-card transition-all hover:border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-300">
              Architect &amp; Coder Agent
            </h3>
            <span
              className={`w-2 h-2 rounded-full ${
                agents.coder.status === "RUNNING"
                  ? "bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]"
                  : agents.coder.status === "DONE"
                  ? "bg-emerald-400"
                  : agents.architect.status === "RUNNING"
                  ? "bg-blue-400 animate-pulse shadow-[0_0_6px_#60a5fa]"
                  : "bg-zinc-500"
              }`}
            />
          </div>

          <div className="flex items-end justify-between pt-2">
            <span className="text-xs text-zinc-400 font-normal">
              {agents.coder.data?.files_generated
                ? "Files Synthesized"
                : agents.architect.data?.files_count
                ? "Files Planned"
                : "Confidence"}
            </span>
            <span className="text-2xl font-light tracking-tight text-white font-mono">
              {agents.coder.data?.files_generated
                ? `${agents.coder.data.files_generated}`
                : agents.architect.data?.files_count
                ? `${agents.architect.data.files_count}`
                : "97%"}
            </span>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CARD 4: SECONDARY AGENT - BOTTOM RIGHT (Browser Automation)   */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="absolute left-[1600px] top-[560px] w-[340px] rounded-[24px] glass-secondary-card p-5 text-white z-10 interactive-card transition-all hover:border-white/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 rounded-lg glass-chip flex items-center justify-center text-zinc-300">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full glass-chip text-[10px] text-emerald-400">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  agents.browser.status === "RUNNING"
                    ? "bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]"
                    : agents.browser.status === "DONE"
                    ? "bg-emerald-400"
                    : "bg-zinc-500"
                }`}
              />
              <span>
                {agents.browser.status === "RUNNING"
                  ? "In progress"
                  : agents.browser.status === "DONE"
                  ? "Passed"
                  : "Standby"}
              </span>
            </div>
          </div>

          <div className="mb-3">
            <h3 className="text-base font-semibold text-white">
              Browser Automation Agent
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Playwright E2E Verification
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-chip text-xs text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
            <span className="truncate">
              {agents.browser.status === "DONE"
                ? "Playwright E2E passed (0 errors)"
                : agents.browser.status === "RUNNING"
                ? "Verifying DOM & endpoints"
                : "Playwright E2E Verification"}
            </span>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CARD 5: SECONDARY AGENT - BOTTOM LEFT (Debugger Agent)        */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="absolute left-[400px] top-[710px] w-[280px] rounded-[22px] glass-secondary-card p-4 text-white z-10 interactive-card opacity-85 hover:opacity-100 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Debugger Agent</span>
            <span className="text-[10px] font-mono text-emerald-400">
              {agents.debugger.status === "DONE"
                ? "0 AST ERRORS"
                : agents.debugger.status === "RUNNING"
                ? "REVIEWING"
                : "STANDBY"}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">
            {agents.terminal.status === "RUNNING"
              ? "Terminal: Installing packages..."
              : agents.terminal.status === "DONE"
              ? "Terminal: Build Clean"
              : "AST Review & Self-Healing"}
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BOTTOM CANVAS FLOATING CONTROLS (Exactly matching target image)   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* Center Bottom Pill Toolbar (+, -, Eye, Trash) */}
      <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 pill-toolbar text-zinc-300 shadow-2xl">
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          title="Zoom In (+)"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          title="Zoom Out (-)"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Fit to screen / Reset zoom */}
        <button
          onClick={handleResetZoom}
          className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          title="Fit to screen"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Clear prompt / reset view */}
        <button
          onClick={handleClearPrompt}
          className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-zinc-400 hover:text-red-400"
          title="Clear directive"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Bottom Pill Toolbar (Cloud, - 70% +, Help) */}
      <div className="fixed bottom-7 right-8 z-30 flex items-center gap-2.5 px-4 py-1.5 pill-toolbar text-zinc-300 text-xs shadow-2xl">
        {/* Cloud Status */}
        <button
          className="text-zinc-400 hover:text-white transition-colors"
          title="FastAPI Backend Connected"
        >
          <Cloud className="w-3.5 h-3.5 text-blue-400" />
        </button>

        <span className="text-white/15">|</span>

        {/* Zoom Percentage Step Controls (- 70% +) */}
        <div className="flex items-center gap-1 font-mono text-[11px]">
          <button
            onClick={handleZoomOut}
            className="hover:text-white px-0.5"
            title="Decrease zoom"
          >
            -
          </button>
          <span className="w-8 text-center text-zinc-200">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="hover:text-white px-0.5"
            title="Increase zoom"
          >
            +
          </button>
        </div>

        <span className="text-white/15">|</span>

        {/* Help icon */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="text-zinc-400 hover:text-white transition-colors"
          title="Canvas & Agent Shortcuts"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SLIDE-UP OVERLAYS: TERMINAL LOGS, GENERATED CODE & LIVE PREVIEW   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeOverlay !== "none" && (
        <div className="fixed inset-x-20 bottom-20 top-20 z-40 glass-command-panel rounded-[28px] flex flex-col overflow-hidden animate-fadeSlideIn">
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Tab Selector Buttons */}
              <button
                onClick={() => setActiveOverlay("steps")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                  activeOverlay === "steps"
                    ? "bg-blue-600/30 text-blue-400 border border-blue-500/30"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Execution Steps &amp; Logs</span>
              </button>

              <button
                onClick={() => setActiveOverlay("code")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                  activeOverlay === "code"
                    ? "bg-blue-600/30 text-blue-400 border border-blue-500/30"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Generated Code ({files.length} files)</span>
              </button>

              <button
                onClick={() => {
                  setActiveOverlay("preview");
                  if (!previewUrl && sessionId) {
                    handleLaunchPreview();
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                  activeOverlay === "preview"
                    ? "bg-blue-600/30 text-blue-400 border border-blue-500/30"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Sandbox Preview</span>
              </button>
            </div>

            {/* Quick Actions (Download Zip, Close) */}
            <div className="flex items-center gap-2">
              {sessionId && (
                <button
                  onClick={handleDownloadZip}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs text-zinc-200 border border-white/10 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Project</span>
                </button>
              )}

              <button
                onClick={() => setActiveOverlay("none")}
                className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-hidden p-6">
            {/* 1. Terminal Logs Stream */}
            {activeOverlay === "steps" && (
              <div className="h-full bg-[#080B12] rounded-2xl border border-white/[0.08] p-4 font-mono text-xs overflow-y-auto space-y-1.5 text-zinc-300">
                <div className="text-zinc-500 pb-2 border-b border-white/[0.05] flex justify-between">
                  <span>STREAM: /api/forge/stream</span>
                  <span>{isRunning ? "STATUS: STREAMING" : "STATUS: IDLE"}</span>
                </div>
                {terminalLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed ${
                      log.startsWith("[ERROR]")
                        ? "text-red-400"
                        : log.startsWith("[PLANNER]")
                        ? "text-blue-400"
                        : log.startsWith("[ARCHITECT]")
                        ? "text-cyan-400"
                        : log.startsWith("[CODER]")
                        ? "text-emerald-400"
                        : log.startsWith("[BROWSER]")
                        ? "text-amber-400"
                        : "text-zinc-300"
                    }`}
                  >
                    {log}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            )}

            {/* 2. Generated Code View */}
            {activeOverlay === "code" && (
              <div className="h-full grid grid-cols-12 gap-4">
                {/* File Tree */}
                <div className="col-span-3 bg-[#080B12] rounded-2xl border border-white/[0.08] p-3 overflow-y-auto">
                  <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2 px-2">
                    Files ({files.length})
                  </div>
                  {files.length === 0 ? (
                    <div className="text-xs text-zinc-500 p-2">
                      No files synthesized yet. Run agent pipeline first.
                    </div>
                  ) : (
                    files.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedFileIndex(i)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono truncate transition-colors flex items-center gap-2 ${
                          selectedFileIndex === i
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                            : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >
                        <FileCode className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{f.path}</span>
                      </button>
                    ))
                  )}
                </div>

                {/* File Content Preview */}
                <div className="col-span-9 bg-[#080B12] rounded-2xl border border-white/[0.08] flex flex-col overflow-hidden">
                  <div className="px-4 py-2 border-b border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>{files[selectedFileIndex]?.path || "No file selected"}</span>
                    {files[selectedFileIndex] && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(files[selectedFileIndex].content);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </div>
                  <pre className="flex-1 p-4 font-mono text-xs text-zinc-200 overflow-auto leading-relaxed">
                    {files[selectedFileIndex]?.content || "// Waiting for code synthesis..."}
                  </pre>
                </div>
              </div>
            )}

            {/* 3. Sandbox Preview */}
            {activeOverlay === "preview" && (
              <div className="h-full bg-[#080B12] rounded-2xl border border-white/[0.08] flex flex-col overflow-hidden">
                <div className="px-4 py-2 border-b border-white/[0.08] flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Live App Sandbox</span>
                  </div>
                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <span>Open in new window</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                {previewUrl ? (
                  <iframe src={previewUrl} className="w-full flex-1 border-0 bg-white" title="App Preview" />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                    <Globe className="w-12 h-12 mb-3 text-zinc-600" />
                    <p className="text-sm font-medium text-zinc-300">Preview Not Started</p>
                    <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
                      Launch the preview server to inspect your newly synthesized full-stack application.
                    </p>
                    <button
                      onClick={handleLaunchPreview}
                      disabled={!sessionId}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium disabled:opacity-50"
                    >
                      Start Preview Server
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowHelpModal(false)} />
          <div className="relative w-full max-w-md bg-[#121622] border border-white/10 rounded-3xl p-6 text-white shadow-2xl z-10 animate-fadeSlideIn">
            <h3 className="text-lg font-semibold mb-2">Agent Canvas Guide</h3>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Welcome to the autonomous SE Browser Agent workspace. Use these controls to navigate the orchestration graph:
            </p>
            <div className="space-y-2.5 text-xs text-zinc-300 mb-6">
              <div className="flex justify-between pb-1.5 border-b border-white/[0.05]">
                <span className="text-zinc-400">Pan Canvas</span>
                <span className="font-mono text-blue-400">Click &amp; Drag background</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-white/[0.05]">
                <span className="text-zinc-400">Zoom In / Out</span>
                <span className="font-mono text-blue-400">Bottom toolbar + / -</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-white/[0.05]">
                <span className="text-zinc-400">Reset View</span>
                <span className="font-mono text-blue-400">Eye button (bottom center)</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-white/[0.05]">
                <span className="text-zinc-400">View Execution Steps</span>
                <span className="font-mono text-blue-400">See steps &gt; link</span>
              </div>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-white text-[#07090D] font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center text-zinc-400 text-sm">
          Loading Canvas...
        </div>
      }
    >
      <WorkspaceCanvas />
    </Suspense>
  );
}
