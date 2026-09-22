"use client";

import { useState } from "react";
import { APPROVED_BROWSER_APPS, type BrowserApp, type BrowserPolicy } from "@/lib/ai/browser-policy";

export function BrowserAccessControls({ initial, canManage }: { initial: BrowserPolicy; canManage: boolean }) {
  const [policy, setPolicy] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save(patch: Partial<BrowserPolicy>) {
    if (!canManage) return;
    const next = { ...policy, ...patch };
    setPolicy(next); setSaving(true); setMessage(null);
    try {
      const response = await fetch("/api/agent/browser", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Could not save browser policy.");
      setPolicy(data.policy); setMessage("Saved");
    } catch (error) {
      setPolicy(policy); setMessage(error instanceof Error ? error.message : "Could not save browser policy.");
    } finally { setSaving(false); }
  }

  const labels: Record<BrowserApp, string> = { growthspace: "Growthspace", gmail: "Gmail", "outlook-mail": "Outlook Mail", "apple-mail": "Apple Mail", whatsapp: "WhatsApp", messages: "Messages", calls: "Calls" };
  function toggleApp(app: BrowserApp) { const next = policy.allowed_apps.includes(app) ? policy.allowed_apps.filter((value) => value !== app) : [...policy.allowed_apps, app]; void save({ allowed_apps: next }); }

  return <div className="rounded-2xl border border-slate-200 bg-white p-6">
    <h2 className="text-sm font-semibold text-slate-900">Controlled browser access</h2>
    <p className="mt-1 text-xs leading-5 text-slate-500">Browser access is enabled for approved business apps. Computer-level actions remain admin-controlled, confirmation-required, and never silently send messages or place calls.</p>
    <div className="mt-4 space-y-3">
      <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-3 text-sm">
        <span><span className="font-medium text-slate-800">Enable browser bridge</span><span className="mt-0.5 block text-xs text-slate-500">Admin-controlled and confirmation-required.</span></span>
        <input type="checkbox" checked={policy.enabled} disabled={!canManage || saving} onChange={(e) => void save({ enabled: e.target.checked })} className="h-4 w-4 accent-emerald-500" />
      </label>
      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs"><span className="text-slate-500">Allowed company</span><span className="font-semibold text-slate-800">https://{policy.allowed_domains[0]}/</span></div>
      <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs font-semibold text-slate-700">Admin-approved apps</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{APPROVED_BROWSER_APPS.map((app) => <label key={app} className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={policy.allowed_apps.includes(app)} disabled={!canManage || saving} onChange={() => toggleApp(app)} className="h-4 w-4 accent-emerald-500" />{labels[app]}</label>)}</div></div>
      <label className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm"><span><span className="font-medium text-amber-900">Allow computer-level actions</span><span className="mt-0.5 block text-xs text-amber-800">Admins only; every send, edit, delete, or call requires confirmation.</span></span><input type="checkbox" checked={policy.computer_access_enabled} disabled={!canManage || saving} onChange={(e) => void save({ computer_access_enabled: e.target.checked })} className="h-4 w-4 accent-amber-500" /></label>
      {!canManage && <p className="text-xs text-amber-700">Only workspace owners and admins can change this.</p>}
      {message && <p className={`text-xs ${message === "Saved" ? "text-emerald-700" : "text-rose-700"}`}>{message}</p>}
    </div>
  </div>;
}
