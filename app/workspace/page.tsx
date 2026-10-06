"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryParam = searchParams.get("query") || "";
  const sessionIdParam = searchParams.get("session_id") || "";

  const [prompt, setPrompt] = useState(queryParam);
  const [sessionId, setSessionId] = useState<string | null>(sessionIdParam);
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineComplete, setPipelineComplete] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewRunning, setIsPreviewRunning] = useState(false);

  // Active Tab: 'code' | 'preview' | 'terminal'
  const [activeViewTab, setActiveViewTab] = useState<"code" | "preview" | "terminal">("code");
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [files, setFiles] = useState<GeneratedFile[]>([]);

  // Telemetry & Logs
  const [elapsedMs, setElapsedMs] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // 6 Agents State
  const [agents, setAgents] = useState<Record<string, AgentState>>({
    planner: { status: "QUEUED", thought: "", data: null, logs: [] },
    architect: { status: "QUEUED", thought: "", data: null, logs: [] },
    coder: { status: "QUEUED", thought: "", data: null, logs: [] },
    debugger: { status: "QUEUED", thought: "", data: null, logs: [] },
    terminal: { status: "QUEUED", thought: "", data: null, logs: [] },
    browser: { status: "QUEUED", thought: "", data: null, logs: [] },
  });

  const agentOrder = ["planner", "architect", "coder", "debugger", "terminal", "browser"];

  // Timer interval ref
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

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
        // Set agents to DONE for loaded session
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

  const startPipeline = (queryText: string) => {
    if (!queryText.trim() || isRunning) return;

    setIsRunning(true);
    setPipelineComplete(false);
    setFiles([]);
    setTerminalLogs([]);
    setTokenCount(0);
    setElapsedMs(0);
    setSelectedFileIndex(0);

    // Reset agents
    setAgents({
      planner: { status: "QUEUED", thought: "Analyzing project requirements...", data: null, logs: [] },
      architect: { status: "QUEUED", thought: "Designing component manifest...", data: null, logs: [] },
      coder: { status: "QUEUED", thought: "Generating React & TypeScript code...", data: null, logs: [] },
      debugger: { status: "QUEUED", thought: "Reviewing code syntax and AST...", data: null, logs: [] },
      terminal: { status: "QUEUED", thought: "Resolving dependencies and build...", data: null, logs: [] },
      browser: { status: "QUEUED", thought: "Executing Playwright E2E smoke tests...", data: null, logs: [] },
    });

    startTimeRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 200);

    // SSE EventSource connection to FastAPI backend
    const sseUrl = `http://localhost:8000/api/forge/stream?query=${encodeURIComponent(queryText)}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === "session") {
          setSessionId(payload.session_id);
        } else if (payload.type === "agent_start") {
          const agentKey = payload.agent;
          setAgents((prev) => ({
            ...prev,
            [agentKey]: { ...prev[agentKey], status: "RUNNING" },
          }));
        } else if (payload.type === "agent_log") {
          setTerminalLogs((prev) => [...prev, payload.text]);
          setTokenCount((prev) => prev + Math.floor(payload.text.length / 4) + 12);
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
          if (timerRef.current) clearInterval(timerRef.current);

          const sid = payload.session_id;
          if (sid) {
            setSessionId(sid);
            fetchExistingSession(sid);
          }
          eventSource.close();
        } else if (payload.type === "error") {
          setTerminalLogs((prev) => [...prev, `[ERROR] ${payload.message}`]);
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
        setActiveViewTab("preview");
      }
    } catch (e) {
      console.error("Failed to launch preview", e);
    }
  };

  const handleStopPreview = async () => {
    if (!sessionId) return;
    try {
      await fetch(`http://localhost:8000/api/forge/${sessionId}/preview/stop`, {
        method: "POST",
      });
      setIsPreviewRunning(false);
      setPreviewUrl(null);
    } catch (e) {
      console.error("Failed to stop preview", e);
    }
  };

  const handleDownloadZip = () => {
    if (!sessionId) return;
    window.location.href = `http://localhost:8000/api/forge/${sessionId}/download`;
  };

  const completedCount = Object.values(agents).filter((a) => a.status === "DONE").length;
  const progressPct = Math.round((completedCount / 6) * 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Directives Header & Launcher Input */}
      <div className="bg-carbon brutal-border brutal-shadow">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <span className="text-primary-container">▶</span>
            <span>AUTONOMOUS AGENT DIRECTIVE</span>
          </div>
          <span className="text-steel">STRICT SWE PIPELINE // FASTAPI SSE</span>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isRunning}
            placeholder="Describe what your autonomous SWE engine should build... e.g. Build a SaaS dashboard with Next.js 14, Supabase auth, and Playwright tests."
            rows={2}
            className="w-full bg-void brutal-border text-chalk font-body-lg text-[13px] placeholder:text-steel/50 focus:outline-none focus:border-canary p-3 resize-none transition-all disabled:opacity-60"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-steel text-[10px] font-mono">
              <span>MODEL: GEMINI 3.6 FLASH</span>
              <span>|</span>
              <span>DAG NODES: 6</span>
            </div>
            <button
              onClick={() => startPipeline(prompt)}
              disabled={isRunning || !prompt.trim()}
              className="px-5 py-2.5 bg-primary-container text-black font-bold text-[13px] uppercase tracking-wider brutal-border-heavy brutal-shadow brutal-btn-press hover:bg-canary transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>{isRunning ? "BUILDING..." : "EXECUTE DIRECTIVE"}</span>
              <span className="material-symbols-outlined text-[18px]">
                {isRunning ? "sync" : "bolt"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Live Agent Execution & Files (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Active Agents Blocks */}
          <div className="flex flex-col gap-3">
            {agentOrder.map((key) => {
              const agent = agents[key];
              const labelMap: Record<string, string> = {
                planner: "01 Planner Agent — Requirements & Stack",
                architect: "02 Architect Agent — File Manifest Design",
                coder: "03 Coding Agent — Code Synthesis",
                debugger: "04 Debugger Agent — AST Self-Healing",
                terminal: "05 Terminal Agent — Build Check",
                browser: "06 Browser Agent — Playwright E2E",
              };

              return (
                <div
                  key={key}
                  className={`bg-carbon brutal-shadow transition-all ${
                    agent.status === "RUNNING"
                      ? "brutal-border-active"
                      : agent.status === "DONE"
                      ? "brutal-border"
                      : "border border-divider opacity-70"
                  }`}
                >
                  <div className="panel-header">
                    <div className="flex items-center gap-2">
                      {agent.status === "RUNNING" && (
                        <span className="w-2 h-2 rounded-full bg-canary animate-ping"></span>
                      )}
                      {agent.status === "DONE" && (
                        <span className="material-symbols-outlined text-[14px] text-mint">
                          check_circle
                        </span>
                      )}
                      {agent.status === "QUEUED" && (
                        <span className="w-2 h-2 rounded-full bg-steel"></span>
                      )}
                      <span className="text-chalk font-semibold">{labelMap[key]}</span>
                    </div>
                    <div>
                      {agent.status === "RUNNING" && <span className="badge-running">RUNNING</span>}
                      {agent.status === "DONE" && <span className="badge-success">DONE</span>}
                      {agent.status === "QUEUED" && <span className="badge-queued">QUEUED</span>}
                    </div>
                  </div>
                  {(agent.status === "RUNNING" || agent.status === "DONE") && (
                    <div className="p-3 text-[12px] font-mono text-steel">
                      <p className="text-on-surface-variant mb-2">{agent.thought}</p>
                      {agent.data && (
                        <pre className="bg-void p-2 brutal-border text-[11px] text-cyan overflow-x-auto max-h-32">
                          {JSON.stringify(agent.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Generated Code & App Workspace Section */}
          {files.length > 0 && (
            <div className="bg-carbon brutal-border brutal-shadow">
              {/* Workspace Navigation Header Tabs */}
              <div className="panel-header bg-surface flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveViewTab("code")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors flex items-center gap-1.5 ${
                      activeViewTab === "code"
                        ? "bg-surface-container-low text-primary-container brutal-border"
                        : "text-steel hover:text-chalk"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">code</span>
                    CODE EXPLORER ({files.length} FILES)
                  </button>
                  <button
                    onClick={() => setActiveViewTab("preview")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors flex items-center gap-1.5 ${
                      activeViewTab === "preview"
                        ? "bg-surface-container-low text-cyan brutal-border"
                        : "text-steel hover:text-chalk"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">open_in_browser</span>
                    LIVE PREVIEW
                  </button>
                  <button
                    onClick={() => setActiveViewTab("terminal")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors flex items-center gap-1.5 ${
                      activeViewTab === "terminal"
                        ? "bg-surface-container-low text-mint brutal-border"
                        : "text-steel hover:text-chalk"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">terminal</span>
                    TERMINAL LOGS
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadZip}
                    className="px-3 py-1 bg-mint text-black font-bold text-[10px] uppercase brutal-border-heavy brutal-btn-press hover:bg-primary-container transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[12px]">download</span>
                    DOWNLOAD ZIP
                  </button>
                </div>
              </div>

              {/* View Tab Body */}
              <div className="p-3">
                {activeViewTab === "code" && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[400px]">
                    {/* File Tree List */}
                    <div className="md:col-span-4 bg-void brutal-border p-2 max-h-[450px] overflow-y-auto">
                      <div className="text-[10px] text-steel font-bold uppercase mb-2 px-2">
                        PROJECT TREE
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {files.map((file, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedFileIndex(idx)}
                            className={`w-full text-left px-2.5 py-1.5 text-[11px] font-mono truncate transition-all flex items-center gap-2 ${
                              selectedFileIndex === idx
                                ? "bg-surface-container-high text-primary-container brutal-border-cyan font-bold"
                                : "text-steel hover:text-chalk hover:bg-raised"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">description</span>
                            {file.path}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* File Content Viewer */}
                    <div className="md:col-span-8 bg-void brutal-border p-3 flex flex-col justify-between max-h-[450px]">
                      <div className="flex items-center justify-between border-b border-divider pb-2 mb-2">
                        <span className="text-[11px] font-mono font-bold text-cyan">
                          {files[selectedFileIndex]?.path}
                        </span>
                        <span className="text-[10px] text-steel">
                          {files[selectedFileIndex]?.content.length || 0} BYTES
                        </span>
                      </div>
                      <pre className="font-mono text-[11px] text-chalk leading-relaxed overflow-auto flex-1 p-2 bg-carbon">
                        <code>{files[selectedFileIndex]?.content}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {activeViewTab === "preview" && (
                  <div className="flex flex-col gap-3 min-h-[400px]">
                    <div className="flex items-center justify-between bg-void brutal-border p-2">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-steel">
                        <span className="w-2 h-2 rounded-full bg-mint"></span>
                        <span>PREVIEW TARGET: {previewUrl || "NOT RUNNING"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isPreviewRunning ? (
                          <button
                            onClick={handleLaunchPreview}
                            className="px-3 py-1 bg-cyan text-black font-bold text-[10px] uppercase brutal-border-heavy hover:bg-canary transition-colors"
                          >
                            START APP PREVIEW
                          </button>
                        ) : (
                          <button
                            onClick={handleStopPreview}
                            className="px-3 py-1 bg-coral text-white font-bold text-[10px] uppercase brutal-border-heavy hover:bg-red-600 transition-colors"
                          >
                            STOP PREVIEW
                          </button>
                        )}
                      </div>
                    </div>

                    {previewUrl ? (
                      <iframe
                        src={previewUrl}
                        title="App Live Preview"
                        className="w-full h-[450px] bg-white brutal-border"
                      />
                    ) : (
                      <div className="h-[400px] bg-void brutal-border flex flex-col items-center justify-center gap-3 text-steel">
                        <span className="material-symbols-outlined text-[48px]">desktop_windows</span>
                        <p className="text-[12px]">Click "START APP PREVIEW" to run the generated web app in sandbox.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeViewTab === "terminal" && (
                  <div className="bg-void brutal-border p-3 min-h-[400px] max-h-[450px] overflow-y-auto font-mono text-[11px] text-chalk flex flex-col gap-1">
                    {terminalLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-cyan shrink-0">$</span>
                        <span>{log}</span>
                      </div>
                    ))}
                    <div ref={terminalEndRef} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Workflow Progress & Telemetry (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Stepper Card */}
          <div className="bg-carbon brutal-border brutal-shadow">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <span className="text-primary-container">⚡</span>
                <span>PIPELINE PROGRESS</span>
              </div>
              <span className="badge-running">{progressPct}%</span>
            </div>
            <div className="p-3 flex flex-col gap-2">
              <div className="w-full h-2 bg-raised brutal-border overflow-hidden">
                <div
                  className="h-full bg-primary-container transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="flex flex-col gap-1 mt-2">
                {agentOrder.map((key, idx) => {
                  const st = agents[key].status;
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between p-2 text-[11px] font-mono ${
                        st === "RUNNING"
                          ? "bg-surface-container-low text-primary-container font-bold"
                          : st === "DONE"
                          ? "text-mint"
                          : "text-steel"
                      }`}
                    >
                      <span>
                        0{idx + 1} {key.toUpperCase()}
                      </span>
                      <span>{st}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Telemetry Stats */}
          <div className="bg-carbon brutal-border brutal-shadow">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <span className="text-cyan">◈</span>
                <span>TELEMETRY & RUNTIME</span>
              </div>
            </div>
            <div className="p-3 flex flex-col gap-2 text-[11px] font-mono">
              <div className="flex justify-between py-1 border-b border-divider">
                <span className="text-steel">ELAPSED TIME</span>
                <span className="text-chalk">{(elapsedMs / 1000).toFixed(1)}s</span>
              </div>
              <div className="flex justify-between py-1 border-b border-divider">
                <span className="text-steel">COMPLETED AGENTS</span>
                <span className="text-chalk">{completedCount} / 6</span>
              </div>
              <div className="flex justify-between py-1 border-b border-divider">
                <span className="text-steel">TOKENS CONSUMED</span>
                <span className="text-primary-container font-bold">{tokenCount}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-steel">FILES GENERATED</span>
                <span className="text-cyan font-bold">{files.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div className="p-4 text-steel">Loading Workspace...</div>}>
      <WorkspaceContent />
    </Suspense>
  );
}
