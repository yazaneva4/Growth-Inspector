-- Chat membership changes should immediately refresh each participant's chat list.
--
-- Idempotent: the 2026-10-13 publication sweep (20261013120000) already added
-- every RLS-protected public table, and chat_participants has had RLS since
-- 20260906130000 — so a bare ADD TABLE aborts with duplicate_object here and
-- takes the whole migration with it. REPLICA IDENTITY FULL is set explicitly
-- because the table is keyed by (conversation_id, user_id) and DELETE payloads
-- carry no other column.
do $$
begin
  execute 'alter table public.chat_participants replica identity full';
  begin
    execute 'alter publication supabase_realtime add table public.chat_participants';
  exception when duplicate_object then
    null;
  end;
end $$;
