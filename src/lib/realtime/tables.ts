/**
 * Every application table that the dashboard listens to over Supabase
 * Realtime. This list is the single source of truth:
 *
 *  - `RealtimeRefresh` subscribes to exactly these tables.
 *  - `scripts/check-realtime-tables.mjs` (run in CI) fails if a table created
 *    in `supabase/migrations` is missing here, so a new table can never be
 *    silently "not live".
 *  - Migration `20261013120000_realtime_publication_sweep.sql` makes sure each
 *    one is in the `supabase_realtime` publication.
 *
 * Row-Level Security still decides which rows a browser receives; this list
 * only chooses which tables to subscribe to.
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
] as const;

export type RealtimeTable = (typeof REALTIME_TABLES)[number];
