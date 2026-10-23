"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Workspace = {
  id: string;
  name: string;
  slug: string;
  role: "owner" | "admin" | "agent";
  onboarded: boolean;
};

export function WorkspaceManager({
  workspaces,
  activeWorkspaceId,
}: {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const atLimit = workspaces.length >= 20;

  async function createWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setCreating(true);
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Could not create the workspace.");
      setName("");
      setNotice(`Created “${data.workspace?.name || "workspace"}”. Switching to it now.`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the workspace.");
    } finally {
      setCreating(false);
    }
  }

  async function switchWorkspace(workspace: Workspace) {
    if (workspace.id === activeWorkspaceId || switchingId) return;
    setError(null);
    setNotice(null);
    setSwitchingId(workspace.id);
    try {
      const response = await fetch("/api/workspaces/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: workspace.id }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Could not switch workspaces.");
      setNotice(`Switching to “${workspace.name}”…`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not switch workspaces.");
    } finally {
      setSwitchingId(null);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Workspaces</h2>
          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
            Create and switch between separate workplaces. Owners and admins can manage up to 20 workspaces for their account.
          </p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums ${atLimit ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
          {workspaces.length} / 20
        </span>
      </div>

      <form onSubmit={createWorkspace} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="new-workspace-name">New workspace name</label>
        <input
          id="new-workspace-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
          required
          placeholder="e.g. GrowthSpace Retail"
          disabled={creating || atLimit}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50"
        />
        <button
          type="submit"
          disabled={creating || atLimit || !name.trim()}
          className="rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? "Creating…" : atLimit ? "Limit reached" : "Create workspace"}
        </button>
      </form>

      {atLimit && <p className="mt-2 text-xs text-amber-700">You’ve reached the 20-workspace limit. Switch to any existing workspace below.</p>}
      {error && <p role="alert" className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {notice && <p role="status" className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}

      <div className="mt-5 divide-y divide-slate-100">
        {workspaces.map((workspace) => {
          const active = workspace.id === activeWorkspaceId;
          return (
            <div key={workspace.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{workspace.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  <span className="capitalize">{workspace.role}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{workspace.slug}</span>
                  {!workspace.onboarded && <span className="text-amber-700"> · Setup incomplete</span>}
                </p>
              </div>
              {active ? (
                <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">Current</span>
              ) : (
                <button
                  type="button"
                  onClick={() => void switchWorkspace(workspace)}
                  disabled={!!switchingId}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:opacity-50"
                >
                  {switchingId === workspace.id ? "Switching…" : "Switch"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
