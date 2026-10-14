import { NextRequest, NextResponse } from "next/server";
import { getCurrentContext } from "@/lib/auth";

export const maxDuration = 45;

type HistoryMessage = { role: "user" | "assistant"; content: string };

const SOCIAL_SEARCH_DOMAINS = [
  "x.com",
  "twitter.com",
  "instagram.com",
  "facebook.com",
  "linkedin.com",
  "whatsapp.com",
  "blog.whatsapp.com",
  "about.fb.com",
];

const SOCIAL_INTENT_PATTERN = /\b(?:social(?:\s+media)?|twitter|instagram|facebook|linkedin|whatsapp|trends?|trending|viral|buzz|sentiment|public chatter|social listening|mentions?|reactions?|engagement|what (?:are|is) people saying|comments?)\b/i;
const SOCIAL_INTENT_ARABIC_PATTERN = /(?:سوشال(?:\s+ميديا)?|تواصل اجتماعي|ترند|ترندات|تويتر|اكس|إكس|انستغرام|إنستغرام|انستجرام|فيسبوك|فيس بوك|لينكدإن|لينكد ان|واتساب|واتس اب|الناس يقولون|ماذا يقول|تفاعل|انتشار|ضجة|آراء الناس)/i;

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

  const researchContext = [...history.map((m) => m.content), goal].join(" ");
  const socialSearch = SOCIAL_INTENT_PATTERN.test(researchContext) || SOCIAL_INTENT_ARABIC_PATTERN.test(researchContext);
  const webSearchTool = {
    type: "web_search",
    search_type: "fast",
    ...(socialSearch
      ? {
          filters: {
            search_domain_filter: SOCIAL_SEARCH_DOMAINS,
            search_recency_filter: "day",
          },
        }
      : {}),
  };

  try {
    const response = await fetch("https://api.perplexity.ai/v1/agent", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "sonar",
        max_output_tokens: 1400,
        input: [...history.map((m: HistoryMessage) => (m.role === "user" ? "User: " : "Assistant: ") + m.content), "User: " + goal].join("\n\n"),
        tools: [webSearchTool],
        instructions: "You are Growth AI's live web research assistant. Search for current information, distinguish facts from uncertainty, include relevant dates, and keep the answer useful and concise. When researching social chatter, trends, or what people are saying, prioritize the configured public social sources and cite results inline with bracketed search result IDs such as [1]. These results cover only public pages indexed by web search, not private WhatsApp chats, DMs, closed groups, or complete platform feeds. If public results are unavailable or incomplete, say so clearly rather than implying full coverage. The interface also displays clickable source links.",
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
