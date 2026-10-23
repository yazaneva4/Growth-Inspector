-- Admin-created workspaces: at most 20 memberships/workspaces per user.
-- A user must already be an owner/admin in a workspace; new workspaces are
-- created with the caller as owner and marked ready without repeating signup.

create or replace function public.create_additional_workspace(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  uid uuid;
  workspace_count integer;
  cleaned_name text;
  base_slug text;
  final_slug text;
  n integer := 0;
  new_id uuid;
begin
  uid := auth.uid();
  if uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));

  if not exists (
    select 1
    from public.memberships m
    where m.user_id = uid
      and m.role in ('owner', 'admin')
  ) then
    raise exception 'workspace admin permission required' using errcode = '42501';
  end if;

  select count(distinct m.org_id)::integer
    into workspace_count
  from public.memberships m
  where m.user_id = uid;

  if workspace_count >= 20 then
    raise exception 'workspace limit reached: maximum 20 workspaces per user'
      using errcode = 'P0001';
  end if;

  cleaned_name := left(btrim(coalesce(p_name, '')), 80);
  if cleaned_name = '' then
    raise exception 'workspace name is required' using errcode = '22023';
  end if;

  base_slug := regexp_replace(lower(cleaned_name), '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  if base_slug = '' or base_slug = 'demo' then
    base_slug := 'workspace';
  end if;

  loop
    final_slug := case when n = 0 then base_slug else base_slug || '-' || n end;
    begin
      insert into public.organizations (name, slug, brand_name, onboarded)
      values (cleaned_name, final_slug, cleaned_name, true)
      returning id into new_id;
      exit;
    exception when unique_violation then
      n := n + 1;
      if n > 1000 then
        raise exception 'could not allocate a unique workspace slug';
      end if;
    end;
  end loop;

  insert into public.memberships (org_id, user_id, role)
  values (new_id, uid, 'owner');

  return new_id;
end
$$;

revoke all on function public.create_additional_workspace(text) from public, anon;
grant execute on function public.create_additional_workspace(text) to authenticated;
