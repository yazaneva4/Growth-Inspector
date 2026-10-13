"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type LiveState = "connecting" | "live" | "reconnecting" | "polling" | "offline";

/** How often we refetch while the realtime socket is not connected. */
const POLL_INTERVAL_MS = 15_000;
/** Coalesce bursts (imports, webhook batches, AI updates) into one refresh. */
const REFRESH_DEBOUNCE_MS = 150;
/** Never refresh more often than this for focus/visibility/online events. */
const FOCUS_REFRESH_MIN_GAP_MS = 1_000;

const LABELS: Record<LiveState, { text: string; hint: string; color: string }> = {
  connecting: { text: "…", hint: "Connecting to live updates…", color: "#64748b" },
  live: { text: "Live", hint: "Live updates connected", color: "#34d399" },
  reconnecting: { text: "Reconnecting", hint: "Live connection lost — reconnecting. Refreshing every 15s meanwhile.", color: "#f59e0b" },
  polling: { text: "Polling", hint: "Live socket unavailable — refreshing every 15s.", color: "#f59e0b" },
  offline: { text: "Offline", hint: "You are offline. Updates resume automatically when you reconnect.", color: "#ef4444" },
};

/**
 * One realtime connection for the whole authenticated dashboard.
 *
 * Mechanics (kept in sync with docs/realtime.md):
 *  1. Subscribes to Postgres Changes on every public table (wildcard), so a
 *     new table is live as soon as it joins the supabase_realtime publication.
 *     Supabase applies RLS before delivery, so the browser never receives
 *     rows the signed-in user cannot read.
 *  2. Any change triggers a debounced `router.refresh()`, re-running the
 *     server components of the current page.
 *  3. On (re)connect we refresh once to close the gap while we were away.
 *  4. When the socket is not connected we poll every 15s (only while the tab
 *     is visible) so the UI is never stuck stale, and we say so in the pill.
 *  5. Returning to the tab (focus / visibility / online) refreshes at once.
 */
export function RealtimeRefresh() {
  const router = useRouter();
  const channelId = useId();
  const [state, setState] = useState<LiveState>("connecting");
  const [pulse, setPulse] = useState(false);
  const [lastEventAt, setLastEventAt] = useState<Date | null>(null);

  const stateRef = useRef<LiveState>("connecting");
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRefreshAt = useRef(0);

  const setLive = useCallback((next: LiveState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const refreshNow = useCallback(() => {
    lastRefreshAt.current = Date.now();
    router.refresh();
  }, [router]);

  // Realtime subscription.
  useEffect(() => {
    const supabase = createClient();

    const onChange = () => {
      setPulse(true);
      setLastEventAt(new Date());
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
      pulseTimer.current = setTimeout(() => setPulse(false), 900);

      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(refreshNow, REFRESH_DEBOUNCE_MS);
    };

    const channel = supabase
      .channel(`dashboard-realtime-${channelId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "*" }, onChange)
      .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        const wasDown = stateRef.current !== "connecting" && stateRef.current !== "live";
        setLive(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "live");
        // Reconcile after (re)connect: closes the gap while we were away.
        if (wasDown || stateRef.current === "live") refreshNow();
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        setLive(navigator.onLine ? "polling" : "offline");
      } else if (status === "CLOSED") {
        setLive(navigator.onLine ? "reconnecting" : "offline");
      }
    });

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
      void supabase.removeChannel(channel);
    };
  }, [channelId, refreshNow, setLive]);

  // Backstop polling while the socket is down, and refetch when the user
  // comes back to the tab or the network returns.
  useEffect(() => {
    const maybeFocusRefresh = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastRefreshAt.current < FOCUS_REFRESH_MIN_GAP_MS) return;
      refreshNow();
    };
    const onOnline = () => {
      if (stateRef.current === "offline") setLive("reconnecting");
      maybeFocusRefresh();
    };
    const onOffline = () => setLive("offline");

    const poll = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (stateRef.current === "live" || stateRef.current === "connecting") return;
      if (!navigator.onLine) return;
      refreshNow();
    }, POLL_INTERVAL_MS);

    document.addEventListener("visibilitychange", maybeFocusRefresh);
    window.addEventListener("focus", maybeFocusRefresh);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", maybeFocusRefresh);
      window.removeEventListener("focus", maybeFocusRefresh);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [refreshNow, setLive]);

  const label = LABELS[state];
  const title = lastEventAt
    ? `${label.hint} Last change received ${lastEventAt.toLocaleTimeString()}.`
    : label.hint;

  return (
    <span
      className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs"
      style={{ color: label.color }}
      title={title}
      data-realtime-state={state}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full transition-colors"
        style={{ background: pulse ? "#86efac" : label.color }}
      />
      <span className="hidden sm:inline">{label.text}</span>
    </span>
  );
}
