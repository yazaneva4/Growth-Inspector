-- Make the chat cleanup policy check for messages in the outer conversation.
DROP POLICY IF EXISTS chat_conv_creator_cleanup_delete ON public.chat_conversations;
CREATE POLICY chat_conv_creator_cleanup_delete
ON public.chat_conversations
FOR DELETE
USING (
  created_by = (SELECT auth.uid())
  AND org_id IN (SELECT private.auth_org_ids())
  AND NOT EXISTS (
    SELECT 1
    FROM public.chat_messages m
    WHERE m.conversation_id = chat_conversations.id
  )
);
