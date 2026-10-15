import { requestText } from "@/lib/request-input";
import { NextRequest, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";

/** Public job-application intake. Anyone can submit; rows are reviewed in
 *  Supabase (anon cannot read them back). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const full_name = requestText(body?.full_name);
  const email = requestText(body?.email);
  if (!full_name || !email || !email.includes("@")) {
    return NextResponse.json(
      { error: "name and a valid email are required" },
      { status: 400 },
    );
  }

  const db = createPublicClient();
  const { error } = await db.from("job_applications").insert({
    full_name,
    email,
    phone: requestText(body?.phone) || null,
    role_interest: requestText(body?.role_interest) || null,
    message: requestText(body?.message) || null,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
