"use client";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-60 right-0 h-7 bg-surface-container-lowest border-t-2 border-outline-variant z-30 px-4 flex items-center justify-between text-[11px] font-code-stream">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-secondary-container">
          <span className="w-1.5 h-1.5 bg-secondary-container"></span>
          <span>AGENT ENGINE: IDLE_SYNC</span>
        </div>
        <span className="text-outline-variant">|</span>
        <div className="text-on-surface-variant">
          <span>MEM_ALLOC: 4.1GB / 16GB</span>
        </div>
        <span className="text-outline-variant">|</span>
        <div className="text-on-surface-variant">
          <span>GATEWAY: wss://agent.internal:8080</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-on-surface-variant">
          TASKS ACTIVE: <strong className="text-primary-fixed">3</strong>
        </span>
        <span className="text-outline-variant">|</span>
        <span className="text-on-surface-variant">
          QUEUE: <strong className="text-on-surface">0 PENDING</strong>
        </span>
        <span className="text-outline-variant">|</span>
        <span className="text-secondary-container font-bold">SYSTEM NORMAL</span>
      </div>
    </footer>
  );
}
