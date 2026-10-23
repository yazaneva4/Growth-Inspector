import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { requestText } from "@/lib/request-input";
import { getCurrentContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Create a separate workspace for an authenticated workspace owner/admin. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = requestText(body?.name).trim();

  if (!name) {
    return NextResponse.json({ error: "Enter a workspace name." }, { status: 400 });
  }
  if (name.length > 80) {
    return NextResponse.json({ error: "Workspace names must be 80 characters or fewer." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const ctx = await getCurrentContext();
  if (ctx.isDemo || !ctx.userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (ctx.role !== "owner" && ctx.role !== "admin") {
    return NextResponse.json({ error: "Only workspace owners and admins can create workspaces." }, { status: 403 });
  }

  const { data: createdId, error } = await supabase.rpc("create_additional_workspace", {
    p_name: name,
  });
  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("workspace limit reached")) {
      return NextResponse.json({ error: "You've reached the limit of 20 workspaces for this account." }, { status: 409 });
    }
    if (message.includes("workspace admin permission required")) {
      return NextResponse.json({ error: "Only workspace owners and admins can create workspaces." }, { status: 403 });
    }
    if (message.includes("workspace name is required")) {
      return NextResponse.json({ error: "Enter a valid workspace name." }, { status: 400 });
    }
    return NextResponse.json({ error: "The workspace could not be created. Please try again." }, { status: 400 });
  }

  const workspaceId = typeof createdId === "string" ? createdId : null;
  if (!workspaceId) {
    return NextResponse.json({ error: "Workspace creation returned no ID." }, { status: 500 });
  }

  const { data: workspace, error: readError } = await supabase
    .from("organizations")
    .select("id, name, slug, onboarded")
    .eq("id", workspaceId)
    .maybeSingle();
  if (readError || !workspace) {
    return NextResponse.json({ error: "Workspace was created but could not be loaded. Refresh and try again." }, { status: 500 });
  }

  // Move into the new workspace immediately. The ID is only honoured by
  // getCurrentContext when it belongs to this signed-in user's memberships.
  const cookieStore = await cookies();
  cookieStore.set("growthspace-active-workspace", workspace.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ ok: true, workspace }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
