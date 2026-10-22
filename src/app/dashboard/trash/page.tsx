import { getCurrentContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TrashManager, type TrashItem } from "@/components/trash-manager";

export const dynamic = "force-dynamic";

export default async function TrashPage() {
  const ctx = await getCurrentContext();
  const db = await createClient();

  const { data: org } = await db
    .from("organizations")
    .select("id")
    .eq("slug", ctx.orgSlug)
    .maybeSingle();

  let items: TrashItem[] = [];
  if (org) {
    const { data, error } = await db
      .from("trash_items")
      .select("id, source_table, source_record_id, record_label, deleted_at")
      .eq("org_id", org.id)
      .order("deleted_at", { ascending: false });

    if (error) throw new Error(`Could not load Trash: ${error.message}`);
    items = (data ?? []) as TrashItem[];
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Trash</h1>
        <p className="mt-1 text-sm text-slate-500">
          Restore removed records whenever you need them. Trash belongs to this workspace and has no automatic expiry.
        </p>
      </div>
      <TrashManager items={items} />
    </div>
  );
}
