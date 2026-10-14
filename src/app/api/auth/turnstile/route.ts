import { NextResponse } from "next/server";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const EXPECTED_ACTION = "growth_inspector_auth";

type TurnstileResult = { success?: boolean; action?: string; hostname?: string };

export async function POST(request: Request) {
  const secret = (process.env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET)?.trim();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Bot verification is not configured on the server." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid verification request." }, { status: 400 });
  }

  const token =
    typeof body === "object" && body !== null && "cf-turnstile-response" in body
      ? (body as Record<string, unknown>)["cf-turnstile-response"]
      : null;

  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return NextResponse.json(
      { ok: false, error: "Please complete the bot verification and try again." },
      { status: 400 },
    );
  }

  const remoteip =
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim();

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);
  if (remoteip) formData.append("remoteip", remoteip);

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    const result = (await response.json()) as TurnstileResult;
    const expectedHostname = new URL(request.url).hostname.toLowerCase();
    const valid =
      response.ok &&
      result.success === true &&
      result.action === EXPECTED_ACTION &&
      result.hostname?.toLowerCase() === expectedHostname;

    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Bot verification failed. Please try again." },
        { status: 403 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Bot verification is temporarily unavailable. Please try again." },
      { status: 502 },
    );
  }
}
