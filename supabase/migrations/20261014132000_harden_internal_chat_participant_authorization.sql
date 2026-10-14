create or replace function public.is_chat_participant(target_conversation uuid, target_user uuid default auth.uid())
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.chat_participants
    where conversation_id = target_conversation and user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_chat_participant(uuid, uuid) from public, anon;
grant execute on function public.is_chat_participant(uuid, uuid) to authenticated;

drop policy if exists chat_participant_creator_insert on public.chat_participants;
create policy chat_participant_creator_insert on public.chat_participants for insert
  with check (
    exists (
      select 1 from public.chat_conversations c
      where c.id = conversation_id
        and c.created_by = (select auth.uid())
        and c.org_id in (select private.auth_org_ids())
    )
    and user_id in (
      select m.user_id from public.memberships m
      where m.org_id in (select private.auth_org_ids())
    )
  );
