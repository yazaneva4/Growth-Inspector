const sourceChecks = [
  { label: "GrowthSpace and Saudi competitors", detail: "No new verified company update or official contact-detail change was found in this check.", href: "https://growthspace.sa/" },
  { label: "Vision 2030 / Human Capability Development", detail: "New: MCIT and IBM completed a Quantum Technologies Leadership Program for leaders and decision-makers on 5 October 2026. The Middle East Education and Training Exhibition and earlier workforce-AI announcements remain listed below.", href: "https://www.spa.gov.sa/en/N2693852" },
  { label: "Supabase", detail: "Newly verified compatibility note: realtime-js 2.15.1 and supabase-js 2.55.0 require Node.js versions below 22 to supply the ws transport. Scoped PATs and other recent changes remain listed below.", href: "https://supabase.com/changelog/37869-change-in-realtime-js-affecting-node-js-22" },
  { label: "Vercel", detail: "New: AI Gateway supports OpenAI’s Decisions API through an OpenAI-compatible endpoint. Confidence-based fallbacks, Node.js 20 deprecation, and earlier changes remain listed below.", href: "https://vercel.com/changelog/openai-decisions-api-now-available-on-ai-gateway" },
  { label: "GitHub", detail: "New: Copilot local sandboxing is generally available, and GitHub introduced a context-aware leaked-secret detector. Stacked pull requests and earlier security updates remain listed below.", href: "https://github.blog/changelog/2026-10-07-local-sandboxing-for-github-copilot-now-generally-available/" },
  { label: "Cloudflare", detail: "New: Log Explorer datasets moved into Observability Logs with saved queries and enabled datasets preserved. The AI Gateway credential-response change and earlier updates remain listed below.", href: "https://developers.cloudflare.com/changelog/post/2026-10-07-log-search-in-observability-logs/" },
  { label: "Resend", detail: "New: Resend released an Account Usage API on 1 October 2026. GET /usage returns current account usage and plan limits across email, contacts, segments, broadcasts, domains, AI credits, automation runs, and API rate limits.", href: "https://resend.com/changelog/account-usage-api" },
];

