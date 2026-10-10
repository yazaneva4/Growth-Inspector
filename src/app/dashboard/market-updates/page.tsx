const checks = [
  {
    label: "GrowthSpace and Saudi competitors",
    detail: "No newly verified company announcement or official contact-detail change was found in this check.",
    href: "https://growthspace.sa/",
  },
  {
    label: "Vision 2030 / Human Capability Development",
    detail: "No newly verified announcement was found in this check. Previously verified Saudi workforce and AI capability announcements remain unchanged.",
    href: "https://www.vision2030.gov.sa/",
  },
  {
    label: "Supabase",
    detail: "Latest verified operations change: the status page moved to incident.io on 8 October. RSS and Slack users must resubscribe; SMS and webhook subscriptions are no longer supported.",
    href: "https://supabase.com/changelog/status-page-migration",
  },
  {
    label: "Vercel, GitHub, and Resend",
    detail: "New Vercel storage billing and retention terms are listed above. No newer material GitHub or Resend update was verified in this check.",
    href: "https://vercel.com/changelog/deployment-storage-pricing-expands-to-existing-teams",
  },
];

export default function MarketUpdatesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-sm font-medium text-emerald-700">Verified public sources</p>
        <h1 className="mt-1 text-3xl font-bold">Market updates</h1>
        <p className="mt-2 text-sm text-slate-500">
          Checked 10 October 2026, 12:43 p.m. Riyadh time · One newly verified Cloudflare agent-tooling update was found. No official contact-detail change was verified.
        </p>
      </header>

      <section aria-labelledby="confirmed-heading" className="space-y-4">
        <h2 id="confirmed-heading" className="text-xl font-semibold">Confirmed update</h2>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · Agent tooling</span>
            <time dateTime="2026-10-10" className="text-xs text-slate-500">10 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Cloudflare API MCP server now serves Cloudflare skills</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare’s API MCP server now exposes Cloudflare skills through the Skills over MCP extension. Compatible MCP clients can discover them with skills/list and read their files from skill URLs after connecting to https://mcp.cloudflare.com/mcp. This is optional agent tooling and does not require a Growth Inspector application change.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://developers.cloudflare.com/changelog/post/2026-10-10-cloudflare-mcp-skills/" target="_blank" rel="noreferrer">
            Read Cloudflare’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">Vercel · Storage billing</span>
            <time dateTime="2026-10-09" className="text-xs text-slate-500">9 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Existing Pro teams move to paid deployment storage and 30-day retention</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Vercel says Deployment Storage and Functions Storage billing will begin for all Pro teams at $0.10 per GB-month. Deployments older than 30 days will start being deleted on 23 October unless a team opts out in its retention settings. Deleted deployments cannot be used for rollback. Growth Inspector should review its Vercel retention settings and storage usage before 23 October if it runs on a Pro team.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://vercel.com/changelog/deployment-storage-pricing-expands-to-existing-teams" target="_blank" rel="noreferrer">
            Read Vercel’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · HTTP analytics</span>
            <time dateTime="2026-10-09" className="text-xs text-slate-500">9 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">HTTP/3 client cancellations are reported consistently as 499</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare now stops affected HTTP/3 requests sooner when clients cancel them and records those requests as status 499 across all plans. Analytics and logs may therefore show more 499 responses even though client failures have not increased. Growth Inspector needs no code change, but availability metrics should not count client-cancelled 499 responses as server errors.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://developers.cloudflare.com/changelog/post/2026-10-09-http3-499-reporting-improvement/" target="_blank" rel="noreferrer">
            Read Cloudflare’s changelog
          </a>
        </article>
      </section>

      <section aria-labelledby="checks-heading" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
        <h2 id="checks-heading" className="text-lg font-semibold">Other source checks</h2>
        <ul className="mt-3 divide-y divide-slate-200">
          {checks.map((source) => (
            <li key={source.label} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div>
                <p className="text-sm font-medium">{source.label}</p>
                <p className="mt-0.5 text-sm text-slate-600">{source.detail}</p>
              </div>
              <a className="shrink-0 text-sm text-emerald-700 underline underline-offset-4" href={source.href} target="_blank" rel="noreferrer">
                Official source
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
          This is a dated snapshot of verified public information. No guesses or private data are included.
        </p>
      </section>
    </div>
  );
}
