import { NextRequest, NextResponse } from "next/server";
import { getCurrentContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { agentProviders, runGrowthAgent } from "@/lib/ai/agent";

export const maxDuration = 60;

export async function GET() {
  const providers = await agentProviders();
  return NextResponse.json({
    providers,
    auto: {
      id: "auto",
      name: "Auto",
      description: "Selects the best configured model for the request and fails over when a provider is temporarily unavailable.",
    },
  });
}

export async function POST(req: NextRequest) {
  const ctx = await getCurrentContext();
  if (!ctx.userId || ctx.isDemo) return NextResponse.json({ error: "Sign in to use Growth AI." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const goal = typeof body?.goal === "string" ? body.goal.trim() : "";
  if (!goal) return NextResponse.json({ error: "goal required" }, { status: 400 });
  const provider = typeof body?.provider === "string" ? body.provider : "auto";
  const model = typeof body?.model === "string" ? body.model : "auto";

  const history = Array.isArray(body?.history)
    ? body.history
        .filter((m: unknown): m is { role: "user" | "assistant"; content: string } => Boolean(
          m && typeof m === "object" &&
          (((m as { role?: unknown }).role === "user") || ((m as { role?: unknown }).role === "assistant")) &&
          typeof (m as { content?: unknown }).content === "string",
        ))
        .slice(-32)
    : [];

  const db = await createClient();
  const { data: org, error: orgError } = await db.from("organizations").select("id, slug, name").eq("slug", ctx.orgSlug).maybeSingle();
  if (orgError || !org) return NextResponse.json({ error: "Workspace could not be loaded." }, { status: 500 });

  try {
    const result = await runGrowthAgent(goal, {
      db,
      orgId: org.id,
      orgSlug: org.slug,
      orgName: org.name || ctx.orgName || "Growth Inspector",
    }, {
      provider: provider as "auto" | "openai" | "anthropic" | "zai" | "gemini" | "openrouter" | "opencode",
      model,
      history,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Growth AI failed:", error);
    return NextResponse.json({ error: "Configured AI model services are temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}
