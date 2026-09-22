export const GROWTHSPACE_DOMAIN = "growthspace.sa";
export const GROWTHSPACE_APP = "growthspace";

export type BrowserPolicy = {
  enabled: boolean;
  allowed_domains: string[];
  allowed_apps: string[];
  require_confirmation: boolean;
};

export const DEFAULT_BROWSER_POLICY: BrowserPolicy = {
  enabled: false,
  allowed_domains: [GROWTHSPACE_DOMAIN],
  allowed_apps: [GROWTHSPACE_APP],
  require_confirmation: true,
};

export function normalizeBrowserPolicy(value: unknown): BrowserPolicy {
  const input = value && typeof value === "object" ? value as Partial<BrowserPolicy> : {};
  return {
    enabled: input.enabled === true,
    // The domain cannot be broadened by a client request.
    allowed_domains: [GROWTHSPACE_DOMAIN],
    // The app cannot be broadened by a client request either.
    allowed_apps: input.allowed_apps?.includes(GROWTHSPACE_APP) ? [GROWTHSPACE_APP] : [],
    require_confirmation: input.require_confirmation !== false,
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
  return policy.enabled && policy.allowed_apps.includes(app);
}
