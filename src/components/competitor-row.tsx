"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CompetitorRow({
  id,
  handle,
  platform,
  notes,
  badgeClass,
}: {
  id: string;
  handle: string;
  platform: string;
  notes: string | null;
  badgeClass: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function moveToTrash() {
    if (!window.confirm(`Move ${handle} to Trash? You can restore it later.`)) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/competitors?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Could not move competitor to Trash");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not move competitor to Trash");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${badgeClass}`}>{platform}</span>
            <span className="font-medium" dir="auto">{handle}</span>
          </div>
          {notes && <p className="mt-2 text-sm text-slate-500" dir="auto">{notes}</p>}
          {error && <p role="alert" className="mt-2 text-xs text-rose-600">{error}</p>}
        </div>
        <button type="button" disabled={busy} onClick={() => void moveToTrash()} className="shrink-0 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50">
          {busy ? "Moving…" : "Move to Trash"}
        </button>
      </div>
    </article>
  );
}
