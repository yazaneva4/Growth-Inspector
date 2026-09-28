const sourceChecks = [
  { label: "GrowthSpace and Saudi competitors", detail: "No new verified item in this check. Official company contact-detail changes were not verified.", href: "https://growthspace.sa/" },
  { label: "Vision 2030 / Human Capability Development", detail: "HCI 2027 is confirmed below. No other new official announcement was verified.", href: "https://www.vision2030.gov.sa/en/explore/programs/human-capability-development-program" },
  { label: "Supabase", detail: "No new relevant product change verified in this check.", href: "https://supabase.com/changelog" },
  { label: "GitHub", detail: "No new relevant product change verified in this check.", href: "https://github.blog/changelog/" },
  { label: "Cloudflare", detail: "No new relevant product change verified in this check.", href: "https://blog.cloudflare.com/" },
  { label: "Resend", detail: "No new relevant product change verified in this check.", href: "https://resend.com/changelog" },
];

export default function MarketUpdatesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-sm font-medium text-emerald-700">Verified public sources</p>
        <h1 className="mt-1 text-3xl font-bold">Market updates</h1>
        <p className="mt-2 text-sm text-slate-500">
          Checked 28 September 2026, 9:08 p.m. Riyadh time · Facts below are attributed to their publishers.
        </p>
      </header>

      <section aria-labelledby="confirmed-heading" className="space-y-4">
        <h2 id="confirmed-heading" className="text-xl font-semibold">Confirmed updates</h2>
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
