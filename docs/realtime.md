# How real time works in Growth Inspector

This page describes the implemented behaviour and its operational limits.

## Event flow

```text
Database write → Supabase Realtime publication → public schema wildcard subscription
              → RLS-filtered change event → 150 ms debounce → router.refresh()
              → dashboard server components reload current data
```

`RealtimeRefresh` is mounted throughout the authenticated dashboard. It listens to all `postgres_changes` events in the `public` schema. Supabase's `supabase_realtime` publication determines which tables emit changes; row-level security determines which rows a signed-in browser can receive. Pages with dedicated client-side channels may update their own state directly.

## Connection behaviour

- A successful subscription displays **Live**. The component refreshes after a channel reconnects.
- Focus, visibility, and network-online events trigger a throttled refresh when a user returns to the app.
- While the WebSocket is not subscribed, a visible tab refreshes every 15 seconds and reports **Reconnecting** or **Polling**. If the browser is offline, it reports **Offline**.
- A database event causes a server refresh; the UI is not a durable event log and does not replay each intermediate change. Deletes also trigger a refresh because Supabase cannot apply row-level security filtering to DELETE events.

## Inventory and publication

`src/lib/realtime/tables.ts` inventories tables created in this repository's migrations. It is used by the CI migration inventory check and health response; it is not the runtime subscription allowlist. Externally managed live tables may not appear there.

Migration `20261013120000_realtime_publication_sweep.sql` adds RLS-enabled public tables to the publication with full replica identity and defines `realtime_publication_gaps()`. `/api/health` reports the wildcard subscription scope and the result of that RPC. Until the migration is applied to a database, publication status is **unchecked**. A complete result means the RPC found no missing eligible tables in the database it inspected.

The live project was inspected and its existing RLS tables were present in `supabase_realtime` with full replica identity. The Supabase Preview GitHub check currently fails because the remote database has migration versions that are absent from this repository. Do not infer the migration is applied from a successful application build.

## Deployment and reconciliation updates

The dashboard also reconciles every 30 seconds while visible and online, even with a healthy socket. This picks up time-based changes and checked-in reports that do not emit database events. Disconnected or stalled connections fall back after 15 seconds. Every page checks `/api/version` once per minute and on focus/reconnect, offering a reload when the deployed commit changes; it never discards open forms automatically.

## What does not update by itself

- Data produced only by a schedule or external service changes when that process writes to the database.
- Email appears after a configured inbound provider webhook writes it. Direct Gmail, Outlook, or iCloud mailbox polling is not implemented.
- A **Live** connection badge means the channel is subscribed; RLS may still prevent a given user from seeing a row.
- As of 18 October 2026, the internal chat tables exist in the inspected live project and are in the Realtime publication; authenticated per-user delivery still needs session-level verification.

## Adding a table

1. Add the table and its RLS policies in a repository migration.
2. Add the table name to `REALTIME_TABLES` so CI tracks the local migration inventory.
3. Ensure the deployed database includes the table in `supabase_realtime` and configure replica identity as required by its event payloads. The sweep migration covers eligible RLS-enabled public tables when it is applied.
4. Check `/api/health` for publication status; verify changes with an authenticated session that is allowed to read the affected rows.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Badge remains on Polling | WebSocket blocked by a proxy/VPN/network, or the Realtime service is unavailable. Visible tabs continue refreshing every 15 seconds. |
| Badge says Live but a row does not appear | The current user may be excluded by RLS, the database write may not have occurred, or its table may not be in the publication. |
| Health reports unchecked | The service role is not configured or the publication-gap RPC is not installed/available. |
| Supabase Preview check fails on migration history | Remote migration versions are missing from the repository's migration directory; reconcile migration history before applying further migrations. |
