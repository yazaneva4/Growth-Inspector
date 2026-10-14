revoke update on table public.chat_conversations from authenticated;
grant update (updated_at) on table public.chat_conversations to authenticated;
grant delete on table public.chat_conversations to authenticated;

create policy chat_conv_creator_cleanup_delete
on public.chat_conversations
for delete
using (
  created_by = (select auth.uid())
  and org_id in (select private.auth_org_ids())
  and not exists (
    select 1
    from public.chat_messages m
    where m.conversation_id = id
  )
);
