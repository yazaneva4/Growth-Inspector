# How real time works in Growth Inspector

This page describes what is actually implemented. If you change the mechanism,
change this page in the same PR.

## The pipeline

```
 DB write (user action, webhook, AI job, import)
        │  Postgres WAL
        ▼
 supabase_realtime publication ──► Supabase Realtime (applies RLS per subscriber)
        │  WebSocket
        ▼
 <RealtimeRefresh/> in every /dashboard page ──► router.refresh() (150 ms debounce)
        ▼
 Server components re-run and the page shows the new data
```

Pages with their own live client state (inbox conversations/messages, internal
chats and presence, team chat, notification bell, Growth AI chat) subscribe to
their tables directly and update without a full refresh.

## What is guaranteed

| Behaviour | Mechanism |
|---|---|
| Any change to a listed table reaches every signed-in session that may read the row | `postgres_changes` on each table in `src/lib/realtime/tables.ts`; RLS enforced by Supabase |
| After a reconnect the UI catches up | one `router.refresh()` when the channel becomes `SUBSCRIBED` |
| Returning to a backgrounded tab / sleeping laptop shows fresh data | refresh on `visibilitychange`, `focus`, `online` (min 1 s apart) |
| A blocked or dropped WebSocket does not leave the UI stale | while not `SUBSCRIBED`, refresh every 15 s (visible tab only) |
| You can see which of those is happening | the pill in the sidebar: **Live**, **Reconnecting**, **Polling**, **Offline**; tooltip shows last change time |
| A new table can't be silently "not live" | CI runs `scripts/check-realtime-tables.mjs`; `/api/health` reports `realtime.publication` (`complete` / `gaps`) using `realtime_publication_gaps()` |

## What is NOT real time

- Data that is computed on a schedule or by an external system only updates when
  that system writes to the database.
- **Email.** Growth Inspector only knows about an email once it is written to the
  database. Inbound mail arrives via the provider webhooks
  (`/api/inbox/email/webhook`, `/api/webhooks/email`) and therefore needs an
  external inbound-mail provider configured. Nothing in this app polls a mailbox.
  See `DEPLOY.md` → *Email channel*. Direct Gmail / Outlook / iCloud mailbox
  sync is planned, not shipped.
- Deletes: Supabase cannot filter DELETE events by RLS, so a delete triggers a
  refresh rather than a targeted update.

## Adding a table

1. Create it with RLS enabled in a migration.
2. Add it to `REALTIME_TABLES` in `src/lib/realtime/tables.ts` (CI fails otherwise).
3. Make sure it is in the publication: the sweep migration
   `20261013120000_realtime_publication_sweep.sql` does this for all RLS tables;
   for later tables add
   `alter table public.x replica identity full; alter publication supabase_realtime add table public.x;`.
4. Check `GET /api/health` → `realtime.publication` is `complete`.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Pill stuck on **Polling** | WebSocket blocked (proxy/VPN/corporate network) or Realtime disabled for the project; data still refreshes every 15 s |
| One table never updates | not in publication → `/api/health` shows it under `gaps`; apply the sweep migration |
| Pill **Live** but no updates for a table | table missing from `REALTIME_TABLES`, or RLS denies the row to this user |
| Supabase project paused | free-tier projects pause when idle; restore in the Supabase dashboard |
