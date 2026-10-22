import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SOURCE_TABLES = new Set([
  "clients",
  "competitors",
  "invoices",
  "ai_operator_conversations",
  "backup_contacts",
]);

async function getWorkspace() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: "sign in required" }, { status: 401 }) };
  }

  const { data: membership, error } = await supabase
    .from("memberships")
    .select("org_id")
    .eq("user_id", user.id)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (error || !membership) {
    return { error: NextResponse.json({ error: "no workspace membership" }, { status: 404 }) };
  }

  return { supabase, user, orgId: membership.org_id as string };
}

export async function GET() {
  const workspace = await getWorkspace();
  if ("error" in workspace) return workspace.error;

  const { data, error } = await workspace.supabase
    .from("trash_items")
    .select("id, source_table, source_record_id, record_label, deleted_at")
    .eq("org_id", workspace.orgId)
    .order("deleted_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const workspace = await getWorkspace();
  if ("error" in workspace) return workspace.error;

  const body = await req.json().catch(() => null);
  const action = body?.action;
  const id = typeof body?.id === "string" ? body.id : "";

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (action === "restore") {
    const { data, error } = await workspace.supabase.rpc("restore_trash_item", {
      p_trash_id: id,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, restoredType: data });
  }

  if (action === "delete") {
    const sourceTable = typeof body?.sourceTable === "string" ? body.sourceTable : "";
    if (!SOURCE_TABLES.has(sourceTable)) {
      return NextResponse.json({ error: "unsupported record type" }, { status: 400 });
    }

    const { data, error } = await workspace.supabase.rpc("move_to_trash", {
      p_source_table: sourceTable,
      p_record_id: id,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, trashId: data });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const workspace = await getWorkspace();
  if ("error" in workspace) return workspace.error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data, error } = await workspace.supabase
    .from("trash_items")
    .delete()
    .eq("id", id)
    .eq("org_id", workspace.orgId)
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "trash item not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
