-- Internal chat helpers expose only the signed-in operations the app needs.
revoke all on function public.list_chat_members() from public, anon;
grant execute on function public.list_chat_members() to authenticated;
revoke all on function public.is_chat_participant(uuid, uuid) from public, anon;
grant execute on function public.is_chat_participant(uuid, uuid) to authenticated;
