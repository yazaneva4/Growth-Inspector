-- Keep demo workspace data private. Anonymous dashboard fallback is disabled in the app.
BEGIN;

DROP POLICY IF EXISTS org_demo_read ON public.organizations;
DROP POLICY IF EXISTS conv_demo_read ON public.conversations;
DROP POLICY IF EXISTS msg_demo_read ON public.messages;
DROP POLICY IF EXISTS esc_demo_read ON public.escalations;
DROP POLICY IF EXISTS ca_demo_read ON public.connected_accounts;
DROP POLICY IF EXISTS conv_demo_write ON public.conversations;
DROP POLICY IF EXISTS conv_demo_update ON public.conversations;
DROP POLICY IF EXISTS msg_demo_write ON public.messages;
DROP POLICY IF EXISTS esc_demo_write ON public.escalations;

REVOKE ALL PRIVILEGES ON TABLE
  public.organizations,
  public.conversations,
  public.messages,
  public.escalations,
  public.connected_accounts
FROM anon;

-- RLS does not protect TRUNCATE or trigger/constraint privileges.
REVOKE TRUNCATE, TRIGGER, REFERENCES
ON ALL TABLES IN SCHEMA public
FROM anon, authenticated;

COMMIT;
