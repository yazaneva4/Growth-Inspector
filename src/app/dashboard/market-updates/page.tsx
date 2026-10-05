const sourceChecks = [
  { label: "GrowthSpace and Saudi competitors", detail: "No new verified company update or official contact-detail change was found in this check.", href: "https://growthspace.sa/" },
  { label: "Vision 2030 / Human Capability Development", detail: "New: Saudi MHRSD and MCIT, with Microsoft and Gulf Intelligence, announced an AI Center of Excellence initiative on 28 September 2026. SDAIA also announced that its Data and AI Training Program Standards Framework has begun being applied with TVTC (23 September 2026). HCI 2027 is listed below.", href: "https://www.hrsd.gov.sa/en/media-center/news/%D9%85%D8%B1%D9%83%D8%B2-%D8%A7%D9%84%D8%AA%D9%85%D9%8A%D9%91%D8%B2-%D9%84%D9%84%D8%B0%D9%83%D8%A7%D8%A1-%D8%A7%D9%84%D8%A7%D8%B5%D8%B7%D9%86%D8%A7%D8%B9%D9%8A" },
  { label: "Supabase", detail: "New: OrioleDB entered Public Beta on paid plans on 1 October 2026. Supabase says it is for testing, has no SLA, and is not recommended for production. The previously noted @supabase/middleware 1.0 release is listed below.", href: "https://supabase.com/changelog/orioledb-public-beta" },
  { label: "GitHub", detail: "New: On 2 October 2026, GitHub added read-only SecurityAdvisory GraphQL fields and filters, and released repository security advisory comments REST endpoints in public preview. Existing integrations remain compatible.", href: "https://github.blog/changelog/2026-10-02-new-fields-for-securityadvisory-graphql-api/" },
  { label: "Cloudflare", detail: "Newly verified: Web Search API entered beta and AI Search became generally available on 2 October 2026. The previously noted Account Abuse Protection and unified observability updates are also listed below.", href: "https://developers.cloudflare.com/changelog/product-group/developer-platform/" },
  { label: "Resend", detail: "New: Resend released an Account Usage API on 1 October 2026. GET /usage returns current account usage and plan limits across email, contacts, segments, broadcasts, domains, AI credits, automation runs, and API rate limits.", href: "https://resend.com/changelog/account-usage-api" },
];

