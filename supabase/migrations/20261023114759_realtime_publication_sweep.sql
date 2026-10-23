-- Realtime hardening (P0).
--
-- 1. Re-sweep: every RLS-protected table in public joins the
--    supabase_realtime publication with REPLICA IDENTITY FULL. Earlier sweeps
--    only covered tables that existed at the time; this one is idempotent and
--    safe to re-run whenever tables are added.
-- 2. realtime_publication_gaps() lets the app (and CI/ops) detect any
--    RLS-protected public table that is NOT streaming, so "silently not live"
--    can't happen unnoticed. Callable by service_role only.

do $$
declare
  t record;
begin
  for t in
    select c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and c.relrowsecurity = true
    order by c.relname
  loop
    execute format('alter table public.%I replica identity full', t.table_name);
    begin
      execute format('alter publication supabase_realtime add table public.%I', t.table_name);
    exception when duplicate_object then
      null;
    end;
  end loop;
end $$;

create or replace function public.realtime_publication_gaps()
returns table (table_name text)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select c.relname::text
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
    and c.relrowsecurity = true
    and not exists (
      select 1
      from pg_publication_tables p
      where p.pubname = 'supabase_realtime'
        and p.schemaname = 'public'
        and p.tablename = c.relname
    )
  order by c.relname;
$$;

revoke all on function public.realtime_publication_gaps() from public, anon, authenticated;
grant execute on function public.realtime_publication_gaps() to service_role;
