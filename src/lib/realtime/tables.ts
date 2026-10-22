/**
 * Inventory of tables created by this repository's Supabase migrations.
 * RealtimeRefresh subscribes to the public schema wildcard; Supabase's
 * publication controls which tables emit events, and RLS controls which rows
 * each browser is allowed to receive.
 *
 * The CI inventory check keeps locally migrated tables represented here.
 * This list is not the runtime subscription or publication allowlist, and the
 * live database may also contain externally managed tables.
 */
export const REALTIME_TABLES = [
  "ai_operator_conversations",
  "ai_operator_messages",
  "backup_contacts",
  "chat_conversations",
  "chat_messages",
  "chat_participants",
  "clients",
  "competitors",
  "connected_accounts",
  "conversations",
  "escalations",
  "invoices",
  "job_applications",
  "memberships",
  "messages",
  "organizations",
  "team_invites",
  "team_messages",
  "trash_items",
] as const;

export type RealtimeTable = (typeof REALTIME_TABLES)[number];
