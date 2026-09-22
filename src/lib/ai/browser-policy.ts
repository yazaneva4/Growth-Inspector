export const GROWTHSPACE_DOMAIN = "growthspace.sa";
export const GROWTHSPACE_APP = "growthspace";
export const APPROVED_BROWSER_APPS = ["growthspace", "gmail", "outlook-mail", "apple-mail", "whatsapp", "messages", "calls"] as const;
export type BrowserApp = (typeof APPROVED_BROWSER_APPS)[number];

export type BrowserPolicy = {
  enabled: boolean;
  allowed_domains: string[];
  allowed_apps: BrowserApp[];
  require_confirmation: boolean;
  computer_access_enabled: boolean;
};

export const DEFAULT_BROWSER_POLICY: BrowserPolicy = {
  enabled: true,
  allowed_domains: [GROWTHSPACE_DOMAIN],
  allowed_apps: [...APPROVED_BROWSER_APPS],
  require_confirmation: true,
  computer_access_enabled: false,
};

export function normalizeBrowserPolicy(value: unknown): BrowserPolicy {
  const input = value && typeof value === "object" ? value as Partial<BrowserPolicy> : {};
  return {
    enabled: input.enabled === true,
    // The domain cannot be broadened by a client request.
    allowed_domains: [GROWTHSPACE_DOMAIN],
    // The app cannot be broadened by a client request either.
    allowed_apps: APPROVED_BROWSER_APPS.filter((app) => input.allowed_apps?.includes(app)),
    require_confirmation: input.require_confirmation !== false,
    computer_access_enabled: input.computer_access_enabled === true,
  };
}

export function isAllowedBrowserUrl(value: string, policy: BrowserPolicy = DEFAULT_BROWSER_POLICY): boolean {
  if (!policy.enabled || !policy.allowed_domains.includes(GROWTHSPACE_DOMAIN)) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return host === GROWTHSPACE_DOMAIN || host.endsWith(`.${GROWTHSPACE_DOMAIN}`);
  } catch {
    return false;
  }
}

export function isAllowedBrowserApp(app: string, policy: BrowserPolicy = DEFAULT_BROWSER_POLICY): boolean {
  return policy.enabled && APPROVED_BROWSER_APPS.includes(app as BrowserApp) && policy.allowed_apps.includes(app as BrowserApp);
}
