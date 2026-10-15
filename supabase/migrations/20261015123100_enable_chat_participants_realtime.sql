-- Chat membership changes should immediately refresh each participant's chat list.
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_participants;
