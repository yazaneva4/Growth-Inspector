"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { Logo, LogoMark } from "@/components/logo";
import { TopBar } from "@/components/top-bar";
import { SparkleIcon } from "@/components/sparkle-icon";

const navGroups = [
  {
    label: "MAIN",
    items: [
      { href: "/dashboard", label: "Overview", icon: "◻" },
      { href: "/dashboard/inbox", label: "Customer inbox", icon: "💬" },
    ],
  },
  {
    label: "ENGAGE",
    items: [
      { href: "/dashboard/agent", label: "Growth AI", icon: "sparkle" },
      { href: "/dashboard/chat", label: "Team chat", icon: "🗨" },
      { href: "/dashboard/escalations", label: "Escalations", icon: "⚠" },
    ],
  },
  {
    label: "GROWTH",
    items: [
      { href: "/dashboard/analytics", label: "Analytics", icon: "📈" },
      { href: "/dashboard/trends", label: "Trend radar", icon: "📡" },
      { href: "/dashboard/competitors", label: "Competitor watch", icon: "🎯" },
    ],
  },
  {
    label: "CRM",
    items: [
      { href: "/dashboard/clients", label: "Clients", icon: "🏢" },
      { href: "/dashboard/invoices", label: "Invoices", icon: "🧾" },
    ],
  },
  {
    label: "WORKSPACE",
    items: [
      { href: "/dashboard/team", label: "Team", icon: "👥" },
      { href: "/dashboard/settings", label: "Settings", icon: "⚙" },
    ],
  },
];

function AccountFooter({ email }: { email: string | null }) {
  if (email) return <div className="space-y-2"><div className="flex min-w-0 items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">{email.charAt(0).toUpperCase()}</span><span className="truncate text-slate-600" title={email}>{email}</span></div><form action="/auth/signout" method="post"><button className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-50">Sign out</button></form><Link href="/login?new=1" className="block rounded-xl px-3 py-2 text-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">+ Create another account</Link></div>;
  return <div className="space-y-2"><div className="rounded-xl bg-slate-50 px-3 py-2 text-slate-500">Viewing GrowthSpace demo</div><Link href="/login" className="block rounded-xl bg-orange-600 px-3 py-2 text-center font-semibold text-white transition-colors hover:bg-orange-700">Sign in / Create account</Link></div>;
}

export function DashboardChrome({ workspaceName, email, children }: { workspaceName: string; email: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("growthspace-sidebar-collapsed");
    const legacy = localStorage.getItem("gi-sidebar-collapsed");
    setCollapsed((saved ?? legacy) === "1");

    if (saved === null && legacy !== null) {
      localStorage.setItem("growthspace-sidebar-collapsed", legacy);
    }
    localStorage.removeItem("gi-sidebar-collapsed");
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem("growthspace-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  }

  return <div className="flex min-h-screen bg-white text-slate-900 lg:h-screen lg:overflow-hidden">
    {mobileOpen && <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" className="fixed inset-0 z-40 cursor-default bg-slate-950/35 backdrop-blur-[2px] lg:hidden" />}
    <aside className={"fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-slate-200/80 bg-white font-sans shadow-2xl transition-transform duration-200 ease-out lg:static lg:h-full lg:shadow-none lg:transition-[width] " + (mobileOpen ? "translate-x-0" : "-translate-x-full") + " lg:translate-x-0 " + (collapsed ? "lg:w-[76px]" : "lg:w-[272px]")}>
      <div className="flex min-h-[72px] items-center gap-2 border-b border-slate-100 px-3.5">
        <div className={collapsed ? "min-w-0 lg:hidden" : "min-w-0"}><Link href="/dashboard" aria-label="GrowthSpace home" className="inline-flex items-center rounded-xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-orange-300"><Logo variant="light" size={40} /></Link></div>
        {collapsed && <LogoMark size={34} className="hidden lg:mx-auto lg:block" />}
        <div className={"ml-auto flex shrink-0 items-center gap-1 " + (collapsed ? "lg:hidden" : "")}><RealtimeRefresh /></div>
        <button type="button" onClick={toggleCollapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:flex">{collapsed ? "›" : "‹"}</button>
        <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden">✕</button>
      </div>
      <nav aria-label="Main navigation" className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => <div key={group.label}>
          <div className={"mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 " + (collapsed ? "lg:hidden" : "")}>{group.label}</div>
          <div className="space-y-0.5">{group.items.map((item) => {
            const active = pathname === item.href;
            return <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined} aria-label={collapsed ? item.label : undefined} onClick={() => setMobileOpen(false)} aria-current={active ? "page" : undefined} className={"flex min-h-9 items-center gap-3 rounded-xl px-3 py-1.5 text-[13px] font-medium transition-colors " + (collapsed ? "lg:justify-center lg:px-0" : "") + " " + (active ? "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950")}>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center text-xs opacity-80">{item.icon === "sparkle" ? <SparkleIcon className="text-xs" /> : item.icon}</span>
              <span className={"min-w-0 truncate " + (collapsed ? "lg:hidden" : "")}>{item.label}</span>
            </Link>;
          })}</div>
        </div>)}
      </nav>
      <div className={"border-t border-slate-100 p-3 text-xs " + (collapsed ? "lg:hidden" : "")}><AccountFooter email={email} /></div>
    </aside>
    <main className="flex min-w-0 flex-1 flex-col lg:h-full lg:overflow-hidden"><TopBar workspaceName={workspaceName} onMenuClick={() => setMobileOpen(true)} /><div className="flex-1 p-4 sm:p-6 lg:overflow-y-auto lg:p-8">{children}</div></main>
  </div>;
}
