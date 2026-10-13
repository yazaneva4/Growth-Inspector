#!/usr/bin/env node
// CI guard: every table created in supabase/migrations must be listed in
// src/lib/realtime/tables.ts (so the dashboard subscribes to it), and every
// listed table must actually exist in a migration.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const migrationsDir = join(root, "supabase", "migrations");

const created = new Set();
for (const file of readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"))) {
  const sql = readFileSync(join(migrationsDir, file), "utf8");
  for (const m of sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?"?([a-z_][a-z0-9_]*)"?/gi)) {
    created.add(m[1].toLowerCase());
  }
}
// Tables dropped later are not expected to stream.
for (const file of readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"))) {
  const sql = readFileSync(join(migrationsDir, file), "utf8");
  for (const m of sql.matchAll(/drop\s+table\s+(?:if\s+exists\s+)?(?:public\.)?"?([a-z_][a-z0-9_]*)"?/gi)) {
    created.delete(m[1].toLowerCase());
  }
}

const src = readFileSync(join(root, "src", "lib", "realtime", "tables.ts"), "utf8");
const listed = new Set([...src.matchAll(/^\s*"([a-z_][a-z0-9_]*)",?\s*$/gim)].map((m) => m[1]));

const missing = [...created].filter((t) => !listed.has(t)).sort();
const unknown = [...listed].filter((t) => !created.has(t)).sort();

if (missing.length || unknown.length) {
  if (missing.length) console.error(`Tables created in migrations but not in REALTIME_TABLES:\n  ${missing.join("\n  ")}`);
  if (unknown.length) console.error(`Tables in REALTIME_TABLES with no CREATE TABLE in migrations:\n  ${unknown.join("\n  ")}`);
  process.exit(1);
}
console.log(`realtime tables OK (${listed.size} tables)`);
