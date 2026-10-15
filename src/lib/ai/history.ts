// Pure helpers shared by the Growth AI client and server. Keep this file free
// of imports so it can be unit-tested with plain `node --test`.

export type HistoryMessage = { role: "user" | "assistant"; content: string };

/** Last `limit` turns, never starting on an assistant turn (Anthropic/z.ai reject that). */
export function recentHistory<T extends { role: string }>(history: T[], limit = 16): T[] {
  const recent = history.slice(-limit);
  while (recent.length && recent[0].role !== "user") recent.shift();
  return recent;
}