export default function MarketUpdatesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-sm font-medium text-emerald-700">Verified public sources</p>
        <h1 className="mt-1 text-3xl font-bold">Market updates</h1>
        <p className="mt-2 text-sm text-slate-500">
          Checked 5 October 2026, 6:07 a.m. Riyadh time · Newly verified: Cloudflare Web Search API beta and AI Search general availability, both published 2 October 2026. Facts below are attributed to their publishers.
        </p>
      </header>

      <section aria-labelledby="confirmed-heading" className="space-y-4">
        <h2 id="confirmed-heading" className="text-xl font-semibold">Confirmed updates</h2>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · AI search</span>
            <time dateTime="2026-10-02" className="text-xs text-slate-500">2 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Web Search API enters beta and AI Search becomes generally available</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare’s new Web Search API lets applications retrieve live web results through AI Gateway using Ceramic.ai, Exa, or Linkup; requests support Zero Data Retention and use provider list pricing without a Cloudflare markup. Cloudflare also made AI Search generally available with hybrid retrieval enabled by default and usage-based billing beginning 1 November 2026. These are optional capabilities; Growth Inspector needs no immediate code change.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://developers.cloudflare.com/changelog/product-group/developer-platform/" target="_blank" rel="noreferrer">
            Read Cloudflare’s developer-platform changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Supabase · Database preview</span>
            <time dateTime="2026-10-01" className="text-xs text-slate-500">1 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">OrioleDB enters Public Beta on paid plans</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Supabase now allows new OrioleDB projects on Free, Pro, Team, and Enterprise organizations, with standard Postgres project billing and support for resizing, read replicas, scheduled backups, and other paid features. Supabase says the Public Beta has no SLA and is not recommended for production; it also lacks point-in-time recovery and some restore and extension capabilities. Growth Inspector should not migrate its production database, though a separate test project could evaluate the storage engine later.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://supabase.com/changelog/orioledb-public-beta" target="_blank" rel="noreferrer">
            Read Supabase’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · Account security</span>
            <time dateTime="2026-10-02" className="text-xs text-slate-500">2 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Account Abuse Protection investigation dashboard enters Early Access</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare introduced a dashboard that summarizes login and signup behavior around privacy-preserving, per-domain hashed user IDs. Investigators can filter suspicious patterns, inspect account histories, and use a hashed ID in a WAF rule to challenge or block later requests. The dashboard is currently limited to Account Abuse Protection Early Access customers, with access offered to Bot Management Enterprise customers; Growth Inspector needs no immediate change.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://blog.cloudflare.com/account-abuse-protection-dashboard/" target="_blank" rel="noreferrer">
            Read Cloudflare’s announcement
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · Observability</span>
            <time dateTime="2026-10-02" className="text-xs text-slate-500">2 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Unified observability platform announced</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare announced combined logs, end-to-end tracing, a unified SQL API, custom alerts, 30-day domain analytics, custom dashboards, and Logpush for self-serve plans. Unified pricing for ingested and stored logs and traces begins 1 December 2026. Growth Inspector needs no immediate code change, but Cloudflare usage and retention costs should be reviewed before that date if these features are enabled.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://blog.cloudflare.com/one-observability-platform/" target="_blank" rel="noreferrer">
            Read Cloudflare’s announcement
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">GitHub · Security APIs</span>
            <time dateTime="2026-10-02" className="text-xs text-slate-500">2 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Security advisory APIs expanded</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            GitHub added five read-only SecurityAdvisory GraphQL fields plus severity and withdrawal filters. It also released REST endpoints for reading, adding, and editing repository security advisory comments in public preview. The additions are backward compatible; no Growth Inspector change is required unless advisory triage is automated.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            <a className="text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://github.blog/changelog/2026-10-02-new-fields-for-securityadvisory-graphql-api/" target="_blank" rel="noreferrer">
              GraphQL update
            </a>
            <a className="text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://github.blog/changelog/2026-10-02-repository-security-advisory-comments-api-in-public-preview/" target="_blank" rel="noreferrer">
              Comments API preview
            </a>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">Resend · Product update</span>
            <time dateTime="2026-10-01" className="text-xs text-slate-500">1 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Account Usage API released</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Resend’s new GET /usage endpoint returns current usage and plan limits for email, contacts, segments, broadcasts, domains, AI credits, automation runs, and API rate limits. Growth Inspector could use it for quota alerts or pre-send throttling, but no immediate code change is required.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://resend.com/changelog/account-usage-api" target="_blank" rel="noreferrer">
            Read Resend’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">GitHub · Interface update</span>
            <time dateTime="2026-10-01" className="text-xs text-slate-500">1 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Redesigned GitHub dashboard is now the default</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            GitHub’s default dashboard now brings active agent sessions, issues, and pull requests together, with a separate Feed tab for updates. This changes repository navigation only; no Growth Inspector code action is indicated.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://github.blog/changelog/2026-10-01-new-dashboard-experience-now-the-default/" target="_blank" rel="noreferrer">
            Read GitHub’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">Vercel · Runtime deprecation</span>
            <time dateTime="2026-10-01" className="text-xs text-slate-500">Effective 1 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Node.js 20 disabled for new Builds and Functions</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Vercel says Node.js 20 is now disabled in Project Settings and new deployments configured for it will fail. Existing deployments continue to run. Growth Inspector’s package.json does not pin a Node.js engine, so its Vercel project runtime setting should be checked before the next deployment.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://vercel.com/changelog/node-js-20-is-being-deprecated" target="_blank" rel="noreferrer">
            Read Vercel’s deprecation notice
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">GitHub · Actions retention</span>
            <time dateTime="2026-10-01" className="text-xs text-slate-500">Effective 1 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Actions retention now covers checks, runs, and statuses</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            GitHub says checks, workflow runs, and statuses now follow the same Actions retention setting as artifacts and logs. Public repositories can retain them for at most 90 days. No change is needed unless Growth Inspector requires longer CI history.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://github.blog/changelog/2026-08-27-actions-retention-will-cover-checks-workflow-runs-and-statuses/" target="_blank" rel="noreferrer">
            Read GitHub’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">Vercel · CDN behavior</span>
            <time dateTime="2026-09-30" className="text-xs text-slate-500">30 September 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Responses varying by Cookie are no longer cached</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Vercel CDN no longer caches origin responses whose Vary header includes Cookie. This protects personalized responses from shared caching but can reduce cache hits if a route varies by Cookie unnecessarily.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://vercel.com/changelog/vary-cookie-responses-no-longer-cached" target="_blank" rel="noreferrer">
            Read Vercel’s CDN update
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Supabase · Product update</span>
            <time dateTime="2026-09-30" className="text-xs text-slate-500">30 September 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Supabase Middleware 1.0 released</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Supabase released @supabase/middleware 1.0, an MIT-licensed Fetch-compatible engine for typed per-request middleware pipelines. Supabase says it runs across Edge Functions, Vercel Functions, Cloudflare Workers, Deno, Bun, and Node.js 22 or newer. This is optional infrastructure; no immediate Growth Inspector migration is indicated.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://supabase.com/changelog" target="_blank" rel="noreferrer">
            Read Supabase’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">Vercel · Product update</span>
            <time dateTime="2026-09-25" className="text-xs text-slate-500">25 September 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Sandbox memory observability</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Vercel says Sandbox memory-usage data is available in its dashboard and CLI. The feature concerns Vercel Sandbox workloads; this check does not indicate a Growth Inspector code change is needed.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://vercel.com/changelog/vercel-sandbox-now-supports-memory-observability" target="_blank" rel="noreferrer">
            Read Vercel’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">Saudi Arabia · Human capability</span>
            <time dateTime="2027-04-12" className="text-xs text-slate-500">12–13 April 2027</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Human Capability Initiative 2027</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The official HCI site lists the conference in Riyadh at King Abdulaziz International Conference Center under the theme “The Human Code,” with focus areas including skills, education, AI, technology, and the future of work.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://humancapabilityinitiative.org/en" target="_blank" rel="noreferrer">
            Read the official HCI announcement
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Saudi Arabia · Workforce AI</span>
            <time dateTime="2026-09-28" className="text-xs text-slate-500">28 September 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">AI Center of Excellence initiative announced</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Saudi Arabia’s Ministry of Human Resources and Social Development and Ministry of Communications and Information Technology, with Microsoft and Gulf Intelligence, announced an initiative to accelerate AI adoption in the workforce and develop future skills. This is a workforce capability announcement; no direct Growth Inspector code action is indicated.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://www.hrsd.gov.sa/en/media-center/news/%D9%85%D8%B1%D9%83%D8%B2-%D8%A7%D9%84%D8%AA%D9%85%D9%8A%D9%91%D8%B2-%D9%84%D9%84%D8%B0%D9%83%D8%A7%D8%A1-%D8%A7%D9%84%D8%A7%D8%B5%D8%B7%D9%86%D8%A7%D8%B9%D9%8A" target="_blank" rel="noreferrer">
            Read MHRSD’s announcement
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Saudi Arabia · Data and AI training</span>
            <time dateTime="2026-09-23" className="text-xs text-slate-500">23 September 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Data and AI training standards framework begins application</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The Saudi Data and AI Authority (SDAIA), with the Technical and Vocational Training Corporation (TVTC), says it has begun applying a standards framework to specialized Data and AI training programs.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://www.spa.gov.sa/en/N2683524" target="_blank" rel="noreferrer">
            Read the Saudi Press Agency report
          </a>
        </article>
      </section>

      <section aria-labelledby="checks-heading" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
        <h2 id="checks-heading" className="text-lg font-semibold">Other source checks</h2>
        <ul className="mt-3 divide-y divide-slate-200">
          {sourceChecks.map((source) => (
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
          This is a dated snapshot of verified public information, not a live feed. No guesses or private data are included.
        </p>
      </section>
    </div>
  );
}
