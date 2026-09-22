import { NextRequest, NextResponse } from "next/server";
import { getCurrentContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { APPROVED_BROWSER_APPS, GROWTHSPACE_APP, GROWTHSPACE_DOMAIN, isAllowedBrowserApp, isAllowedBrowserUrl, normalizeBrowserPolicy } from "@/lib/ai/browser-policy";

type Membership = { org_id: string; role: "owner" | "admin" | "agent" };

async function getWorkspace() {
  const ctx = await getCurrentContext();
  if (!ctx.userId || ctx.isDemo) return { error: NextResponse.json({ error: "Sign in to use browser access." }, { status: 401 }) };
  const db = await createClient();
  const { data: membership } = await db.from("memberships").select("org_id, role").limit(1).maybeSingle<Membership>();
  if (!membership) return { error: NextResponse.json({ error: "Workspace could not be loaded." }, { status: 404 }) };
  const { data: org, error } = await db.from("organizations").select("id, browser_policy").eq("id", membership.org_id).maybeSingle();
  if (error || !org) return { error: NextResponse.json({ error: "Workspace could not be loaded." }, { status: 500 }) };
  return { db, membership, org, policy: normalizeBrowserPolicy(org.browser_policy) };
}

export async function GET(req: NextRequest) {
  const workspace = await getWorkspace();
  if ("error" in workspace) return workspace.error;
  const requestedUrl = req.nextUrl.searchParams.get("url");
  const requestedApp = req.nextUrl.searchParams.get("app");
  return NextResponse.json({
    policy: workspace.policy,
    company: { domain: GROWTHSPACE_DOMAIN, app: GROWTHSPACE_APP },
    approvedApps: APPROVED_BROWSER_APPS,
    allowed: requestedUrl ? isAllowedBrowserUrl(requestedUrl, workspace.policy) : requestedApp ? isAllowedBrowserApp(requestedApp, workspace.policy) : undefined,
  });
}

export async function POST(req: NextRequest) {
  const workspace = await getWorkspace();
  if ("error" in workspace) return workspace.error;
  if (workspace.membership.role !== "owner" && workspace.membership.role !== "admin") {
    return NextResponse.json({ error: "Only workspace admins can change browser access." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const policy = normalizeBrowserPolicy({
    enabled: body?.enabled,
    allowed_apps: Array.isArray(body?.allowed_apps) ? body.allowed_apps : workspace.policy.allowed_apps,
    require_confirmation: body?.require_confirmation,
    computer_access_enabled: body?.computer_access_enabled,
  });
  const { error } = await workspace.db.from("organizations").update({ browser_policy: policy }).eq("id", workspace.org.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, policy });
}
