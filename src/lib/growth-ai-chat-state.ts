// Pure state helpers for the Growth AI chat. No imports on purpose: this file
// is covered by `npm test` (node --test, no framework).

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  status?: "pending" | "failed" | "unsaved";
};

/** How long after a local answer a saved copy still counts as "the same answer". */
export const UNSAVED_MATCH_WINDOW_MS = 5 * 60_000;

/**
 * History sent to the model: earlier, successfully exchanged turns only. The
 * message being sent travels separately as `goal`, so it must not appear here
 * (the model would see it twice), and failed/pending turns are skipped.
 */
export function historyForModel(messages: ChatMessage[], maxMessages = 64, maxChars = 30000) {
  const eligible = messages.filter((m) => m.status !== "failed" && m.status !== "pending");
  const result: Array<{ role: "user" | "assistant"; content: string }> = [];
  let chars = 0;
  for (let i = eligible.length - 1; i >= 0 && result.length < maxMessages; i--) {
    const content = typeof eligible[i].content === "string" ? eligible[i].content : "";
    const size = content.length + 40;
    if (result.length && chars + size > maxChars) break;
    result.unshift({ role: eligible[i].role, content });
    chars += size;
  }
  return result;
}

/**
 * Re-attach answers that were generated but could not be saved. If the save
 * actually reached the server (an ambiguous failure, e.g. the response was
 * lost), the saved copy is already in `server`, so the local one is dropped
 * instead of being shown twice.
 */
export function mergeUnsaved<M extends ChatMessage>(server: M[], local: M[]): M[] {
  const kept = local.filter(
    (m) =>
      m.status === "unsaved" &&
      !server.some((s) => s.role === m.role && s.content === m.content && s.createdAt >= m.createdAt - UNSAVED_MATCH_WINDOW_MS),
  );
  return kept.length ? [...server, ...kept] : server;
}

/**
 * Decides whether an async conversation refresh may apply its result.
 *  - every refresh takes a token; only the newest token may apply;
 *  - `invalidate()` (send start, create, rename, ...) voids refreshes that
 *    started earlier, because their data may predate the change;
 *  - while a message is in flight nothing applies except the explicit
 *    post-send refresh (`allowWhileBusy`);
 *  - a manual selection voids an automatic "select first" from an older refresh.
 */
export class RefreshGate {
  private seq = 0;
  private selection = 0;
  busy = false;

  begin() {
    return { seq: ++this.seq, selection: this.selection };
  }
  invalidate() {
    this.seq++;
  }
  noteManualSelection() {
    this.selection++;
  }
  startSend() {
    this.busy = true;
    this.invalidate();
  }
  endSend() {
    this.busy = false;
  }
  canApply(token: { seq: number }, allowWhileBusy = false) {
    return token.seq === this.seq && (allowWhileBusy || !this.busy);
  }
  mayAutoSelect(token: { selection: number }) {
    return token.selection === this.selection;
  }
}
