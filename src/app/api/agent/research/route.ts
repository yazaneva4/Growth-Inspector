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
        .map((m: HistoryMessage) => ({ role: m.role, content: m.content.slice(0, 4000) }))
    : [];

  try {
    const response = await fetch("https://api.perplexity.ai/v1/agent", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "sonar",
        max_output_tokens: 1400,
        input: [...history.map((m: HistoryMessage) => (m.role === "user" ? "User: " : "Assistant: ") + m.content), "User: " + goal].join("\n\n"),
        tools: [{ type: "web_search", search_type: "fast" }],
        instructions: "You are Growth AI's live web research assistant. Search the web for current information, distinguish facts from uncertainty, include relevant dates, and keep the answer useful and concise. The interface will display source links returned by the search API.",
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
    const output = Array.isArray(data?.output) ? data.output : [];
    const message = output.find((item: { type?: string; role?: string }) => item.type === "message" && item.role === "assistant");
    const answer = Array.isArray(message?.content)
      ? message.content.filter((item: { type?: string }) => item.type === "output_text").map((item: { text?: string }) => item.text || "").join("\n").trim()
      : "";
    const citations = output
      .filter((item: { type?: string }) => item.type === "search_results")
      .flatMap((item: { results?: Array<{ url?: unknown; title?: unknown }> }) => Array.isArray(item.results) ? item.results : [])
      .map((result: { url?: unknown; title?: unknown }) => typeof result.url === "string" && (result.url.startsWith("https://") || result.url.startsWith("http://")) ? { url: result.url, title: typeof result.title === "string" ? result.title : new URL(result.url).hostname } : null)
      .filter((source: { url: string; title: string } | null): source is { url: string; title: string } => source !== null)
      .slice(0, 8);
    return NextResponse.json({ answer, citations, provider: "perplexity", model: "sonar" });
  } catch (error) {
    console.error("Perplexity live research failed:", error);
    return NextResponse.json({ error: "Live web research timed out or could not connect. Please try again." }, { status: 503 });
  }
}
