"use client";

import { FormEvent, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GrowthAiIcon } from "@/components/growth-ai-icon";
import { historyForModel, mergeUnsaved, RefreshGate } from "@/lib/growth-ai-chat-state";

type Message = { id: string; role: "user" | "assistant"; content: string; provider?: string; model?: string; createdAt: number; status?: "pending" | "failed" | "unsaved" };
type Conversation = { id: string; title: string; messages: Message[]; archived: boolean; updatedAt: number };
type ApiConversation = { id: string; title: string; archived: boolean; updated_at: string; ai_operator_messages?: Array<{ id: string; role: "user" | "assistant"; content: string; provider?: string | null; model?: string | null; created_at: string }> };
type BrowserAction = "inspect" | "screenshot" | "click" | "fill" | "press" | "select";
type BrowserElement = { tag: string; selector: string; text: string; type?: string; placeholder?: string; href?: string; disabled?: boolean };
type BrowserResult = { ok: true; action: string; url: string; title: string; text: string; elements: BrowserElement[]; screenshot?: string; controlsEnabled: boolean; hostScoped: true };

type RefreshOptions = { selectFirst?: boolean; allowWhileBusy?: boolean };
function makeId() { return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function titleFrom(text: string) { const value = text.replace(/\s+/g, " ").trim(); return value.length > 60 ? `${value.slice(0, 60)}…` : value || "New conversation"; }
function fromApi(value: ApiConversation): Conversation { return { id: value.id, title: value.title || "New conversation", archived: value.archived, updatedAt: Date.parse(value.updated_at) || Date.now(), messages: (value.ai_operator_messages ?? []).sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)).map((m) => ({ id: m.id, role: m.role, content: typeof m.content === "string" ? m.content : "", provider: m.provider ?? undefined, model: m.model ?? undefined, createdAt: Date.parse(m.created_at) || Date.now() })) }; }
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

  async function send(text: string) {
    const value = text.trim();
    // Synchronous guard (state would lag a double submit) and start of the send
    // window: older in-flight refreshes are voided before the first await.
    if (!value || gate.busy) return;
    gate.startSend(); setBusy(true);
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
      const res = await fetch(liveWeb ? "/api/agent/research" : "/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(liveWeb ? { goal: value, history } : { goal: value, provider: "auto", model: "auto", history }) });
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

  return <section className="flex min-h-[70vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <aside className="hidden w-80 shrink-0 border-r border-slate-200 md:flex md:flex-col">
      <div className="border-b border-slate-200 p-3">
        <div className="flex gap-2"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"/><button onClick={() => void createChat()} className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-bold text-white">+</button></div>
        <div className="mt-2 flex gap-1"><button onClick={() => setShowArchived(false)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${!showArchived ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>Chats</button><button onClick={() => setShowArchived(true)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${showArchived ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>Archived</button></div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">{visible.map((chat) => <button key={chat.id} onClick={() => selectChat(chat.id)} className={`mb-1 w-full rounded-xl p-3 text-left ${chat.id === activeId ? "bg-emerald-50" : "hover:bg-slate-50"}`}><div className="truncate text-sm font-semibold text-slate-900">{chat.title}</div><div className="truncate text-xs text-slate-400">{chat.messages.at(-1)?.content || "New conversation"}</div></button>)}{!visible.length && <p className="p-5 text-center text-sm text-slate-500">No conversations here.</p>}</div>
    </aside>
    <main className="flex min-w-0 flex-1 flex-col">
      <header className="flex items-center gap-2 border-b border-slate-200 px-4 py-3"><div className="flex-1"><h2 className="font-semibold text-slate-900">Growth AI</h2><p className="text-xs text-slate-400">Free AI routing is automatic. No model selection.</p></div>{active && <><button onClick={() => { setRenameId(active.id); setRenameValue(active.title); }} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs">Rename</button><button onClick={() => void archiveChat(active.id, !active.archived)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs">{active.archived ? "Restore" : "Archive"}</button><button onClick={() => void deleteChat(active.id)} className="rounded-lg border border-red-200 px-2 py-1.5 text-xs text-red-600">Delete</button></>}</header>
      <div className="flex items-center gap-2 border-b border-slate-200 p-2 md:hidden"><select aria-label="Choose conversation" value={activeId ?? ""} onChange={(e) => selectChat(e.target.value || null)} className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"><option value="">{showArchived ? "No archived chat selected" : "Select a conversation"}</option>{chats.filter((c) => c.archived === showArchived).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select><button type="button" onClick={() => setShowArchived((v) => !v)} className="rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-600">{showArchived ? "Chats" : "Archived"}</button><button type="button" aria-label="New conversation" onClick={() => void createChat()} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-bold text-white">+</button></div>
      <div className="flex-1 overflow-y-auto p-4">{!active ? <div className="flex h-full items-center justify-center text-sm text-slate-500">Start a new conversation.</div> : active.messages.map((m) => { const parts = splitCitations(m.content); return <div key={m.id} className={"mb-4 flex " + (m.role === "user" ? "justify-end" : "justify-start")}><div className={"max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap " + (m.role === "user" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-900")} dir="auto"><div>{parts.answer}{m.status === "pending" ? " …" : m.status === "failed" ? "\nMessage failed — send it again." : m.status === "unsaved" ? "\nNot saved to history." : ""}</div>{parts.sources.length > 0 && <div className="mt-3 border-t border-slate-300 pt-2 text-xs"><p className="mb-1 font-semibold">Sources</p><ul className="space-y-1">{parts.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{source.title}</a></li>)}</ul></div>}</div></div>; })}<div ref={endRef}/></div>
      <form onSubmit={submit} className="border-t border-slate-200 p-3"><label className="mb-2 flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800"><input type="checkbox" checked={liveWeb} onChange={(e) => setLiveWeb(e.target.checked)} className="accent-sky-600"/><span>Live web research</span><span className="font-normal text-sky-700">Search current web with Perplexity</span></label><div className="flex gap-2"><textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(input); } }} rows={1} placeholder="Ask Growth AI anything…" className="min-h-11 flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500" dir="auto"/><button disabled={busy || !input.trim()} className="self-end rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "…" : "Send"}</button></div><p className="mt-1 text-[10px] text-slate-400">Enter sends · Shift+Enter makes a new line</p></form>
    </main>
    {renameId && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4"><div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"><h3 className="font-semibold">Rename conversation</h3><input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void finishRename(); }} className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"/><div className="mt-3 flex justify-end gap-2"><button onClick={() => setRenameId(null)} className="rounded-lg px-3 py-2 text-sm">Cancel</button><button onClick={() => void finishRename()} className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white">Save</button></div></div></div>}
    {error && <div role="alert" className="fixed bottom-4 left-1/2 z-50 flex max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-xs text-white shadow-lg"><span>{error}</span><button type="button" aria-label="Dismiss" onClick={() => setError(null)} className="text-slate-300 hover:text-white">×</button></div>}
  </section>;
}
