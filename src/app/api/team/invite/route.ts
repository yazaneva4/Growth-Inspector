import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ROLES = ["admin", "agent"] as const;

/** Invite an employee by email to the signed-in user's workspace. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = (body?.email as string | undefined)?.trim().toLowerCase();
  const role = ROLES.includes(body?.role) ? body.role : "agent";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "valid email required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "sign in required" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("org_id, role")
    .limit(1)
    .maybeSingle();
  if (!membership) {
    return NextResponse.json({ error: "no organization" }, { status: 404 });
  }
  if (membership.role !== "owner" && membership.role !== "admin") {
    return NextResponse.json({ error: "only workspace owners and admins can invite members" }, { status: 403 });
  }
  if (role === "admin" && membership.role !== "owner") {
    return NextResponse.json({ error: "only workspace owners can invite admins" }, { status: 403 });
  }

  const { error } = await supabase
    .from("team_invites")
    .upsert(
      { org_id: membership.org_id, email, role, accepted: false, created_by: user.id },
      { onConflict: "org_id,email" },
    );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Existing users can be added immediately. The database function independently
  // checks inviter role, inviter identity, invite state, and permitted role.
  const { error: acceptError } = await supabase.rpc("accept_existing_team_invite", {
    p_org_id: membership.org_id,
    p_email: email,
  });
  if (acceptError) {
    if (!acceptError.message.toLowerCase().includes("does not exist")) {
      return NextResponse.json({ error: acceptError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
