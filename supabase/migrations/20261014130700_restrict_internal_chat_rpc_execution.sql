-- Internal chat helpers expose only the signed-in operations the app needs.
revoke all on function public.list_chat_members() from public, anon;
grant execute on function public.list_chat_members() to authenticated;
revoke all on function public.is_chat_participant(uuid, uuid) from public, anon;
grant execute on function public.is_chat_participant(uuid, uuid) to authenticated;

-- PostgREST needs table grants in addition to the row-level policies.
grant select, insert, update on table public.chat_conversations to authenticated;
grant select, insert on table public.chat_participants to authenticated;
grant select, insert on table public.chat_messages to authenticated;
