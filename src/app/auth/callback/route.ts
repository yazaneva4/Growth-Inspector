import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EMAIL_OTP_TYPES = [
  "magiclink",
  "email",
  "recovery",
  "invite",
  "email_change",
  "reauthentication",
] as const;

type EmailOtpType = (typeof EMAIL_OTP_TYPES)[number];

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return EMAIL_OTP_TYPES.some((type) => type === value);
}

/** Completes Growth Inspector email/OAuth authentication and always redirects back to the app. */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const code = req.nextUrl.searchParams.get("code");
  const tokenHash = req.nextUrl.searchParams.get("token_hash");
  const type = req.nextUrl.searchParams.get("type");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) console.error("Growth Inspector auth callback:", error.message);
  } else if (tokenHash && isEmailOtpType(type)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) console.error("Growth Inspector email callback:", error.message);
  }

  const next = req.nextUrl.searchParams.get("next");
  let destination = new URL("/dashboard/inbox", req.url);
  if (next?.startsWith("/") && !next.startsWith("//")) {
    const candidate = new URL(next, req.url);
    if (candidate.origin === req.nextUrl.origin) destination = candidate;
  }
  return NextResponse.redirect(destination);
}
