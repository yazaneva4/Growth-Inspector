alter table public.organizations
  alter column browser_policy set default jsonb_build_object(
    'enabled', true,
    'allowed_domains', jsonb_build_array('growthspace.sa'),
    'allowed_apps', jsonb_build_array('growthspace', 'gmail', 'outlook-mail', 'apple-mail', 'whatsapp', 'messages', 'calls'),
    'require_confirmation', true,
    'computer_access_enabled', false
  );

update public.organizations
set browser_policy = jsonb_build_object(
  'enabled', true,
  'allowed_domains', jsonb_build_array('growthspace.sa'),
  'allowed_apps', jsonb_build_array('growthspace', 'gmail', 'outlook-mail', 'apple-mail', 'whatsapp', 'messages', 'calls'),
  'require_confirmation', true,
  'computer_access_enabled', false
)
where coalesce((browser_policy->>'enabled')::boolean, false) = false;
