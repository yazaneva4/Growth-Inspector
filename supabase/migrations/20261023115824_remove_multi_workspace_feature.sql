-- GrowthSpace is a single CRM experience; remove the optional multi-workspace API.
-- Keep the original per-user organization/membership model intact for isolation.
drop function if exists public.create_additional_workspace(text);
