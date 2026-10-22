"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MoveInvoiceToTrashButton({ id, number }: { id: string; number: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function moveToTrash() {
    if (!window.confirm(`Move invoice ${number} to Trash? You can restore it later.`)) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/invoices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Could not move the invoice to Trash");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not move the invoice to Trash");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void moveToTrash()}
        disabled={busy}
        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
      >
        {busy ? "Moving…" : "Move to Trash"}
      </button>
      {error && <span className="max-w-48 text-right text-[10px] text-rose-600">{error}</span>}
    </div>
  );
}