export default function MarketUpdatesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-sm font-medium text-emerald-700">Verified public sources</p>
        <h1 className="mt-1 text-3xl font-bold">Market updates</h1>
        <p className="mt-2 text-sm text-slate-500">
          Checked 8 October 2026, 2:49 p.m. Riyadh time · One additional Supabase compatibility requirement was verified; no newer verified update was found in the other monitored categories. Facts below are attributed to their publishers.
        </p>
      </header>

      <section aria-labelledby="confirmed-heading" className="space-y-4">
        <h2 id="confirmed-heading" className="text-xl font-semibold">Confirmed updates</h2>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Supabase · Runtime compatibility</span>
            <time dateTime="2025-08-12" className="text-xs text-slate-500">12 August 2025 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Realtime clients require an explicit transport on Node.js below 22</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Supabase says realtime-js 2.15.1 and supabase-js 2.55.0 require Node.js versions below 22 to install ws and pass it through realtime.transport. Browser clients and Node.js 22 or newer require no change. Growth Inspector should verify its runtime version before upgrading these packages; this check does not establish which Node.js version its deployed environment uses.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://supabase.com/changelog/37869-change-in-realtime-js-affecting-node-js-22" target="_blank" rel="noreferrer">
            Read Supabase’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">Vercel · AI Gateway</span>
            <time dateTime="2026-10-07" className="text-xs text-slate-500">7 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">OpenAI Decisions API becomes available through AI Gateway</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Vercel AI Gateway now exposes an OpenAI-compatible /v1/decisions endpoint for GPT-6 Luna Decisions and other decision models. These models return typed probabilities, choices, and scores for routing, triage, guardrails, or rubric scoring rather than generated prose. JavaScript use requires OpenAI SDK 7.30.0 or later, Python requires 3.26.0 or later, and AI SDK experimental_decide requires ai 7.0.128 or later. This is optional; Growth Inspector needs no immediate change unless it adopts decision models.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://vercel.com/changelog/openai-decisions-api-now-available-on-ai-gateway" target="_blank" rel="noreferrer">
            Read Vercel’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">GitHub · Agent security</span>
            <time dateTime="2026-10-07" className="text-xs text-slate-500">7 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Copilot local sandboxing reaches general availability</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            GitHub Copilot CLI, the Copilot app, and VS Code Agent Host sessions can now restrict agent-run commands’ access to files, networks, Git credentials, GitHub CLI credentials, local MCP servers, and other system capabilities. The sandbox uses native controls across Windows, macOS, and Linux and is included with Copilot at no extra cost. This can protect local Growth Inspector development sessions but does not change the deployed application.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://github.blog/changelog/2026-10-07-local-sandboxing-for-github-copilot-now-generally-available/" target="_blank" rel="noreferrer">
            Read GitHub’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">GitHub · Secret protection</span>
            <time dateTime="2026-10-07" className="text-xs text-slate-500">7 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Context-aware model expands leaked-secret detection</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            GitHub introduced a fine-tuned model that reads surrounding code to identify likely credentials, including passwords without a recognizable token format. Existing AI-detected Password alert customers were upgraded automatically at no extra charge under GitHub Secret Protection or Advanced Security. AI checks for push protection are in private preview, and checks for Copilot’s /security-review command are planned for private preview; those opt-in checks will consume GitHub AI Credits. Growth Inspector should keep existing secret alerts enabled, but no credit-consuming preview should be enabled without explicit approval.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://github.blog/changelog/2026-10-07-purpose-built-model-for-leaked-secret-detection/" target="_blank" rel="noreferrer">
            Read GitHub’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · Observability</span>
            <time dateTime="2026-10-07" className="text-xs text-slate-500">7 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Log Explorer datasets move into Observability Logs</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare now queries Log Explorer datasets from the Logs page under Observability, alongside Workers Observability datasets with a shared filter builder, SQL editor, and visualizations. Enabled datasets, saved queries, and SQL queries continue to work, while dataset configuration now sits behind the Logs page’s dataset selector. This is a dashboard navigation change and requires no Growth Inspector code update.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://developers.cloudflare.com/changelog/post/2026-10-07-log-search-in-observability-logs/" target="_blank" rel="noreferrer">
            Read Cloudflare’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · AI Gateway</span>
            <time dateTime="2026-10-06" className="text-xs text-slate-500">6 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Provider-credential errors now use standardized responses</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare AI Gateway’s POST /ai/run endpoint now returns HTTP 401 with error code 2009 when a provider rejects supplied credentials, including for ElevenLabs, Google Vertex, and other providers. Rejected credentials under Unified Billing return HTTP 503. Growth Inspector should update its error handling only if it calls this endpoint and currently treats the former 402, 403, 500, or provider-specific responses as credential failures.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://developers.cloudflare.com/changelog/post/2026-10-05-provider-credential-errors/" target="_blank" rel="noreferrer">
            Read Cloudflare’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">Vercel · AI Gateway</span>
            <time dateTime="2026-10-06" className="text-xs text-slate-500">6 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Confidence-based decision fallbacks enter beta</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Vercel AI Gateway can now run a fallback model when a decision response meets a configured uncertainty condition. Conditions can use Choice or Score confidence thresholds, Boolean probability ranges, and multiple combined signals. A triggered fallback runs a second billed decision, while requests without the conditional configuration keep their existing behavior. Growth Inspector needs no immediate change unless it uses AI Gateway decisions.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://vercel.com/changelog/confidence-based-decision-fallbacks" target="_blank" rel="noreferrer">
            Read Vercel’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">GitHub · Pull requests</span>
            <time dateTime="2026-10-06" className="text-xs text-slate-500">6 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Stacked pull requests reach general availability</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            GitHub made stacked pull requests generally available on all GitHub.com plans. The release preserves approvals and commit signatures during supported rebases, keeps stacks together in merge queues, adds stack navigation and webhook support, and is rolling out auto-merge for stacks over the next few weeks. This can help split large Growth Inspector changes into independently reviewable pull requests; adoption is optional.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://github.blog/changelog/2026-10-06-stacked-pull-requests-generally-available/" target="_blank" rel="noreferrer">
            Read GitHub’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Supabase · Credential security</span>
            <time dateTime="2026-10-06" className="text-xs text-slate-500">6 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Scoped personal access tokens reach general availability</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Supabase personal access tokens can now be restricted to selected projects or organizations, granted read or read-write permission per capability, and given an expiry of up to one year. They work with the Management API, MCP server, and CLI. Growth Inspector integrations should replace broad account-level tokens with the narrowest scoped token that meets each integration’s needs.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://supabase.com/changelog/scoped-personal-access-tokens-ga" target="_blank" rel="noreferrer">
            Read Supabase’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Supabase · Access control</span>
            <time dateTime="2026-10-05" className="text-xs text-slate-500">5 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Organization invites now support the No access role</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Supabase Team and Enterprise administrators can invite organization members with no initial project visibility and later grant access project by project. Existing members can also be switched to No access. This provides a safer least-privilege starting point for contractors or limited-scope collaborators; it does not affect self-hosted Supabase.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://supabase.com/changelog/no-access-org-role" target="_blank" rel="noreferrer">
            Read Supabase’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">GitHub · Security coverage</span>
            <time dateTime="2026-10-06" className="text-xs text-slate-500">6 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Security Overview shows AI Scan enablement by repository</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            GitHub organization and enterprise administrators can now see enabled and not-enabled repository counts for AI Scan for pull requests, inspect each repository’s effective status, filter the coverage view, and export the status in CSV. This improves security-adoption auditing; Growth Inspector needs no code change.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://github.blog/changelog/2026-10-06-code-scanning-ai-scan-enablement-status-in-security-overview/" target="_blank" rel="noreferrer">
            Read GitHub’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">Saudi Arabia · Executive technology capability</span>
            <time dateTime="2026-10-05" className="text-xs text-slate-500">5 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">MCIT and IBM complete quantum-technologies leadership program</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Saudi Arabia’s Ministry of Communications and Information Technology, in partnership with IBM, completed a Zurich-based program for leaders and decision-makers covering quantum computing, communications, sensing, opportunity and risk assessment, policy readiness, practical simulations, and international case studies. This confirms demand for advanced executive technology capability development; it is not evidence of a direct GrowthSpace competitor launch.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://www.spa.gov.sa/en/N2693852" target="_blank" rel="noreferrer">
            Read the Saudi Press Agency report
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">GitHub · Secret scanning</span>
            <time dateTime="2026-10-05" className="text-xs text-slate-500">5 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Secret scanning adds Supabase token detectors</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            GitHub secret scanning now detects Supabase OAuth access tokens and scoped personal access tokens in repositories. These are user-secret detectors, so findings generate secret-scanning alerts in public or private repositories. This improves credential-leak detection for Growth Inspector; any alert should still trigger immediate token revocation or rotation.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://github.blog/changelog/2026-10-05-secret-scanning-adds-detectors-for-lovable-supabase-and-more/" target="_blank" rel="noreferrer">
            Read GitHub’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Supabase · Deprecation</span>
            <time dateTime="2026-10-05" className="text-xs text-slate-500">5 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Framework adapters in @supabase/server deprecated</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Supabase deprecated the Hono, H3, Elysia, and NestJS adapters bundled with @supabase/server and says they will be removed on 1 December 2026. Supabase recommends moving to the copyable framework bridges in its guide; withSupabase and the middleware entry points are not deprecated. Growth Inspector should check whether it imports any affected adapter before upgrading that package.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://supabase.com/changelog" target="_blank" rel="noreferrer">
            Read Supabase’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">Saudi Arabia · Education and training</span>
            <time dateTime="2026-10-05" className="text-xs text-slate-500">5–7 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Middle East Education and Training Exhibition opens in Jeddah</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The Saudi Press Agency reports that MEETES brings together education and training providers through 7 October. Its program focuses on the future of education, including AI-enabled learning tools, teacher support, and alignment with labor-market needs under Vision 2030. This is a relevant market event, not evidence of a direct GrowthSpace competitor launch.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://www.spa.gov.sa/en/N2693651" target="_blank" rel="noreferrer">
            Read the Saudi Press Agency report
          </a>
        </article>

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
