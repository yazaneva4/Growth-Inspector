-- Keep team-invite read rules equivalent while eliminating multiple permissive
-- SELECT policies. Owners/admins can see workspace invites, and invitees
-- can see invites addressed to the email in their signed JWT.
--
-- Existing policy:
--  ti_manage FOR ALL: owner/admin USING, invite manager WITH CHECK
--  ti_self   FOR SELECT: recipient email match
-- Replacement decomposes FOR ALL by command to preserve equivalent access.

DROP POLICY IF EXISTS ti_manage ON public.team_invites;
DROP POLICY IF EXISTS ti_self ON public.team_invites;

CREATE POLICY ti_select ON public.team_invites
  FOR SELECT TO authenticated
  USING (
    private.is_org_owner_or_admin(org_id)
    OR lower(email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
  );

CREATE POLICY ti_insert ON public.team_invites
  FOR INSERT TO authenticated
  WITH CHECK (private.can_manage_team_invite(org_id, role));

CREATE POLICY ti_update ON public.team_invites
  FOR UPDATE TO authenticated
  USING (private.is_org_owner_or_admin(org_id))
  WITH CHECK (private.can_manage_team_invite(org_id, role));

CREATE POLICY ti_delete ON public.team_invites
  FOR DELETE TO authenticated
  USING (private.is_org_owner_or_admin(org_id));
