-- Harden immediate acceptance of existing team invites and reduce FK/RLS overhead.
create or replace function public.accept_existing_team_invite(p_org_id uuid, p_email text)
returns void language plpgsql security definer set search_path to 'public' as $function$
declare caller uuid; caller_role member_role; target_user uuid; normalized_email text;
begin
  caller := auth.uid();
  if caller is null then raise exception 'authentication required'; end if;
  select m.role into caller_role from public.memberships m where m.org_id=p_org_id and m.user_id=caller;
  if caller_role is null then raise exception 'not a workspace member'; end if;
  if caller_role not in ('owner','admin') then raise exception 'only workspace owners and admins may invite members'; end if;
  normalized_email := lower(trim(p_email));
  if normalized_email='' then raise exception 'email required'; end if;
  select u.id into target_user from auth.users u where lower(u.email)=normalized_email limit 1;
  if target_user is null then return; end if;
  if not exists(select 1 from public.team_invites ti where ti.org_id=p_org_id and lower(ti.email)=normalized_email and ti.accepted=false and (ti.created_by=caller or caller_role='owner') and (ti.role<>'admin' or caller_role='owner')) then raise exception 'no invite is available for this user from this caller'; end if;
  insert into public.memberships(org_id,user_id,role) select ti.org_id,target_user,ti.role from public.team_invites ti where ti.org_id=p_org_id and lower(ti.email)=normalized_email and ti.accepted=false and (ti.created_by=caller or caller_role='owner') and (ti.role<>'admin' or caller_role='owner') on conflict(org_id,user_id) do nothing;
  update public.team_invites ti set accepted=true where ti.org_id=p_org_id and lower(ti.email)=normalized_email and ti.accepted=false and (ti.created_by=caller or caller_role='owner') and (ti.role<>'admin' or caller_role='owner');
end;$function$;
revoke execute on function public.accept_existing_team_invite(uuid,text) from public,anon;
grant execute on function public.accept_existing_team_invite(uuid,text) to authenticated;
revoke execute on function public.can_access_workspace(uuid) from public,anon;
grant execute on function public.can_access_workspace(uuid) to authenticated;
create index if not exists ai_operator_messages_conversation_org_idx on public.ai_operator_messages(conversation_id,org_id);
create index if not exists chat_conversations_created_by_idx on public.chat_conversations(created_by);
create index if not exists chat_messages_author_id_idx on public.chat_messages(author_id);
create index if not exists chat_messages_org_id_idx on public.chat_messages(org_id);
create index if not exists competitor_website_snapshots_org_id_idx on public.competitor_website_snapshots(org_id);
create index if not exists connected_accounts_org_id_idx on public.connected_accounts(org_id);
create index if not exists conversations_account_id_idx on public.conversations(account_id);
create index if not exists conversations_account_org_idx on public.conversations(account_id,org_id);
create index if not exists conversations_assigned_to_idx on public.conversations(assigned_to);
create index if not exists escalations_conversation_id_idx on public.escalations(conversation_id);
create index if not exists escalations_conversation_org_idx on public.escalations(conversation_id,org_id);
create index if not exists memberships_user_id_idx on public.memberships(user_id);
create index if not exists messages_conversation_org_idx on public.messages(conversation_id,org_id);
create index if not exists team_messages_user_id_idx on public.team_messages(user_id);
drop policy if exists ti_self on public.team_invites;
create policy ti_self on public.team_invites for select to authenticated using(lower(email)=lower(coalesce(((select auth.jwt())->>'email'),'')));
drop policy if exists team_messages_insert on public.team_messages;
create policy team_messages_insert on public.team_messages for insert to authenticated with check(org_id in(select private.auth_org_ids()) and user_id=(select auth.uid()));
drop policy if exists chat_conv_member_insert on public.chat_conversations;
create policy chat_conv_member_insert on public.chat_conversations for insert to authenticated with check(org_id in(select private.auth_org_ids()) and created_by=(select auth.uid()));
drop policy if exists chat_message_member_insert on public.chat_messages;
create policy chat_message_member_insert on public.chat_messages for insert to authenticated with check(org_id in(select private.auth_org_ids()) and author_id=(select auth.uid()) and is_chat_participant(conversation_id));
