-- The access-request flow and table were removed. Keep the stale RPC inert.
revoke execute on function public.submit_access_request(text, text) from public, anon, authenticated;
