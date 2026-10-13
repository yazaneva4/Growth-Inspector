const checks = [
  {
    label: "GrowthSpace and Saudi competitors",
    detail: "No newly verified company announcement or official contact-detail change was found in this check.",
    href: "https://growthspace.sa/",
  },
  {
    label: "Vision 2030 / Human Capability Development",
    detail: "Newly verified: the Riyadh Economic Forum will examine knowledge localization and national workforce capability-building, and SASO will host an AI standards forum on 14 October.",
    href: "https://www.spa.gov.sa/en/N2698506",
  },
  {
    label: "Supabase",
    detail: "The hosted Supabase MCP server is now available at mcp.supabase.com/mcp with browser-based OAuth; the 8 October status-page migration also remains relevant.",
    href: "https://supabase.com/changelog/supabase-mcp-hosted",
  },
  {
    label: "Vercel, GitHub, and Resend",
    detail: "The new GitHub Copilot for JetBrains controls and Vercel storage terms are listed above. No newer material Resend update was verified in this check.",
    href: "https://github.blog/changelog/2026-10-10-new-controls-and-chat-improvements-in-copilot-for-jetbrains/",
  },
];

export default function MarketUpdatesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-sm font-medium text-emerald-700">Verified public sources</p>
        <h1 className="mt-1 text-3xl font-bold">Market updates</h1>
        <p className="mt-2 text-sm text-slate-500">
          Checked 13 October 2026, 5:18 p.m. Riyadh time · No new verified information or official contact-detail change was found in this check.
        </p>
      </header>

      <section aria-labelledby="confirmed-heading" className="space-y-4">
        <h2 id="confirmed-heading" className="text-xl font-semibold">Confirmed update</h2>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · Logpush</span>
            <time dateTime="2026-10-13" className="text-xs text-slate-500">13 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Logpush can transform logs before export</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare Logpush now supports Transformers: SQL queries that filter records, redact sensitive fields, and reshape output before it reaches a destination. Growth Inspector needs no change unless it exports Cloudflare logs; if it does, this can reduce downstream processing and prevent unnecessary fields from leaving Cloudflare.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://blog.cloudflare.com/transformers-on-logpush/" target="_blank" rel="noreferrer">
            Read Cloudflare’s announcement
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Supabase · TLS compatibility</span>
            <time dateTime="2026-10-12" className="text-xs text-slate-500">12 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Legacy TLS 1.2 cipher suites will be removed</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Supabase will stop offering four outdated CBC-mode TLS 1.2 cipher suites on project HTTP APIs from 10 November 2026 at the earliest. Auth, Data API, Storage, Realtime, and Edge Functions are affected; TLS 1.3 and database connections are unchanged. Modern Growth Inspector clients should be unaffected, but any legacy or embedded client should be checked before the deadline.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://supabase.com/changelog/cbc-tls-ciphers-deprecated" target="_blank" rel="noreferrer">
            Read Supabase’s notice
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · Managed WAF</span>
            <time dateTime="2026-10-12" className="text-xs text-slate-500">12 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Managed rules add TanStack XSS and Atlassian file-access detections</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare added blocking detections for CVE-2026-102989, a reflected XSS issue affecting TanStack, and CVE-2026-21589, an arbitrary file-access issue affecting Atlassian products. Growth Inspector needs no application change if it does not use the affected products; Cloudflare Managed Rules users should confirm the new rules are present and monitor for false positives.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://developers.cloudflare.com/changelog/post/2026-10-12-waf-release/" target="_blank" rel="noreferrer">
            Read Cloudflare’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · API Shield</span>
            <time dateTime="2026-10-12" className="text-xs text-slate-500">12 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">API Shield schema learning can now run on demand</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare now lets API Shield users manually start a zone-wide schema-learning run after sending representative test traffic, instead of waiting for the weekly schedule. The dashboard shows zone and operation-level learning status and results. Growth Inspector needs no change unless it uses API Shield schema validation; if it does, this can shorten testing and rollout checks.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://developers.cloudflare.com/changelog/post/2026-10-12-manual-schema-learning/" target="_blank" rel="noreferrer">
            Read Cloudflare’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Saudi Arabia · Workforce and AI standards</span>
            <time dateTime="2026-10-11" className="text-xs text-slate-500">11 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Saudi forums focus on knowledge localization and trusted AI</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The 12th Riyadh Economic Forum, opening 12 October, will review a study on transferring and localizing knowledge among Saudi personnel to strengthen national capabilities and organizational performance. SASO will also host its 10th Standards Forum on 14 October, focused on AI standards, application reliability, performance, privacy, and advanced use cases. These create timely themes for GrowthSpace capability-development and responsible-business-AI content.
          </p>
          <div className="mt-3 flex flex-wrap gap-4">
            <a className="text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://www.spa.gov.sa/en/N2698506" target="_blank" rel="noreferrer">Riyadh Economic Forum notice</a>
            <a className="text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://www.spa.gov.sa/en/N2698608" target="_blank" rel="noreferrer">SASO forum notice</a>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · DNSSEC</span>
            <time dateTime="2026-10-11" className="text-xs text-slate-500">11 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">DNS root key rolls over to KSK-2024</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The DNS root is scheduled to switch its signing key to KSK-2024 today. Cloudflare says websites using Cloudflare DNS, 1.1.1.1, or Gateway DNS require no action because those services already trust the new key. Growth Inspector needs no change unless it operates a separate DNSSEC-validating resolver, which should be checked for the KSK-2024 trust anchor.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://blog.cloudflare.com/root-ksk-2024-rollover/" target="_blank" rel="noreferrer">
            Read Cloudflare’s notice
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">GitHub · Copilot for JetBrains</span>
            <time dateTime="2026-10-10" className="text-xs text-slate-500">10 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">JetBrains Copilot adds MCP startup control and drops IDE 2025.1</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            GitHub added a setting that can disable automatic MCP server startup for Copilot and Claude in JetBrains IDEs, plus enterprise-managed default agent models and faster diagnostic fixes. GitHub also ended support for JetBrains IDE 2025.1, so the plugin now requires version 2025.2 or later. Growth Inspector needs no application-code change; JetBrains users should update their IDE before updating the plugin.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://github.blog/changelog/2026-10-10-new-controls-and-chat-improvements-in-copilot-for-jetbrains/" target="_blank" rel="noreferrer">
            Read GitHub’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Supabase · Agent tooling</span>
            <time dateTime="2026-10-10" className="text-xs text-slate-500">10 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Supabase MCP server moves to a hosted OAuth endpoint</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Supabase now hosts its MCP server at https://mcp.supabase.com/mcp. Compatible clients connect through browser-based OAuth 2, without running the server through npx or supplying a personal access token. This is optional development tooling and does not require a Growth Inspector application change.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://supabase.com/changelog/supabase-mcp-hosted" target="_blank" rel="noreferrer">
            Read Supabase’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · Workers AI</span>
            <time dateTime="2026-10-09" className="text-xs text-slate-500">9 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Clef decision models gain multimodal input, lower pricing, and faster serving</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare released the open-weight Clef-omni decision model for text, images, audio, and video. It also cut hosted Clef-flash input pricing from $0.09 to $0.038 per million tokens while reducing its hosted context window from 64k to 24k, and reported faster hosted Clef inference. These are optional Workers AI capabilities; Growth Inspector needs no change unless it evaluates decision-model routing or classification.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://blog.cloudflare.com/clef-faster-cheaper-multimodal/" target="_blank" rel="noreferrer">
            Read Cloudflare’s announcement
          </a>
        </article>

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
