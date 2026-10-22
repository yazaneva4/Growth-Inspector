"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type TrashItem = {
  id: string;
  source_table: string;
  source_record_id: string;
  record_label: string;
  deleted_at: string;
};

const typeLabels: Record<string, string> = {
  clients: "Client",
  competitors: "Competitor",
  invoices: "Invoice",
  ai_operator_conversations: "Growth AI conversation",
};

export function TrashManager({ items }: { items: TrashItem[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function restore(item: TrashItem) {
    setBusyId(item.id);
    setError(null);
    try {
      const response = await fetch("/api/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", id: item.id }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? "Could not restore this item. It may conflict with an existing record.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not restore this item.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteForever(item: TrashItem) {
    const approved = window.confirm(
      `Permanently delete “${item.record_label}”? This cannot be undone.`,
    );
    if (!approved) return;

    setBusyId(item.id);
    setError(null);
    try {
      const response = await fetch(`/api/trash?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Could not delete this item forever.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this item forever.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <strong>Nothing expires automatically.</strong> Items stay here until you restore them or choose Delete forever.
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl" aria-hidden="true">♲</div>
          <h2 className="mt-4 font-semibold text-slate-900">Trash is empty</h2>
          <p className="mt-1 text-sm text-slate-500">When you move a client, invoice, competitor, or Growth AI conversation to Trash, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const busy = busyId === item.id;
            return (
              <article key={item.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg" aria-hidden="true">
                  {item.source_table === "clients" ? "♙" : item.source_table === "invoices" ? "▤" : item.source_table === "competitors" ? "◎" : "✦"}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold text-slate-900">{item.record_label}</h2>
                  <p className="mt-0.5 text-xs text-slate-500">{typeLabels[item.source_table] ?? "Record"} · Deleted {new Date(item.deleted_at).toLocaleString()}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button type="button" disabled={busy} onClick={() => void restore(item)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                    {busy ? "Working…" : "Restore"}
                  </button>
                  <button type="button" disabled={busy} onClick={() => void deleteForever(item)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                    Delete forever
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
