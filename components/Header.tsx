"use client";

interface HeaderProps {
  status?: string;
  tokenCount?: string | number;
}

export default function Header({
  status = "RUNNING",
  tokenCount = "12.4k",
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-60 right-0 h-14 z-30 bg-surface-container-low border-b-2 border-outline-variant shadow-[0px_3px_0px_#000000] flex items-center justify-between px-4">
      {/* Left: Search / Command */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-sm">
            search
          </span>
          <input
            className="w-full bg-surface-container-lowest border-2 border-outline-variant pl-8 pr-3 py-1 text-on-surface font-code-stream text-xs focus:border-primary-fixed focus:outline-none focus:ring-0 shadow-[2px_2px_0px_#000000]"
            placeholder="FILTER ORCHESTRATION GRAPH..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-xs">
          <span className="text-secondary-container border-b-2 border-secondary-container pb-0.5 whitespace-nowrap">
            main: v2.4.0-rc1
          </span>
          <span className="text-on-surface-variant">|</span>
          <span className="text-primary-fixed whitespace-nowrap">DOM: READY</span>
        </div>
      </div>

      {/* Right: Telemetry & Actions */}
      <div className="flex items-center gap-3">
        {/* Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-fixed text-on-primary-fixed font-code-stream font-bold text-xs border border-surface-container-lowest shadow-[2px_2px_0px_#000000]">
          <span className="w-2 h-2 rounded-none bg-surface-container-lowest animate-ping"></span>
          <span>{status}</span>
        </div>

        {/* Token Gauge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container border border-outline-variant font-code-stream text-xs text-on-surface">
          <span className="text-secondary-container">⚡</span>
          <span className="font-bold text-primary-fixed">{tokenCount} TOKENS</span>
        </div>

        {/* Actions */}
        <button className="w-8 h-8 flex items-center justify-center bg-surface-container-high border border-outline-variant text-on-surface hover:border-primary-fixed transition-colors active:translate-x-0.5 active:translate-y-0.5">
          <span className="material-symbols-outlined text-base">notifications</span>
        </button>
        <button className="w-8 h-8 flex items-center justify-center bg-surface-container-high border border-outline-variant text-on-surface hover:border-primary-fixed transition-colors active:translate-x-0.5 active:translate-y-0.5">
          <span className="material-symbols-outlined text-base">terminal</span>
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 bg-surface-bright border-2 border-outline-variant flex items-center justify-center text-xs font-bold text-primary-fixed shadow-[1px_1px_0px_#000000]">
          OP
        </div>
      </div>
    </header>
  );
}
