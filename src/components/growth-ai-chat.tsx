"use client";

import { FormEvent, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GrowthAiIcon } from "@/components/growth-ai-icon";
import { PulseOrb } from "@/components/pulse-orb";
import { LogoMark } from "@/components/logo";
import { historyForModel, mergeUnsaved, RefreshGate } from "@/lib/growth-ai-chat-state";

type Message = { id: string; role: "user" | "assistant"; content: string; provider?: string; model?: string; createdAt: number; status?: "pending" | "failed" | "unsaved" };
type Conversation = { id: string; title: string; messages: Message[]; archived: boolean; updatedAt: number };
type ApiConversation = { id: string; title: string; archived: boolean; updated_at: string; ai_operator_messages?: Array<{ id: string; role: "user" | "assistant"; content: string; provider?: string | null; model?: string | null; created_at: string }> };
type BrowserAction = "inspect" | "screenshot" | "click" | "fill" | "press" | "select";
type BrowserStep = { id: string; action: "click" | "fill" | "press" | "select"; selector: string; value: string };
type BrowserElement = { tag: string; selector: string; text: string; type?: string; placeholder?: string; href?: string; disabled?: boolean };
type BrowserResult = { ok: true; action: string; url: string; title: string; text: string; elements: BrowserElement[]; screenshot?: string; controlsEnabled: boolean; hostScoped: true };

type RefreshOptions = { selectFirst?: boolean; allowWhileBusy?: boolean };
function makeId() { return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function titleFrom(text: string) { const value = text.replace(/\s+/g, " ").trim(); return value.length > 60 ? `${value.slice(0, 60)}…` : value || "New conversation"; }
function fromApi(value: ApiConversation): Conversation { return { id: value.id, title: value.title || "New conversation", archived: value.archived, updatedAt: Date.parse(value.updated_at) || Date.now(), messages: (value.ai_operator_messages ?? []).sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)).map((m) => ({ id: m.id, role: m.role, content: typeof m.content === "string" ? m.content : "", provider: m.provider ?? undefined, model: m.model ?? undefined, createdAt: Date.parse(m.created_at) || Date.now() })) }; }
function requestsBrowserAction(value: string): boolean {
  const text = value.toLowerCase();
  const direct = /\b(click|fill|type|enter|submit|press|select|choose|toggle|upload|navigate|scroll|open)\b/i.test(text);
  const checkbox = /\b(check|uncheck)\b.{0,40}\b(box|checkbox|option)\b/i.test(text);
  const recordAction = /\b(create|add|update|edit|delete|remove|save|restore|archive|change|set)\b.{0,80}\b(client|contact|invoice|lead|competitor|quote|product|task|job|customer|setting|record|form|field|status|member|team|dashboard|website|CRM)\b/i.test(text);
  const websiteScope = /\b(on|in|through|using|from)\s+(?:the\s+)?(?:website|webpage|page|dashboard|GrowthSpace|CRM)\b/i.test(text)
    && /\b(create|add|update|edit|delete|remove|save|restore|archive|change|set|send|click|fill|submit)\b/i.test(text);
  return direct || checkbox || recordAction || websiteScope;
}

function parseBrowserPlan(answer: string, elements: BrowserElement[]): BrowserStep[] {
  const start = answer.indexOf("{");
  const end = answer.lastIndexOf("}");
  if (start < 0 || end <= start) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(answer.slice(start, end + 1));
  } catch {
    return [];
  }
  if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as { steps?: unknown }).steps)) return [];

  const rawSteps = (parsed as { steps: unknown[] }).steps;
  if (rawSteps.length === 0 || rawSteps.length > 8) return [];
  const valid: BrowserStep[] = [];

  for (const raw of rawSteps) {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as { action?: unknown; selector?: unknown; value?: unknown };
    const action = item.action;
    const selector = typeof item.selector === "string" ? item.selector : "";
    const value = typeof item.value === "string" ? item.value.slice(0, 4000) : "";
    if (!["click", "fill", "press", "select"].includes(String(action)) || !selector) return [];

    const element = elements.find((candidate) => candidate.selector === selector);
    if (!element || element.disabled) return [];
    if (action === "fill" && !["input", "textarea"].includes(element.tag)) return [];
    if (action === "select" && element.tag !== "select") return [];
    if (action === "press" && !["input", "textarea", "button", "a"].includes(element.tag)) return [];

    valid.push({
      id: `${Date.now()}-${valid.length}-${Math.random().toString(36).slice(2)}`,
      action: action as BrowserStep["action"],
      selector,
      value,
    });
  }

  return valid;
}

function splitCitations(content: string) {
  const marker = "\n\nSources:\n";
  const start = content.lastIndexOf(marker);
  if (start < 0) return { answer: content, sources: [] as Array<{ title: string; url: string }> };
  const sources: Array<{ title: string; url: string }> = [];
  for (const line of content.slice(start + marker.length).split("\n")) {
    if (!line.startsWith("- ")) continue;
    const divider = line.lastIndexOf(" | ");
    if (divider < 3) continue;
    try {
      const url = new URL(line.slice(divider + 3));
      if (url.protocol === "https:" || url.protocol === "http:") sources.push({ title: line.slice(2, divider), url: url.toString() });
    } catch { /* Ignore malformed source URLs. */ }
  }
  return sources.length ? { answer: content.slice(0, start), sources } : { answer: content, sources };
}


