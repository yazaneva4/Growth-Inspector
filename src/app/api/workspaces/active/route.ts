import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { requestText } from "@/lib/request-input";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Switch only to a workspace the current signed-in user belongs to. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const workspaceId = requestText(body?.workspaceId);
  if (!workspaceId) {
    return NextResponse.json({ error: "Choose a workspace." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { data: membership, error } = await supabase
    .from("memberships")
    .select("org_id")
    .eq("user_id", user.id)
    .eq("org_id", workspaceId)
    .maybeSingle();

  if (error || !membership) {
    return NextResponse.json({ error: "That workspace isn't available to this account." }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set("growthspace-active-workspace", membership.org_id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ ok: true }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
