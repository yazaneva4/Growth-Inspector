-- Run as the database owner after migrations. All fixtures roll back.
BEGIN;
DO $$
DECLARE
  agent uuid := gen_random_uuid();
  teammate uuid := gen_random_uuid();
  admin_id uuid := gen_random_uuid();
  outsider uuid := gen_random_uuid();
  workspace uuid := gen_random_uuid();
  account uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users(id) VALUES (agent), (teammate), (admin_id), (outsider);
  INSERT INTO public.organizations(id, name, slug)
    VALUES (workspace, 'RLS regression fixture', 'rls-test-' || workspace);
  INSERT INTO public.memberships(org_id, user_id, role)
    VALUES (workspace, agent, 'agent'), (workspace, teammate, 'agent'), (workspace, admin_id, 'admin');
  INSERT INTO public.connected_accounts(id, org_id, platform, external_id, display_name)
    VALUES (account, workspace, 'sandbox', account::text, 'RLS fixture');
  INSERT INTO public.conversations(org_id, account_id, platform, customer_handle, assigned_to)
    VALUES (workspace, account, 'sandbox', 'own', agent),
           (workspace, account, 'sandbox', 'teammate', teammate),
           (workspace, account, 'sandbox', 'unassigned', null);
  PERFORM set_config('test.workspace', workspace::text, true);
  PERFORM set_config('test.agent', agent::text, true);
  PERFORM set_config('test.admin', admin_id::text, true);
  PERFORM set_config('test.outsider', outsider::text, true);
END $$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.agent'), true);
DO $$
DECLARE changed integer;
BEGIN
  IF (SELECT count(*) FROM public.conversations WHERE org_id = current_setting('test.workspace')::uuid) <> 2 THEN
    RAISE EXCEPTION 'Agent must see only own and unassigned conversations';
  END IF;
  UPDATE public.conversations SET customer_name = 'forbidden'
    WHERE org_id = current_setting('test.workspace')::uuid AND customer_handle = 'teammate';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Agent updated a teammate conversation'; END IF;
  UPDATE public.conversations SET customer_name = 'allowed'
    WHERE org_id = current_setting('test.workspace')::uuid AND customer_handle = 'own';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN RAISE EXCEPTION 'Agent cannot update their conversation'; END IF;
  INSERT INTO public.conversations(org_id, account_id, platform, customer_handle, assigned_to)
    SELECT org_id, account_id, platform, 'new', auth.uid() FROM public.conversations
    WHERE org_id = current_setting('test.workspace')::uuid AND customer_handle = 'own';
END $$;
SELECT set_config('request.jwt.claim.sub', current_setting('test.admin'), true);
DO $$ BEGIN
  IF (SELECT count(*) FROM public.conversations WHERE org_id = current_setting('test.workspace')::uuid) <> 4 THEN
    RAISE EXCEPTION 'Admin must see all workspace conversations';
  END IF;
END $$;
SELECT set_config('request.jwt.claim.sub', current_setting('test.outsider'), true);
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.conversations WHERE org_id = current_setting('test.workspace')::uuid) THEN
    RAISE EXCEPTION 'Outsider can see another workspace';
  END IF;
END $$;
ROLLBACK;
SELECT 'Conversation RLS regression checks passed; fixtures rolled back' AS result;
