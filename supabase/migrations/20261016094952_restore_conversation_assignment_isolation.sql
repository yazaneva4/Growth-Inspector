-- Restore the per-agent isolation introduced in 0017. Permissive policies
-- combine with OR, so the later workspace-wide SELECT/UPDATE policies
-- bypassed can_see_conversation and exposed teammates' assigned threads.
BEGIN;
DROP POLICY IF EXISTS "members can select conversations" ON public.conversations;
DROP POLICY IF EXISTS "members can update conversations" ON public.conversations;
-- conv_insert already permits organization members to create conversations.
-- Remove equivalent later policies, keeping one INSERT policy to evaluate.
DROP POLICY IF EXISTS "members can insert conversations" ON public.conversations;
DROP POLICY IF EXISTS conv_authenticated_insert ON public.conversations;
COMMIT;
