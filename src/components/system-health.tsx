"use client";

import { useCallback, useEffect, useState } from "react";

type HealthValue = boolean | string | { model?: string; router?: string };
type HealthResponse = {
  ok: boolean;
  checkedAt?: string;
  integrations?: Record<string, HealthValue>;
};

const labels: Record<string, string> = {
  supabase: "Supabase",
  supabase_service_role: "Supabase server access",
  anthropic: "Anthropic",
  zai: "Z.ai",
  gemini: "Gemini",
  openrouter: "OpenRouter",
  email_transport: "Email",
  inbound_email_webhook: "Inbound email",
  meta_verify_token: "Meta webhook",
  meta_access_token: "Meta sending",
  twilio_auth_token: "Twilio auth",
  twilio_account_sid: "Twilio account",
  whisper_transcription: "Whisper transcription",
  voice_chat: "Voice chat",
  elevenlabs_voice: "ElevenLabs voice",
  x_posting: "X publishing",
};

export function SystemHealth() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      const result = (await response.json()) as HealthResponse;
      setData(result);
      setCheckedAt(result.checkedAt ?? new Date().toISOString());
      if (!response.ok && response.status !== 503) setError(true);
    } catch {
      setError(true);
      setCheckedAt(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const integrations = data?.integrations ?? {};
  const ready = Boolean(data?.ok);
  const entries = Object.entries(integrations).filter(([key]) => labels[key]);

  return (
    <section aria-labelledby="system-health-heading" className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="system-health-heading" className="text-sm font-semibold">System health</h2>
          <p className="mt-1 text-xs text-slate-500" aria-live="polite">
            {loading && !data ? "Checking services…" : error ? "Could not check service status." : ready ? "Core services are configured." : "Core services need attention."}
            {checkedAt ? ` Last checked ${new Date(checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.` : ""}
          </p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          {loading ? "Checking…" : "Refresh"}
        </button>
      </div>
      {error ? (
        <p role="status" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">Health check is temporarily unavailable. Try again shortly.</p>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {entries.map(([key, value]) => {
            const active = value !== false && value !== "fallback";
            const detail = typeof value === "object" ? value.model ?? value.router : typeof value === "string" && value !== "configured" && value !== "fallback" ? value : null;
            return (
              <li key={key} className="flex min-w-0 items-start gap-2 rounded-xl bg-slate-50 px-3 py-2">
                <span aria-hidden className={`mt-1 h-2 w-2 shrink-0 rounded-full ${active ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-slate-800">{labels[key]}</span>
                  <span className="block truncate text-[11px] text-slate-500">{active ? detail ?? (value === "fallback" ? "Demo mode" : "Configured") : "Not configured"}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
