import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";


const genericResponse = () => NextResponse.json({ ok: true, message: "If an account exists for that address, a sign-in link is on its way." }, { headers: { "Cache-Control": "no-store" } });


export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const turnstileToken = typeof body?.turnstileToken === "string" ? body.turnstileToken : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !turnstileToken) {
      return NextResponse.json({ error: "Enter a valid email and complete bot verification." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY?.trim();
    if (!turnstileSecret) return NextResponse.json({ error: "Bot verification is not configured." }, { status: 503 });
    const verifyBody = new URLSearchParams({ secret: turnstileSecret, response: turnstileToken });
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (ip) verifyBody.set("remoteip", ip);
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: verifyBody, cache: "no-store" });
    const verificationResult = await verification.json().catch(() => null);
    if (!verification.ok || !verificationResult?.success) return NextResponse.json({ error: "Bot verification failed. Please try again." }, { status: 400 });


    const origin = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://growth-inspector-yazaneva4-3470s-projects.vercel.app").replace(/\/$/, "");
    const redirectTo = new URL("/auth/callback?next=/dashboard/inbox", origin).toString();
    const supabase = createServiceClient();
    const { data, error } = await supabase.auth.admin.generateLink({ type: "magiclink", email, options: { redirectTo } });
    if (error || !data?.properties?.hashed_token) return genericResponse();


    const link = new URL("/auth/callback", origin);
    link.searchParams.set("token_hash", data.properties.hashed_token);
    link.searchParams.set("type", "magiclink");
    link.searchParams.set("next", "/dashboard/inbox");
    const href = link.toString();
    const text = "Use this one-time link to sign in to Growth Inspector. It expires shortly and can only be used once.\n\n" + href + "\n\nIf you didn't request this, you can ignore this email.";
    const html = `<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033"><div style="max-width:600px;margin:32px auto;padding:0 16px"><div style="overflow:hidden;border:1px solid #e2e8f0;border-radius:16px;background:#fff"><div style="padding:22px 28px;background:#0f172a;color:#fff;font-size:18px;font-weight:700">Growth Inspector</div><div style="padding:32px 28px;font-size:15px;line-height:1.7"><h1 style="margin:0 0 12px;font-size:23px">Your sign-in link</h1><p>Use the secure one-time link below to sign in to your Growth Inspector inbox.</p><p style="margin:26px 0"><a href="${href}" style="display:inline-block;border-radius:9px;background:#10b981;padding:13px 22px;color:#fff;text-decoration:none;font-weight:700">Sign in to Growth Inspector</a></p><p style="color:#64748b;font-size:13px">This link expires shortly and can only be used once. If you did not request it, you can ignore this email.</p><p style="margin-top:24px;color:#94a3b8;font-size:12px;word-break:break-all">If the button does not work, copy this link:<br>${href}</p></div></div><div style="padding:16px;text-align:center;color:#64748b;font-size:12px">Sent by Growth Inspector</div></div></body></html>`;
    await sendEmail({ to: email, subject: "Your Growth Inspector sign-in link", text, html });
    return genericResponse();
  } catch (error) {
    console.error("Magic-link request failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "We could not send the sign-in link right now. Please try again." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