export function GrowthAiChat() {
  const [chats, setChats] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [liveWeb, setLiveWeb] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [browserUrl, setBrowserUrl] = useState("");
  const [browserAction, setBrowserAction] = useState<"click" | "fill" | "press" | "select">("click");
  const [browserSelector, setBrowserSelector] = useState("");
  const [browserValue, setBrowserValue] = useState("");
  const [browserSteps, setBrowserSteps] = useState<BrowserStep[]>([]);
  const [browserBusy, setBrowserBusy] = useState(false);
  const [browserError, setBrowserError] = useState<string | null>(null);
  const [browserResult, setBrowserResult] = useState<BrowserResult | null>(null);
  const [browserContext, setBrowserContext] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const activeIdRef = useRef<string | null>(null);
  const refreshChatsRef = useRef<((options?: RefreshOptions) => Promise<void>) | null>(null);
  const creatingRef = useRef(false);
  // Decides which async refreshes may still apply (see growth-ai-chat-state.ts).
  const [gate] = useState(() => new RefreshGate());
  const channelId = useId();

  const refreshChats = useCallback(async ({ selectFirst = false, allowWhileBusy = false }: RefreshOptions = {}) => {
    // Only the newest request may apply its result, and nothing but the explicit
    // post-send refresh may apply while a message is in flight; creates/renames/
    // sends invalidate older requests (gate.invalidate()).
    const token = gate.begin();
    try {
      const res = await fetch("/api/agent/conversations", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Could not load saved conversations.");
      if (!gate.canApply(token, allowWhileBusy)) return;
      const next = (Array.isArray(data?.conversations) ? data.conversations : []).map((item: ApiConversation) => fromApi(item));
      if (!next.length) {
        // The mount fetch and the realtime SUBSCRIBED fetch can both see an
        // empty list; only one of them may create the starter conversation.
        if (creatingRef.current) return;
        creatingRef.current = true;
        try {
          const create = await fetch("/api/agent/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create" }) });
          const created = await create.json().catch(() => null);
          if (!create.ok || !created?.conversation) throw new Error(created?.error || "Could not create a conversation.");
          if (!gate.canApply(token, allowWhileBusy)) return;
          const chat = fromApi({ ...created.conversation, ai_operator_messages: [] });
          setChats([chat]); activeIdRef.current = chat.id; setActiveId(chat.id);
        } finally { creatingRef.current = false; }
        return;
      }
      // Keep answers that were generated but could not be saved yet.
      setChats((prev) => next.map((c: Conversation) => {
        const local = prev.find((p) => p.id === c.id)?.messages;
        return local ? { ...c, messages: mergeUnsaved(c.messages, local) } : c;
      }));
      const current = activeIdRef.current;
      const currentValid = Boolean(current && next.some((c: Conversation) => c.id === current));
      const inTab = next.find((c: Conversation) => c.archived === showArchived)?.id ?? null;
      // Switching tabs (selectFirst) opens the first chat of that tab instead of
      // leaving a chat from the other tab open.
      // An automatic "open the first chat" must not override a chat the user
      // clicked while the request was in flight.
      const autoSelect = selectFirst && gate.mayAutoSelect(token);
      const selected = autoSelect ? inTab : currentValid ? current : inTab ?? next[0].id;
      if (autoSelect || !currentValid) { activeIdRef.current = selected; setActiveId(selected); }
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load saved conversations."); }
  }, [showArchived, gate]);

  // Keep the latest loader available to the stable Realtime subscription.
  useEffect(() => {
    refreshChatsRef.current = refreshChats;
  }, [refreshChats]);

  useEffect(() => {
    const supabase = createClient();
    let reconcileTimer: ReturnType<typeof setTimeout> | null = null;
    let connected = false;
    // While a message is in flight, send() refreshes when it finishes; an
    // intermediate refresh would only drop the optimistic message.
    const reconcile = () => {
      if (reconcileTimer) clearTimeout(reconcileTimer);
      reconcileTimer = setTimeout(() => { if (!gate.busy) void refreshChatsRef.current?.(); }, 120);
    };

    const channel = supabase
      .channel(`growth-operator-realtime-${channelId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ai_operator_conversations" }, reconcile)
      .on("postgres_changes", { event: "*", schema: "public", table: "ai_operator_messages" }, reconcile)
      .subscribe((status) => {
        connected = status === "SUBSCRIBED";
        if (connected) reconcile(); // catch up on anything missed while disconnected
      });

    // Backstop: if the socket is down, poll so the list never goes stale.
    const poll = window.setInterval(() => {
      if (!connected && document.visibilityState === "visible" && navigator.onLine) reconcile();
    }, 20_000);
    const onReturn = () => { if (document.visibilityState === "visible") reconcile(); };
    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("online", onReturn);

    return () => {
      if (reconcileTimer) clearTimeout(reconcileTimer);
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("online", onReturn);
      void supabase.removeChannel(channel);
    };
  }, [channelId, gate]);

  useEffect(() => { void refreshChats({ selectFirst: true }); }, [refreshChats]);
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => { setBrowserUrl(`${window.location.origin}/dashboard`); }, []);
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 8000);
    return () => clearTimeout(timer);
  }, [error]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeId, chats, busy]);

  const active = useMemo(() => chats.find((c) => c.id === activeId) ?? null, [chats, activeId]);
  const visible = chats.filter((c) => c.archived === showArchived && (!search.trim() || c.title.toLowerCase().includes(search.toLowerCase()) || c.messages.some((m) => String(m.content ?? "").toLowerCase().includes(search.toLowerCase()))));

  function selectChat(id: string | null) { gate.noteManualSelection(); activeIdRef.current = id; setActiveId(id); }
  // Every completed write voids refreshes that started before it: their data may predate the change.
  async function api(body: Record<string, unknown>) { const res = await fetch("/api/agent/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const data = await res.json().catch(() => null); if (!res.ok) throw new Error(data?.error || "Conversation update failed."); gate.invalidate(); return data; }
  async function createChat() { try { const data = await api({ action: "create" }); const chat = fromApi({ ...data.conversation, ai_operator_messages: [] }); setChats((v) => [chat, ...v]); selectChat(chat.id); setInput(""); setError(null); void refreshChats(); requestAnimationFrame(() => inputRef.current?.focus()); } catch (err) { setError(err instanceof Error ? err.message : "Could not create conversation."); } }
  async function finishRename() { if (!renameId) return; const value = renameValue.trim(); if (value) { try { await api({ action: "update", conversationId: renameId, title: value.slice(0, 80) }); await refreshChats({ allowWhileBusy: true }); } catch (err) { setError(err instanceof Error ? err.message : "Could not rename conversation."); } } setRenameId(null); setRenameValue(""); }
  async function archiveChat(id: string, archived: boolean) { try { await api({ action: "update", conversationId: id, archived }); await refreshChats({ allowWhileBusy: true }); if (archived && id === activeId) await createChat(); } catch (err) { setError(err instanceof Error ? err.message : "Could not update conversation."); } }
  async function deleteChat(id: string) { if (!window.confirm("Move this conversation and all its messages to Trash? You can restore them at any time.")) return; try { await api({ action: "delete", conversationId: id }); await refreshChats({ selectFirst: true, allowWhileBusy: true }); } catch (err) { setError(err instanceof Error ? err.message : "Could not move conversation to Trash."); } }

  function browserContextFromResult(result: BrowserResult) {
    const controls = result.elements.slice(0, 60).map((item) =>
      "- " + item.tag + " " + item.selector + (item.text ? " — " + item.text : "") +
      (item.placeholder ? " (placeholder: " + item.placeholder + ")" : "") +
      (item.disabled ? " [disabled]" : "")
    ).join("\n");
    return "Current GrowthSpace website page\nURL: " + result.url + "\nTitle: " + result.title +
      "\n\nRendered page text:\n" + result.text + "\n\nInteractive elements:\n" + controls;
  }

  async function runBrowserAction(
    action: BrowserAction,
    requestedUrl?: string,
    steps?: BrowserStep[],
    askConfirmation = true,
  ): Promise<BrowserResult | null> {
    const mutating = ["click", "fill", "press", "select"].includes(action) || Boolean(steps?.length);
    if (mutating && askConfirmation) {
      const detail = steps?.length
        ? "Run " + steps.length + " website action(s) on the signed-in GrowthSpace site?"
        : "Run the browser action “" + action + "” on the signed-in GrowthSpace site?";
      if (!window.confirm(detail + " It may change website data.")) return null;
    }

    setBrowserOpen(true);
    setBrowserBusy(true);
    setBrowserError(null);
    try {
      const response = await fetch("/api/agent/browser/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: steps?.length ? "inspect" : action,
          url: (requestedUrl || browserUrl).trim(),
          selector: browserSelector.trim(),
          value: browserValue,
          steps: steps?.map(({ action: stepAction, selector, value }) => ({ action: stepAction, selector, value })),
          confirmed: mutating,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Headless browser failed.");
      const result = data as BrowserResult;
      setBrowserResult(result);
      setBrowserUrl(result.url);
      setBrowserContext(browserContextFromResult(result));
      if (steps?.length) setBrowserSteps([]);
      return result;
    } catch (err) {
      setBrowserError(err instanceof Error ? err.message : "Headless browser failed.");
      return null;
    } finally {
      setBrowserBusy(false);
    }
  }

  function addBrowserStep() {
    const selector = browserSelector.trim();
    if (!selector) {
      setBrowserError("Choose a selector from the page inspection first.");
      return;
    }
    setBrowserSteps((current) => [...current, {
      id: makeId(),
      action: browserAction,
      selector,
      value: browserValue,
    }]);
  }

  async function send(text: string) {
    const value = text.trim();
    // Synchronous guard (state would lag a double submit) and start of the send
    // window: older in-flight refreshes are voided before the first await.
    if (!value || gate.busy) return;
    gate.startSend(); setBusy(true);

    let pageContextForTurn = browserContext;
    let pageResultForTurn: BrowserResult | null = browserResult;
    const explicitUrl = value.match(/https?:\/\/[^\s<>"')]+/i)?.[0]?.replace(/[.,!?]+$/, "");
    const browserIntent = requestsBrowserAction(value) || /\b(visit|browse|inspect|read|look at|website|webpage|page|dashboard)\b/i.test(value);
    if (browserIntent && (explicitUrl || !pageContextForTurn || !pageResultForTurn)) {
      const targetUrl = explicitUrl || (window.location.origin + "/dashboard");
      const page = await runBrowserAction("inspect", targetUrl, undefined, false);
      if (page) {
        pageResultForTurn = page;
        pageContextForTurn = browserContextFromResult(page);
      }
    }
    const agentGoal = pageContextForTurn
      ? value + "\n\nHeadless browser context from the user's signed-in GrowthSpace website:\n" + pageContextForTurn.slice(0, 14000)
      : value;

    let current = active;
    if (!current) {
      try { const created = await api({ action: "create" }); if (!created?.conversation?.id) throw new Error("Could not create a conversation."); current = fromApi({ ...created.conversation, ai_operator_messages: [] }); activeIdRef.current = current.id; setActiveId(current.id); setChats((all) => [current!, ...all.filter((c) => c.id !== current!.id)]); }
      catch (err) { gate.endSend(); setBusy(false); setError(err instanceof Error ? err.message : "Could not start a conversation."); return; }
    }
    const pendingId = makeId();
    const pendingUser: Message = { id: pendingId, role: "user", content: value, createdAt: Date.now(), status: "pending" };
    // The new message goes in `goal`; history is the earlier, successfully sent turns only.
    const history = historyForModel(current.messages);
    setChats((all) => all.map((c) => c.id === current!.id ? { ...c, messages: [...c.messages, pendingUser], title: c.messages.length ? c.title : titleFrom(value), updatedAt: Date.now(), archived: false } : c));
    setInput(""); setError(null);
    let userSaved = false;
    try {
      await api({ action: "message", conversationId: current.id, role: "user", content: value });
      userSaved = true;

      let finalAgentGoal = agentGoal;
      const controlIntent = requestsBrowserAction(value);
      if (controlIntent && pageResultForTurn) {
        let actionRound = 0;
        let actionExecuted = false;
        let actionDeclined = false;
        let actionFailed = false;
        const executedSignatures = new Set<string>();

        // Allow a few confirmed rounds so the AI can navigate to a section first,
        // then inspect that page and fill/submit its form in a later round.
        while (actionRound < 3) {
          const visibleControls = pageResultForTurn.elements
            .filter((element) => !element.disabled)
            .slice(0, 60)
            .map((element) => ({
              tag: element.tag,
              selector: element.selector,
              text: element.text,
              placeholder: element.placeholder || "",
              type: element.type || "",
              href: element.href || "",
            }));

          const plannerPrompt = [
            "You are Growth AI's browser action planner. Plan the next concrete UI actions for the user's request using only the visible elements from the current signed-in GrowthSpace page.",
            "Return only valid JSON with this exact shape: {\"steps\":[{\"action\":\"click|fill|press|select\",\"selector\":\"exact selector from the supplied elements\",\"value\":\"text or key, or empty string\"}]}",
            "Use 1 to 8 steps only when the user's request clearly asks you to interact with the website. If the task is complete, the request is vague, or this page has no suitable controls, return {\"steps\":[]}.",
            "Every selector must exactly match one selector in the supplied elements. Never invent a selector. For fill actions, use input or textarea elements; for select actions, use select elements.",
            "Plan only the next steps possible on this page. After these steps the page will be inspected again, so you can continue from the next page. Do not repeat an action already listed in the executed actions unless there is a clear reason.",
            "Do not claim to have performed an action. The UI asks the user to confirm every action sequence before anything runs.",
            "Do not navigate off the current GrowthSpace website. If the request cannot be completed with visible controls, return {\"steps\":[]}.",
            "User request: " + value,
            "Actions already executed: " + JSON.stringify(Array.from(executedSignatures)),
            "Current page: " + pageResultForTurn.title + " (" + pageResultForTurn.url + ")",
            "Visible page text: " + pageResultForTurn.text.slice(0, 6500),
            "Available interactive elements: " + JSON.stringify(visibleControls),
          ].join("\n\n");

          let plannedSteps: BrowserStep[] = [];
          try {
            const planResponse = await fetch("/api/agent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ goal: plannerPrompt, provider: "auto", model: "auto", history: [] }),
            });
            const planData = await planResponse.json().catch(() => null);
            plannedSteps = planResponse.ok && typeof planData?.answer === "string"
              ? parseBrowserPlan(planData.answer, pageResultForTurn.elements)
              : [];
          } catch {
            actionFailed = true;
            setBrowserError("Growth AI could not prepare browser actions just now. No unconfirmed website changes were made.");
            break;
          }

          if (!plannedSteps.length) {
            if (actionRound === 0 && !actionExecuted) {
              setBrowserError("Growth AI couldn't map this request to a safe sequence of visible website controls. No website changes were made.");
            }
            break;
          }

          const signatureFor = (step: BrowserStep) => [step.action, step.selector, step.value].join("|");
          if (plannedSteps.every((step) => executedSignatures.has(signatureFor(step)))) break;

          const preview = plannedSteps.map((step, index) =>
            (index + 1) + ". " + step.action.toUpperCase() + " " + step.selector +
            (step.action === "click" ? "" : " → " + (step.value || "(empty)"))
          ).join("\n");
          const approved = window.confirm(
            "Growth AI proposes this website action sequence (round " + (actionRound + 1) + " of 3):\n\n" + preview +
            "\n\nThese actions may change saved website data. Run this sequence?"
          );

          if (!approved) {
            actionDeclined = true;
            break;
          }

          const beforeUrl = pageResultForTurn.url;
          const updatedPage = await runBrowserAction("inspect", beforeUrl, plannedSteps, false);
          if (!updatedPage) {
            actionFailed = true;
            break;
          }

          actionExecuted = true;
          for (const step of plannedSteps) executedSignatures.add(signatureFor(step));
          pageResultForTurn = updatedPage;
          pageContextForTurn = browserContextFromResult(updatedPage);
          actionRound += 1;
        }

        if (actionExecuted) {
          finalAgentGoal = value +
            "\n\nBrowser actions were executed on the signed-in GrowthSpace website. Here is the latest page state; use it to report what actually changed, and do not claim changes that are not reflected here:\n" +
            pageContextForTurn.slice(0, 14000) +
            (actionFailed ? "\n\nThe browser encountered an error after some actions. Be precise about what can be verified and mention that the sequence may be incomplete." : "") +
            (actionDeclined ? "\n\nThe user declined a later action sequence. Report any verified partial progress and do not claim the remaining actions completed." : "");
        } else if (actionDeclined) {
          finalAgentGoal = value + "\n\nThe user declined confirmation for the proposed website actions. No website actions were run. Do not claim any change succeeded; explain that nothing was changed.";
        } else if (actionFailed) {
          finalAgentGoal = value + "\n\nThe browser could not prepare or execute a website action sequence. Do not claim any website changes succeeded. Explain the browser error shown in the browser panel.";
        }
      }

      const res = await fetch(liveWeb ? "/api/agent/research" : "/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(liveWeb ? { goal: finalAgentGoal, history } : { goal: finalAgentGoal, provider: "auto", model: "auto", history }) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Growth AI could not answer.");
      const answer = typeof data?.answer === "string" ? data.answer : "No answer returned.";
      const sources = liveWeb && Array.isArray(data?.citations) ? data.citations.flatMap((item: { url?: unknown }) => {
        if (typeof item?.url !== "string") return [];
        try { const url = new URL(item.url); if (url.protocol !== "https:" && url.protocol !== "http:") return []; return [`- ${url.hostname.replace(/^www\./, "")} | ${url.toString()}`]; } catch { return []; }
      }).slice(0, 8) : [];
      const savedAnswer = sources.length ? answer + "\n\nSources:\n" + sources.join("\n") : answer;
      const answeredAt = Date.now(); // before the save, so a copy that did reach the server is recognised later
      let saveFailed = false;
      try { await api({ action: "message", conversationId: current.id, role: "assistant", content: savedAnswer, provider: data?.provider, model: data?.model, steps: Array.isArray(data?.steps) ? data.steps : [] }); }
      catch { saveFailed = true; }
      // Show the answer either way; if saving failed it is marked "unsaved" instead of being lost.
      const assistant: Message = { id: makeId(), role: "assistant", content: savedAnswer, provider: data?.provider, model: data?.model, createdAt: answeredAt, status: saveFailed ? "unsaved" : undefined };
      setChats((all) => all.map((c) => c.id === current!.id ? { ...c, messages: [...c.messages.map((m) => m.id === pendingId ? { ...m, status: undefined } : m), assistant] } : c));
      if (saveFailed) setError("The answer is shown but could not be saved to this conversation.");
      else await refreshChats({ allowWhileBusy: true });
    } catch (err) {
      // Nothing was saved: give the text back instead of losing it.
      if (!userSaved) setInput((prev) => prev || value);
      setChats((all) => all.map((c) => c.id === current!.id ? { ...c, messages: c.messages.map((m) => m.id === pendingId ? { ...m, status: "failed" } : m) } : c));
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { gate.endSend(); setBusy(false); requestAnimationFrame(() => inputRef.current?.focus()); }
  }

  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); void send(input); }

  return (
    <section className="flex min-h-[76vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-slate-50/70 md:flex md:flex-col">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <LogoMark size={38} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-slate-900">Growth AI</h2>
              <p className="text-[11px] text-slate-500">Your growth workspace</p>
            </div>
            <button
              type="button"
              onClick={() => void createChat()}
              aria-label="New chat"
              title="New chat"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <GrowthAiIcon name="plus" size={18} />
            </button>
          </div>

          <div className="relative mt-4">
            <GrowthAiIcon name="search" size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats"
              aria-label="Search conversations"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-200/70 p-1">
            <button
              type="button"
              onClick={() => setShowArchived(false)}
              className={"rounded-lg px-3 py-2 text-xs font-semibold transition " + (!showArchived ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              Chats
            </button>
            <button
              type="button"
              onClick={() => setShowArchived(true)}
              className={"rounded-lg px-3 py-2 text-xs font-semibold transition " + (showArchived ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              Archived
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-2.5">
          {visible.map((chat) => (
            <div
              key={chat.id}
              className={"group flex items-start gap-1 rounded-2xl p-1 transition " + (chat.id === activeId ? "bg-emerald-50 ring-1 ring-emerald-100" : "hover:bg-white")}
            >
              <button
                type="button"
                onClick={() => selectChat(chat.id)}
                aria-current={chat.id === activeId ? "true" : undefined}
                className="min-w-0 flex-1 rounded-xl px-2.5 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className={"h-1.5 w-1.5 shrink-0 rounded-full " + (chat.id === activeId ? "bg-emerald-500" : "bg-slate-300")} />
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-800">{chat.title}</span>
                </span>
                <span className="mt-1.5 block truncate pl-3.5 text-[11px] leading-4 text-slate-500">
                  {chat.messages.at(-1)?.content || "A new conversation"}
                </span>
                <span className="mt-1.5 block pl-3.5 text-[10px] text-slate-400">
                  {new Date(chat.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </button>
              <div className="flex shrink-0 flex-col gap-1 pt-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => void archiveChat(chat.id, !chat.archived)}
                  title={chat.archived ? "Restore chat from archive" : "Archive chat"}
                  aria-label={chat.archived ? "Restore chat from archive" : "Archive chat"}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <GrowthAiIcon name={chat.archived ? "restore" : "archive"} size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => void deleteChat(chat.id)}
                  title="Move chat to Trash"
                  aria-label="Move chat to Trash"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <GrowthAiIcon name="trash" size={14} />
                </button>
              </div>
            </div>
          ))}
          {!visible.length && (
            <div className="px-4 py-12 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-400 ring-1 ring-slate-200">
                <GrowthAiIcon name="search" size={17} />
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-700">No chats found</p>
              <p className="mt-1 text-[11px] text-slate-500">Try another search or start a new chat.</p>
            </div>
          )}
        </div>
        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={() => setBrowserOpen((open) => !open)}
            className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            <GrowthAiIcon name="browser" size={16} />
            <span className="flex-1">Headless browser</span>
            <span className={"h-1.5 w-1.5 rounded-full " + (browserResult ? "bg-emerald-500" : "bg-slate-300")} />
          </button>
          <p className="mt-2 px-1 text-[10px] leading-4 text-slate-400">Chats save automatically. Deleted chats can be restored from Trash.</p>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="flex items-center gap-2 border-b border-slate-200 px-3 py-3.5 sm:px-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 md:hidden">
            <LogoMark size={38} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-bold text-slate-900">{active?.title || "Growth AI"}</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Auto model routing
              {browserContext ? <span className="truncate text-emerald-700">· Website context attached</span> : null}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setBrowserOpen((open) => !open)}
              title="Open headless browser"
              aria-label="Open headless browser"
              aria-pressed={browserOpen}
              className={"flex h-9 w-9 items-center justify-center rounded-xl border transition " + (browserOpen ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800")}
            >
              <GrowthAiIcon name="browser" size={17} />
            </button>
            {active && <>
              <button
                type="button"
                onClick={() => { setRenameId(active.id); setRenameValue(active.title); }}
                title="Rename chat"
                aria-label="Rename chat"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              >
                <GrowthAiIcon name="edit" size={16} />
              </button>
              <button
                type="button"
                onClick={() => void archiveChat(active.id, !active.archived)}
                title={active.archived ? "Restore chat from archive" : "Archive chat"}
                aria-label={active.archived ? "Restore chat from archive" : "Archive chat"}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              >
                <GrowthAiIcon name={active.archived ? "restore" : "archive"} size={16} />
              </button>
              <button
                type="button"
                onClick={() => void deleteChat(active.id)}
                title="Move chat to Trash"
                aria-label="Move chat to Trash"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 text-rose-600 transition hover:bg-rose-50"
              >
                <GrowthAiIcon name="trash" size={16} />
              </button>
            </>}
          </div>
        </header>

        {browserOpen && (
          <section aria-label="Headless website browser" className="border-b border-slate-200 bg-slate-50/80 p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <GrowthAiIcon name="browser" size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold text-slate-900">Headless browser</h3>
                <p className="text-[10px] text-slate-500">Uses your signed-in GrowthSpace session and stays on this website.</p>
              </div>
              <button type="button" onClick={() => setBrowserOpen(false)} aria-label="Close headless browser" title="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700">
                <GrowthAiIcon name="close" size={16} />
              </button>
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={browserUrl}
                onChange={(e) => setBrowserUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void runBrowserAction("inspect"); }}
                placeholder="https://your-growthspace-site/dashboard"
                aria-label="Website URL"
                className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
              <button
                type="button"
                disabled={browserBusy}
                onClick={() => void runBrowserAction("inspect")}
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {browserBusy
                  ? <PulseOrb state="working" size={20} label="Opening website" className="shrink-0" />
                  : <GrowthAiIcon name="external" size={14} />}
                <span>{browserBusy ? "Opening…" : "Open page"}</span>
              </button>
            </div>

            <div className="mt-2 grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)]">
              <select
                value={browserAction}
                onChange={(e) => setBrowserAction(e.target.value as typeof browserAction)}
                aria-label="Action to queue"
                className="h-10 rounded-xl border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-emerald-400"
              >
                <option value="click">Click</option>
                <option value="fill">Fill field</option>
                <option value="press">Press key</option>
                <option value="select">Choose option</option>
              </select>
              <input
                value={browserSelector}
                onChange={(e) => setBrowserSelector(e.target.value)}
                placeholder="CSS selector (choose one from page inspection below)"
                aria-label="Browser element selector"
                className="h-10 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-emerald-400"
              />
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={browserValue}
                onChange={(e) => setBrowserValue(e.target.value)}
                placeholder={browserAction === "press" ? "Key (e.g. Enter)" : browserAction === "select" ? "Option value" : "Text to fill (if needed)"}
                aria-label="Browser action value"
                className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={addBrowserStep}
                disabled={browserBusy || !browserSelector.trim()}
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <GrowthAiIcon name="plus" size={14} />
                Add step
              </button>
            </div>

            {browserSteps.length > 0 && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-800">{browserSteps.length} queued website action{browserSteps.length === 1 ? "" : "s"}</p>
                  <button type="button" onClick={() => setBrowserSteps([])} className="text-[11px] font-medium text-slate-500 hover:text-rose-600">Clear</button>
                </div>
                <ol className="mt-2 space-y-1.5">
                  {browserSteps.map((step, index) => (
                    <li key={step.id} className="flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold">{index + 1}</span>
                      <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold">{step.action}</span>
                      <code className="min-w-0 flex-1 truncate">{step.selector}</code>
                      <button type="button" onClick={() => setBrowserSteps((items) => items.filter((item) => item.id !== step.id))} title="Remove step" aria-label="Remove step" className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                        <GrowthAiIcon name="close" size={13} />
                      </button>
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  disabled={browserBusy}
                  onClick={() => void runBrowserAction("inspect", browserUrl, browserSteps)}
                  className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {browserBusy
                    ? <PulseOrb state="working" size={20} label="Running website actions" className="shrink-0" />
                    : <GrowthAiIcon name="shield" size={14} />}
                  {browserBusy ? "Running…" : "Confirm and run sequence"}
                </button>
                <p className="mt-2 text-[10px] leading-4 text-slate-500">Actions run in order in one headless browser session. Review the steps first; clicking or filling may change saved website data.</p>
              </div>
            )}

            {browserError && <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{browserError}</p>}
            {browserResult && (
              <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-start gap-2 border-b border-slate-100 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900">{browserResult.title}</p>
                    <p className="mt-0.5 truncate text-[10px] text-slate-500">{browserResult.url}</p>
                  </div>
                  <button type="button" onClick={() => setBrowserContext(browserContextFromResult(browserResult))} title="Attach this page to Growth AI" aria-label="Attach this page to Growth AI" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <GrowthAiIcon name="check" size={15} />
                  </button>
                </div>
                {browserResult.screenshot && <div className="border-b border-slate-100 bg-slate-100 p-2"><img src={browserResult.screenshot} alt="Headless browser screenshot of the current GrowthSpace page" className="max-h-56 w-full rounded-lg border border-slate-200 bg-white object-contain object-top" /></div>}
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">
                    <span>Rendered page text and controls ({browserResult.elements.length})</span>
                    <GrowthAiIcon name="chevron-down" size={14} className="transition group-open:rotate-180" />
                  </summary>
                  <div className="space-y-3 border-t border-slate-100 p-3">
                    <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words text-[10px] leading-4 text-slate-600">{browserResult.text.slice(0, 5000)}</pre>
                    <div className="flex flex-wrap gap-1.5">
                      {browserResult.elements.slice(0, 30).map((element, index) => (
                        <button
                          type="button"
                          key={element.selector + "-" + index}
                          disabled={element.disabled}
                          onClick={() => setBrowserSelector(element.selector)}
                          title={element.selector + (element.href ? " · " + element.href : "")}
                          className="max-w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-left text-[10px] text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-40"
                        >
                          <span className="mr-1 font-bold uppercase text-emerald-700">{element.tag}</span>
                          <span className="inline-block max-w-48 truncate align-bottom">{element.text || element.selector}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </details>
              </div>
            )}
          </section>
        )}

        <div className="border-b border-slate-100 p-2 md:hidden">
          <div className="flex items-center gap-2">
            <select aria-label="Choose conversation" value={activeId ?? ""} onChange={(e) => selectChat(e.target.value || null)} className="h-9 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-2 text-xs text-slate-700">
              <option value="">{showArchived ? "No archived chat selected" : "Select a conversation"}</option>
              {chats.filter((chat) => chat.archived === showArchived).map((chat) => <option key={chat.id} value={chat.id}>{chat.title}</option>)}
            </select>
            <button type="button" onClick={() => setShowArchived((value) => !value)} title={showArchived ? "Show chats" : "Show archived"} aria-label={showArchived ? "Show chats" : "Show archived"} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500">
              <GrowthAiIcon name={showArchived ? "restore" : "archive"} size={15} />
            </button>
            <button type="button" onClick={() => void createChat()} title="New chat" aria-label="New chat" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <GrowthAiIcon name="plus" size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/80 to-white p-4 sm:p-6">
          <div className="mx-auto w-full max-w-3xl">
            {!active ? (
              <div className="flex min-h-[48vh] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
                  <LogoMark size={60} />
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900">What are we growing today?</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Ask about your workspace, review your website in the headless browser, or turn a rough idea into a practical plan.</p>
                <div className="mt-6 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                  {[
                    ["Review my website", "Open and inspect my GrowthSpace website, then summarize what you see."],
                    ["Find growth opportunities", "Analyze recent workspace growth metrics and suggest three useful improvements."],
                    ["Plan the next step", "Help me make a practical, prioritized growth plan for this workspace."],
                    ["Explore competitors", "Summarize my tracked competitors and recommend a few next steps."],
                  ].map(([label, prompt]) => (
                    <button key={label} type="button" onClick={() => { setInput(prompt); requestAnimationFrame(() => inputRef.current?.focus()); }} className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/60">
                      <span className="block">{label}</span>
                      <span className="mt-1.5 block text-[11px] font-normal leading-4 text-slate-500">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {active.messages.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-sm font-semibold text-slate-800">A fresh start</p>
                    <p className="mt-1 text-xs text-slate-500">Ask a question or use the browser icon to inspect your website.</p>
                  </div>
                )}
                {active.messages.map((message) => {
                  const parts = splitCitations(message.content);
                  const isUser = message.role === "user";
                  return (
                    <div key={message.id} className={"mb-5 flex gap-2.5 sm:gap-3 " + (isUser ? "justify-end" : "justify-start")}>
                      {!isUser && (
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                          <LogoMark size={30} />
                        </div>
                      )}
                      <div className={"min-w-0 max-w-[88%] sm:max-w-[82%] " + (isUser ? "items-end" : "items-start")}>
                        <div className={"mb-1.5 flex items-center gap-2 px-1 text-[10px] " + (isUser ? "justify-end text-slate-400" : "text-slate-500")}>
                          <span className="font-semibold">{isUser ? "You" : "Growth AI"}</span>
                          {message.provider && !isUser && <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-500">{message.provider}{message.model ? " · " + message.model : ""}</span>}
                          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div className={"rounded-2xl px-4 py-3.5 text-sm leading-6 shadow-sm " + (isUser ? "rounded-tr-md bg-emerald-600 text-white" : "rounded-tl-md border border-slate-200 bg-white text-slate-800")} dir="auto">
                          <div className="whitespace-pre-wrap break-words">{parts.answer}{message.status === "failed" ? "\nMessage failed — send it again." : message.status === "unsaved" ? "\nNot saved to history." : ""}</div>
                          {parts.sources.length > 0 && <div className={"mt-3 border-t pt-2 text-xs " + (isUser ? "border-white/20" : "border-slate-200")}><p className="mb-1 font-semibold">Sources</p><ul className="space-y-1">{parts.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className={isUser ? "underline text-white" : "underline text-sky-700"}>{source.title}</a></li>)}</ul></div>}
                        </div>
                      </div>
                      {isUser && <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-[10px] font-bold text-slate-600">YOU</div>}
                    </div>
                  );
                })}
                {busy && (
                  <div role="status" aria-live="polite" className="ml-11 mb-4 flex items-center gap-2.5 text-xs text-slate-500">
                    <PulseOrb
                      state={browserBusy ? "working" : "thinking"}
                      size={28}
                      label={browserBusy ? "Growth AI is working" : "Growth AI is thinking"}
                      className="shrink-0"
                    />
                    <span>{browserBusy ? "Growth AI is working" : "Growth AI is thinking"}</span>
                  </div>
                )}
                <div ref={endRef} />
              </>
            )}
          </div>
        </div>

        <form onSubmit={submit} className="border-t border-slate-200 bg-white p-3 sm:p-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100">
                <input type="checkbox" checked={liveWeb} onChange={(e) => setLiveWeb(e.target.checked)} className="accent-emerald-600" />
                <span>Live web research</span>
              </label>
              <button type="button" onClick={() => setBrowserOpen((open) => !open)} className={"flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-semibold transition " + (browserOpen ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
                <GrowthAiIcon name="browser" size={14} />
                Headless browser
              </button>
              {browserContext && <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700"><GrowthAiIcon name="check" size={12} />Website page attached</span>}
            </div>
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-50">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(input); } }}
                rows={2}
                placeholder="Message Growth AI…"
                aria-label="Message Growth AI"
                className="min-h-12 min-w-0 flex-1 resize-y bg-transparent px-2 py-2 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"
                dir="auto"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                title="Send message"
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <GrowthAiIcon name="send" size={17} />
              </button>
            </div>
            <p className="mt-2 flex items-center justify-between gap-2 px-1 text-[10px] text-slate-400">
              <span>Enter to send · Shift+Enter for a new line</span>
              <span className="hidden sm:inline">Saved to your workspace</span>
            </p>
          </div>
        </form>
      </main>

      {renameId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><GrowthAiIcon name="edit" size={16} /></div>
              <div><h3 className="text-sm font-bold text-slate-900">Rename conversation</h3><p className="text-xs text-slate-500">Give this chat a useful name.</p></div>
            </div>
            <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void finishRename(); }} className="mt-4 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setRenameId(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => void finishRename()} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Save name</button>
            </div>
          </div>
        </div>
      )}

      {error && <div role="alert" className="fixed bottom-4 left-1/2 z-[60] flex max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-xs text-white shadow-xl"><span>{error}</span><button type="button" aria-label="Dismiss" onClick={() => setError(null)} className="text-slate-300 hover:text-white"><GrowthAiIcon name="close" size={14} /></button></div>}
    </section>
  );
}
