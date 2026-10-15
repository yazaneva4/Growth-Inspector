// Run with: npm test   (node --test, no framework)
import test from "node:test";
import assert from "node:assert/strict";
import { historyForModel, mergeUnsaved, RefreshGate, UNSAVED_MATCH_WINDOW_MS } from "../src/lib/growth-ai-chat-state.ts";
import { recentHistory } from "../src/lib/ai/history.ts";

const msg = (role, content, extra = {}) => ({ id: content + role, role, content, createdAt: 1_000_000, ...extra });

test("historyForModel excludes failed/pending turns so the new goal is never duplicated", () => {
  const out = historyForModel([msg("user", "q1"), msg("assistant", "a1"), msg("user", "lost", { status: "failed" }), msg("user", "now", { status: "pending" })]);
  assert.deepEqual(out.map((m) => m.content), ["q1", "a1"]);
});

test("historyForModel respects the character budget but always keeps the newest turn", () => {
  const big = "x".repeat(20000);
  const out = historyForModel([msg("user", big), msg("assistant", big), msg("user", "short")], 64, 30000);
  assert.deepEqual(out.map((m) => m.content), [big, "short"]); // second big message would exceed 30000
});

test("recentHistory never starts on an assistant turn", () => {
  const turns = Array.from({ length: 17 }, (_, i) => ({ role: i % 2 === 0 ? "user" : "assistant", content: String(i) }));
  const out = recentHistory(turns);
  assert.equal(out[0].role, "user");
  assert.equal(out.length, 15);
  assert.deepEqual(recentHistory([{ role: "assistant", content: "x" }]), []);
});

test("mergeUnsaved keeps an unsaved answer that never reached the server", () => {
  const server = [msg("user", "q")];
  const local = [msg("user", "q"), msg("assistant", "answer", { status: "unsaved" })];
  const merged = mergeUnsaved(server, local);
  assert.equal(merged.length, 2);
  assert.equal(merged[1].status, "unsaved");
});

test("mergeUnsaved drops the local copy after an ambiguous save failure (server has it)", () => {
  const local = [msg("assistant", "answer", { status: "unsaved", createdAt: 2_000_000 })];
  const server = [msg("user", "q"), msg("assistant", "answer", { createdAt: 2_000_500 })];
  assert.equal(mergeUnsaved(server, local).length, 2);
});

test("mergeUnsaved still shows an unsaved answer when only an OLD identical answer exists", () => {
  const local = [msg("assistant", "OK", { status: "unsaved", createdAt: 9_000_000 })];
  const server = [msg("assistant", "OK", { createdAt: 9_000_000 - UNSAVED_MATCH_WINDOW_MS - 1 })];
  assert.equal(mergeUnsaved(server, local).length, 2);
});

test("RefreshGate: a refresh started before send() cannot apply after send begins", () => {
  const gate = new RefreshGate();
  const inFlight = gate.begin();
  gate.startSend();
  assert.equal(gate.canApply(inFlight), false);
});

test("RefreshGate: only the explicit post-send refresh may apply while busy", () => {
  const gate = new RefreshGate();
  gate.startSend();
  const duringSend = gate.begin(); // e.g. rename/archive/realtime triggered mid-send
  assert.equal(gate.canApply(duringSend), false);
  const postSend = gate.begin();
  assert.equal(gate.canApply(postSend, true), true);
  assert.equal(gate.canApply(duringSend, true), false, "older refresh stays void even when allowed");
  gate.endSend();
  assert.equal(gate.canApply(gate.begin()), true);
});

test("RefreshGate: createChat/rename invalidate older in-flight refreshes", () => {
  const gate = new RefreshGate();
  const stale = gate.begin();
  gate.invalidate(); // create/rename/delete API call completed
  assert.equal(gate.canApply(stale), false);
  assert.equal(gate.canApply(gate.begin()), true);
});

test("RefreshGate: only the newest of overlapping refreshes applies", () => {
  const gate = new RefreshGate();
  const first = gate.begin();
  const second = gate.begin();
  assert.equal(gate.canApply(first), false);
  assert.equal(gate.canApply(second), true);
});

test("RefreshGate: a manual selection cancels an older automatic select-first", () => {
  const gate = new RefreshGate();
  const tabSwitchRefresh = gate.begin();
  gate.noteManualSelection(); // user clicked a chat while it was loading
  assert.equal(gate.mayAutoSelect(tabSwitchRefresh), false);
  assert.equal(gate.mayAutoSelect(gate.begin()), true);
});
