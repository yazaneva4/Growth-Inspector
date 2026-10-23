import { NextResponse } from "next/server";
import { X_CONFIGURED } from "@/lib/platforms/x";
import { emailTransport } from "@/lib/email/send";
import { geminiConfigured } from "@/lib/ai/gemini";
import { openrouterConfigured, OPENROUTER_MODEL_A } from "@/lib/ai/openrouter";
import { zaiConfigured, ZAI_MODEL } from "@/lib/ai/zai";
import { createServiceClient, serviceKeyConfigured } from "@/lib/supabase/server";
import { REALTIME_TABLES } from "@/lib/realtime/tables";

/** Integration health check. Reports configuration state without exposing secrets. */
export async function GET() {
  const has = (v?: string) => Boolean(v && v.length > 0);
  const realtime = await realtimeHealth();
  return NextResponse.json({
    ok: true,
    realtime,
    integrations: {
      supabase: has(process.env.NEXT_PUBLIC_SUPABASE_URL) ? "configured" : "fallback",
      supabase_service_role: serviceKeyConfigured(),
      anthropic: has(process.env.ANTHROPIC_API_KEY),
      zai: zaiConfigured() ? ZAI_MODEL : false,
      gemini: geminiConfigured(),
      openrouter: openrouterConfigured() ? { model: OPENROUTER_MODEL_A, router: "OpenRouter Free Models Router" } : false,
      email_transport: emailTransport(),
      inbound_email_webhook: has(process.env.INBOX_WEBHOOK_SECRET),
      meta_verify_token: has(process.env.META_VERIFY_TOKEN),
      meta_access_token: has(process.env.META_ACCESS_TOKEN),
      twilio_auth_token: has(process.env.TWILIO_AUTH_TOKEN),
      twilio_account_sid: has(process.env.TWILIO_ACCOUNT_SID),
      whisper_transcription: has(process.env.OPENAI_API_KEY) && has(process.env.TWILIO_ACCOUNT_SID) && has(process.env.TWILIO_AUTH_TOKEN),
      voice_chat: has(process.env.OPENAI_API_KEY),
      elevenlabs_voice: has(process.env.ELEVENLABS_API_KEY),
      x_posting: X_CONFIGURED,
    },
    note: "Booleans and non-secret integration identifiers only — no secret values are exposed.",
  });
}

/**
 * The dashboard listens to the public schema wildcard. The inventory count is
 * the set of application tables represented by repository migrations; it is
 * not the number of tables currently in the live publication.
 */
async function realtimeHealth() {
  const base = {
    subscription_scope: "public-schema-wildcard" as const,
    local_schema_table_count: REALTIME_TABLES.length,
  };
  if (!serviceKeyConfigured()) return {
    ...base,
    publication: "unchecked" as const,
    reason: "server-verification-key-not-configured" as const,
  };
  try {
    const { data, error } = await createServiceClient().rpc("realtime_publication_gaps");
    if (error) return { ...base, publication: "unchecked" as const, error: "publication-gap-check-unavailable" };
    const gaps = ((data ?? []) as { table_name: string }[]).map((r) => r.table_name);
    return { ...base, publication: gaps.length === 0 ? ("complete" as const) : ("gaps" as const), gaps };
  } catch {
    return { ...base, publication: "unchecked" as const, error: "publication-gap-check-unavailable" };
  }
}
