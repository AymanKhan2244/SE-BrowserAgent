"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "HOME", href: "/", icon: "home" },
    { label: "NEW TASK", href: "/new-task", icon: "add_box" },
    { label: "WORKSPACE", href: "/workspace", icon: "terminal" },
    { label: "CODE", href: "/code", icon: "code" },
    { label: "TASKS", href: "/tasks", icon: "check_circle" },
    { label: "AGENTS", href: "/agent-workspace", icon: "smart_toy" },
  ];

  const pinnedProjects = [
    { name: "SE Browser Agent", status: "LIVE", color: "bg-primary-fixed" },
    { name: "AI Researcher", status: "IDLE", color: "bg-outline" },
    { name: "Vision RAG", status: "RUN", color: "bg-primary-fixed" },
    { name: "AutoML Engineer", status: "IDLE", color: "bg-outline" },
    { name: "Medical Assistant", status: "STBY", color: "bg-outline" },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 flex flex-col justify-between p-3 z-40 bg-[#f3e600] text-black border-r-4 border-black shadow-[6px_0px_0px_#000000]">
      <div className="flex flex-col gap-3">
        {/* Brand Anchor Header */}
        <Link href="/" className="p-2 border-4 border-black bg-white flex items-center gap-2.5 hover:bg-secondary-container transition-colors brutal-link">
          <div className="w-7 h-7 bg-black flex items-center justify-center border-2 border-black text-primary-fixed shrink-0 font-bold">
            <span className="material-symbols-outlined text-base">smart_toy</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-headline-md text-xs font-black tracking-tight text-black">SE BROWSER AGENT</span>
            <span className="font-label-sm text-[9px] text-black tracking-wider mt-0.5">AUTONOMOUS SWE ENGINE</span>
          </div>
        </Link>

        {/* Quick Action CTA */}
        <button
          onClick={() => router.push("/new-task")}
          className="w-full py-2 px-3 bg-black text-primary-fixed font-headline-md font-black text-xs uppercase flex items-center justify-center gap-1.5 border-4 border-black shadow-[4px_4px_0px_#ffffff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm font-bold">add_box</span>
          <span>NEW TASK</span>
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 mt-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-xs transition-all ${
                  isActive
                    ? "bg-secondary-container text-black font-black border-4 border-black shadow-[4px_4px_0px_#000000] translate-x-1"
                    : "text-black hover:text-black hover:bg-white border-2 border-black bg-primary-fixed"
                }`}
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="font-label-md text-label-md uppercase">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Pinned Projects Section */}
        <div className="mt-1 pt-2 border-t border-surface-container-high">
          <div className="px-2 flex items-center justify-between mb-1">
            <span className="font-label-sm text-[9px] uppercase tracking-widest text-black font-black">PINNED PROJECTS</span>
            <span className="text-[9px] font-code-stream text-black">5/10</span>
          </div>
          <ul className="flex flex-col gap-1 font-code-stream text-xs text-black">
            {pinnedProjects.map((proj, idx) => (
              <li key={idx}>
                <Link
                  href="/workspace"
                  className="px-2 py-1 flex items-center justify-between bg-white border-2 border-black hover:bg-secondary-container transition-colors"
                >
                  <span className="truncate flex items-center gap-1.5 text-[11px]">
                    <span className={`w-1.5 h-1.5 ${proj.color} inline-block`}></span>
                    {proj.name}
                  </span>
                  <span className={`text-[9px] ${proj.status === "LIVE" || proj.status === "RUN" ? "text-secondary-container" : "text-outline"}`}>
                    {proj.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Cluster */}
      <div className="border-t-4 border-black pt-2 flex flex-col gap-1">
        <div className="p-2 bg-white border-2 border-black text-[10px] font-code-stream flex flex-col gap-1 mb-1">
          <div className="flex justify-between text-black">
            <span>HOST: v2.4-agent</span>
            <span className="text-black font-black">UP</span>
          </div>
          <div className="w-full bg-black h-2">
            <div className="bg-secondary-container h-2 w-3/4"></div>
          </div>
        </div>
        <div className="flex items-center justify-between px-2 py-1 text-black font-label-sm text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">account_circle</span>
            Operator Profile
          </span>
          <span className="text-black font-black">SYS_ADMIN</span>
        </div>
      </div>
    </aside>
  );
}
