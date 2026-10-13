import { NextRequest, NextResponse } from "next/server";
import { getCurrentContext } from "@/lib/auth";

export const maxDuration = 45;

type HistoryMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const ctx = await getCurrentContext();
  if (!ctx.userId || ctx.isDemo) {
    return NextResponse.json({ error: "Sign in to use live web research." }, { status: 401 });
  }

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Live web research is not configured yet. Add PERPLEXITY_API_KEY to the deployment environment." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const goal = typeof body?.goal === "string" ? body.goal.trim().slice(0, 4000) : "";
  if (!goal) return NextResponse.json({ error: "A research question is required." }, { status: 400 });

  const history: HistoryMessage[] = Array.isArray(body?.history)
    ? body.history
        .filter((m: unknown): m is HistoryMessage => Boolean(
          m && typeof m === "object" &&
          (((m as { role?: unknown }).role === "user") || ((m as { role?: unknown }).role === "assistant")) &&
          typeof (m as { content?: unknown }).content === "string",
        ))
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
    : [];

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "sonar",
        temperature: 0.2,
        max_tokens: 1400,
        messages: [
          { role: "system", content: "You are Growth AI's live web research assistant. Answer using current web information, distinguish facts from uncertainty, include relevant dates, and keep the answer useful and concise. The interface will display source links returned by the search API." },
          ...history,
          { role: "user", content: goal },
        ],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(40_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("Perplexity request failed:", response.status, detail.slice(0, 500));
      return NextResponse.json({ error: response.status === 401 || response.status === 403 ? "Perplexity rejected the API key. Check PERPLEXITY_API_KEY in the deployment settings." : "Live web research is temporarily unavailable. Please try again shortly." }, { status: 503 });
    }

    const data = await response.json();
    const answer = typeof data?.choices?.[0]?.message?.content === "string" ? data.choices[0].message.content : "No answer returned.";
    const citations = Array.isArray(data?.citations)
      ? data.citations
          .filter((url: unknown): url is string => typeof url === "string" && (url.startsWith("https://") || url.startsWith("http://")))
          .slice(0, 8)
          .map((url: string) => ({ url }))
      : [];
    return NextResponse.json({ answer, citations, provider: "perplexity", model: "sonar" });
  } catch (error) {
    console.error("Perplexity live research failed:", error);
    return NextResponse.json({ error: "Live web research timed out or could not connect. Please try again." }, { status: 503 });
  }
}
