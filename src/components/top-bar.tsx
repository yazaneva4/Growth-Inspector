"use client";

import { NotificationBell } from "@/components/notification-bell";

export function TopBar({
  workspaceName,
  onMenuClick,
}: {
  workspaceName: string;
  onMenuClick?: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          GrowthSpace CRM
        </p>
        <p
          className="max-w-[220px] truncate text-sm font-semibold text-slate-900 sm:max-w-sm"
          title="GrowthSpace"
        >
          GrowthSpace
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <NotificationBell />
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
          >
            ☰
          </button>
        )}
      </div>
    </header>
  );
}
