-- Remove remaining anonymous access paths to seeded demo workspace data.
BEGIN;

DROP POLICY IF EXISTS comp_demo_read ON public.competitors;
DROP POLICY IF EXISTS inv_demo_read ON public.invoices;

ALTER POLICY ai_operator_conversations_access ON public.ai_operator_conversations
  TO authenticated
  USING (org_id IN (SELECT private.auth_org_ids()))
  WITH CHECK (org_id IN (SELECT private.auth_org_ids()));

ALTER POLICY ai_operator_messages_access ON public.ai_operator_messages
  TO authenticated
  USING (org_id IN (SELECT private.auth_org_ids()))
  WITH CHECK (org_id IN (SELECT private.auth_org_ids()));

ALTER POLICY competitor_website_snapshots_org_read ON public.competitor_website_snapshots
  TO authenticated
  USING (org_id IN (SELECT private.auth_org_ids()));

REVOKE ALL PRIVILEGES ON TABLE
  public.ai_operator_conversations,
  public.ai_operator_messages,
  public.competitor_website_snapshots,
  public.competitors,
  public.invoices
FROM anon;

COMMIT;
