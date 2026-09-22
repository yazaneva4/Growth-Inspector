-- Admin-controlled browser access policy for Growth Operator.
-- The application keeps the allowlist intentionally narrow: Growthspace only.
alter table public.organizations
  add column if not exists browser_policy jsonb not null default jsonb_build_object(
    'enabled', false,
    'allowed_domains', jsonb_build_array('growthspace.sa'),
    'allowed_apps', jsonb_build_array('growthspace'),
    'require_confirmation', true
  );

comment on column public.organizations.browser_policy is
  'Admin-controlled browser bridge policy. Server code must validate URLs against the allowlist.';
