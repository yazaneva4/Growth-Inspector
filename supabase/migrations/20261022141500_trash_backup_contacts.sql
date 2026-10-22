-- Keep removable backup contacts recoverable just like other workspace records.
alter table public.trash_items
  drop constraint if exists trash_items_source_table_check;

alter table public.trash_items
  add constraint trash_items_source_table_check
  check (source_table in ('clients', 'competitors', 'invoices', 'ai_operator_conversations', 'backup_contacts'));

create or replace function public.move_to_trash(p_source_table text, p_record_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = '' as $fn$
declare
  v_user_id uuid := auth.uid();
  v_org_id uuid;
  v_record jsonb;
  v_label text;
  v_trash_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select m.org_id into v_org_id
  from public.memberships m
  where m.user_id = v_user_id
  order by m.created_at
  limit 1;

  if v_org_id is null then
    raise exception 'no workspace membership';
  end if;

  if p_source_table = 'clients' then
    select to_jsonb(c), coalesce(nullif(trim(c.name), ''), 'Client')
      into v_record, v_label
    from public.clients c
    where c.id = p_record_id and c.org_id = v_org_id
    for update;
    if v_record is null then raise exception 'client not found'; end if;

    insert into public.trash_items (org_id, source_table, source_record_id, record_label, record_data, deleted_by)
    values (v_org_id, p_source_table, p_record_id, v_label, v_record, v_user_id)
    returning id into v_trash_id;

    delete from public.clients where id = p_record_id and org_id = v_org_id;

  elsif p_source_table = 'competitors' then
    select to_jsonb(c), coalesce(nullif(trim(c.handle), ''), 'Competitor') || ' · ' || c.platform::text
      into v_record, v_label
    from public.competitors c
    where c.id = p_record_id and c.org_id = v_org_id
    for update;
    if v_record is null then raise exception 'competitor not found'; end if;

    insert into public.trash_items (org_id, source_table, source_record_id, record_label, record_data, deleted_by)
    values (v_org_id, p_source_table, p_record_id, v_label, v_record, v_user_id)
    returning id into v_trash_id;

    delete from public.competitors where id = p_record_id and org_id = v_org_id;

  elsif p_source_table = 'backup_contacts' then
    select to_jsonb(c), coalesce(nullif(trim(c.name), ''), 'Backup contact')
      into v_record, v_label
    from public.backup_contacts c
    where c.id = p_record_id and c.org_id = v_org_id
    for update;
    if v_record is null then raise exception 'backup contact not found'; end if;

    insert into public.trash_items (org_id, source_table, source_record_id, record_label, record_data, deleted_by)
    values (v_org_id, p_source_table, p_record_id, v_label, v_record, v_user_id)
    returning id into v_trash_id;

    delete from public.backup_contacts where id = p_record_id and org_id = v_org_id;

  elsif p_source_table = 'invoices' then
    select to_jsonb(i), coalesce(nullif(trim(i.number), ''), 'Invoice') || ' · ' || coalesce(i.customer_name, 'Customer')
      into v_record, v_label
    from public.invoices i
    where i.id = p_record_id and i.org_id = v_org_id
    for update;
    if v_record is null then raise exception 'invoice not found'; end if;

    insert into public.trash_items (org_id, source_table, source_record_id, record_label, record_data, deleted_by)
    values (v_org_id, p_source_table, p_record_id, v_label, v_record, v_user_id)
    returning id into v_trash_id;

    delete from public.invoices where id = p_record_id and org_id = v_org_id;

  elsif p_source_table = 'ai_operator_conversations' then
    select
      jsonb_build_object(
        'record', to_jsonb(c),
        'messages', coalesce((
          select jsonb_agg(to_jsonb(m) order by m.created_at)
          from public.ai_operator_messages m
          where m.conversation_id = c.id and m.org_id = v_org_id
        ), '[]'::jsonb)
      ),
      coalesce(nullif(trim(c.title), ''), 'Growth AI conversation')
      into v_record, v_label
    from public.ai_operator_conversations c
    where c.id = p_record_id and c.org_id = v_org_id
    for update of c;
    if v_record is null then raise exception 'Growth AI conversation not found'; end if;

    insert into public.trash_items (org_id, source_table, source_record_id, record_label, record_data, deleted_by)
    values (v_org_id, p_source_table, p_record_id, v_label, v_record, v_user_id)
    returning id into v_trash_id;

    delete from public.ai_operator_messages
    where conversation_id = p_record_id and org_id = v_org_id;
    delete from public.ai_operator_conversations
    where id = p_record_id and org_id = v_org_id;

  else
    raise exception 'unsupported record type';
  end if;

  return v_trash_id;
end;
$fn$;


revoke all on function public.move_to_trash(text, uuid) from public, anon;
grant execute on function public.move_to_trash(text, uuid) to authenticated;

create or replace function public.restore_trash_item(p_trash_id uuid)
returns text
language plpgsql
security invoker
set search_path = '' as $fn$
declare
  v_user_id uuid := auth.uid();
  v_org_id uuid;
  v_item public.trash_items%rowtype;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select m.org_id into v_org_id
  from public.memberships m
  where m.user_id = v_user_id
  order by m.created_at
  limit 1;

  if v_org_id is null then
    raise exception 'no workspace membership';
  end if;

  select * into v_item
  from public.trash_items
  where id = p_trash_id and org_id = v_org_id
  ;

  if not found then
    raise exception 'trash item not found';
  end if;

  if v_item.source_table = 'clients' then
    insert into public.clients
    select (jsonb_populate_record(null::public.clients, v_item.record_data)).*;
  elsif v_item.source_table = 'backup_contacts' then
    insert into public.backup_contacts
    select (jsonb_populate_record(null::public.backup_contacts, v_item.record_data)).*;
  elsif v_item.source_table = 'competitors' then
    insert into public.competitors
    select (jsonb_populate_record(null::public.competitors, v_item.record_data)).*;
  elsif v_item.source_table = 'invoices' then
    insert into public.invoices
    select (jsonb_populate_record(null::public.invoices, v_item.record_data)).*;
  elsif v_item.source_table = 'ai_operator_conversations' then
    insert into public.ai_operator_conversations
    select (jsonb_populate_record(null::public.ai_operator_conversations, v_item.record_data -> 'record')).*;

    insert into public.ai_operator_messages
    select *
    from jsonb_populate_recordset(null::public.ai_operator_messages, v_item.record_data -> 'messages');
  else
    raise exception 'unsupported record type';
  end if;

  delete from public.trash_items where id = v_item.id and org_id = v_org_id;
  return v_item.source_table;
end;
$fn$;


revoke all on function public.restore_trash_item(uuid) from public, anon;
grant execute on function public.restore_trash_item(uuid) to authenticated;
