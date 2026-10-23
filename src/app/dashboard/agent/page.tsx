import Link from "next/link";
import { getCurrentContext } from "@/lib/auth";
import { GrowthAiChat } from "@/components/growth-ai-chat";
import { PulseOrb } from "@/components/pulse-orb";

export const dynamic = "force-dynamic";

export default async function AgentPage() {
  const ctx = await getCurrentContext();
  const signedIn = Boolean(ctx.userId) && !ctx.isDemo;

  return (
    <div className="growth-ai-page max-w-6xl">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <PulseOrb state="ready" size={32} label="Growth AI orb" />
        Growth AI
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        A free AI growth teammate with saved conversations, durable conversation memory,
        workspace tools, and automatic free-model fallback between OpenCode Zen Big Pickle and OpenRouter Free Models Router.
      </p>
      <div className="mt-6">
        {signedIn ? (
          <GrowthAiChat />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center overflow-visible">
              <PulseOrb state="ready" size={44} label="Growth AI orb" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Sign in to use Growth AI</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Growth AI uses your account and workspace to run the free AI routes, save conversations,
              and keep your AI history private. Please sign in before using it.
            </p>
            <Link href="/login" className="mt-6 inline-flex rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600">
              Sign in to GrowthSpace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
