"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Conversation = {
  id: string;
  customer_name: string | null;
  customer_handle: string;
  customer_email: string | null;
  platform: string;
  intent: string | null;
  status: string;
  lead_score: number | null;
  last_message_at: string;
  title: string | null;
  urgency: string | null;
  assigned_to: string | null;
  email_subject?: string | null;
  thread_key?: string | null;
};

type Message = {
  id: string;
  conversation_id: string;
  author: string;
  direction: string;
  body: string;
  ai_confidence: number | null;
  created_at: string;
  delivered: boolean;
  delivery_status: string;
};

function timeAgo(iso: string) {
  const time = new Date(iso).getTime();
  if (!Number.isFinite(time)) return "";
  const mins = Math.max(0, Math.round((Date.now() - time) / 60000));
  if (mins < 1) return "now";
  if (mins < 60) return mins + "m";
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + "h";
  return Math.round(hrs / 24) + "d";
}

function initials(label: string) {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase() || "GI";
}

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4"><circle cx="10.8" cy="10.8" r="6.6" stroke="currentColor" strokeWidth="1.7" /><path d="m16 16 4.2 4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
}

function EnvelopeIcon({ className = "h-6 w-6" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}><rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" /><path d="m4.5 7 7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function InboxRealtime({
  initialConversations,
  initialMessages,
  selectedId,
  orgId,
  isDemo,
}: {
  initialConversations: Conversation[];
  initialMessages: Message[];
  selectedId: string | undefined;
  orgId: string | null;
  currentUserId: string | null;
  currentUserEmail: string | null;
  isDemo: boolean;
}) {
  const router = useRouter();
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState(initialMessages);
  const [composer, setComposer] = useState("");
  const [email, setEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [subject, setSubject] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "live" | "offline">("connecting");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "priority">("all");
  const selected = useMemo(() => conversations.find((c) => c.id === selectedId) ?? null, [conversations, selectedId]);
  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filter === "priority" && c.urgency !== "high") return false;
      if (!term) return true;
      return [c.customer_name, c.customer_email, c.customer_handle, c.email_subject, c.title, c.intent]
        .some((value) => value?.toLowerCase().includes(term));
    });
  }, [conversations, filter, search]);

  useEffect(() => setConversations(initialConversations), [initialConversations]);
  useEffect(() => setMessages(initialMessages), [initialMessages, selectedId]);

  // Read through a ref so switching conversations does not tear the socket
  // down (which dropped events during the gap and flashed "Reconnecting").
  const selectedIdRef = useRef(selectedId);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  useEffect(() => {
    if (!orgId) return;
    const supabase = createClient();
    let cancelled = false;
    let wasDown = false;
    const channel = supabase
      .channel("growth-inbox-" + orgId + "-" + Math.random().toString(36).slice(2))
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations", filter: "org_id=eq." + orgId }, (payload) => {
        const row = (payload.new || payload.old) as Conversation;
        if (!row?.id) return;
        setConversations((current) => {
          if (payload.eventType === "DELETE") return current.filter((c) => c.id !== row.id);
          const next = current.some((c) => c.id === row.id) ? current.map((c) => c.id === row.id ? { ...c, ...row } : c) : [row, ...current];
          return next.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()).slice(0, 100);
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: "org_id=eq." + orgId }, (payload) => {
        const row = (payload.new || payload.old) as Message;
        if (!row?.id) return;
        // DELETE payloads only carry the primary key, so apply them by id.
        if (payload.eventType === "DELETE") { setMessages((current) => current.filter((m) => m.id !== row.id)); return; }
        if (row.conversation_id !== selectedIdRef.current) return;
        setMessages((current) => current.some((m) => m.id === row.id) ? current.map((m) => m.id === row.id ? { ...m, ...row } : m) : [...current, row]);
      })
      .subscribe((status) => {
        if (cancelled) return; // ignore callbacks from a channel we already removed
        setRealtimeStatus(status === "SUBSCRIBED" ? "live" : status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED" ? "offline" : "connecting");
        if (status === "SUBSCRIBED") {
          // Re-fetch after a reconnect to close the gap while the socket was down.
          if (wasDown) router.refresh();
          wasDown = false;
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") wasDown = true;
      });
    return () => { cancelled = true; void supabase.removeChannel(channel); };
  }, [orgId, router]);

  async function sendMessage() {
    const body = composer.trim();
    if (!body || !selected || sending) return;
    setSending(true);
    setNotice(null);
    try {
      const res = await fetch("/api/inbox/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId: selected.id, body }) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Could not send message");
      setComposer("");
      if (data?.message) setMessages((current) => current.some((m: Message) => m.id === data.message.id) ? current : [...current, data.message]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not send message");
    } finally {
      setSending(false);
    }
  }

  async function startConversation() {
    const target = email.trim().toLowerCase();
    if (!target || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) { setNotice("Enter a valid customer email."); return; }
    if (!subject.trim()) { setNotice("Add an email subject."); return; }
    if (!composer.trim()) { setNotice("Write the email before sending."); return; }
    setSending(true);
    setNotice(null);
    try {
      const res = await fetch("/api/inbox/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: target, name: newName.trim() || null, subject: subject.trim(), body: composer.trim() }) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Could not send email");
      setEmail("");
      setNewName("");
      setSubject("");
      setComposer("");
      setShowNew(false);
      if (data?.conversation) setConversations((current) => [data.conversation, ...current.filter((c) => c.id !== data.conversation.id)]);
      if (data?.message) setMessages([data.message]);
      if (data?.conversation?.id) router.push("/dashboard/inbox?c=" + data.conversation.id);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not send email");
    } finally {
      setSending(false);
    }
  }

  const liveLabel = realtimeStatus === "live" ? "Live" : realtimeStatus === "connecting" ? "Connecting" : "Reconnecting";
  const liveStyle = realtimeStatus === "live" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : realtimeStatus === "connecting" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-rose-200 bg-rose-50 text-rose-700";

  const list = (
    <section aria-label="Conversation list" className="flex min-h-[420px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_35px_-28px_rgba(15,23,42,0.35)]">
      <div className="border-b border-slate-100 p-4">
        <div className="flex items-center justify-between">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Workspace inbox</p><h2 className="mt-1 text-base font-semibold text-slate-900">Conversations</h2></div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{conversations.length}</span>
        </div>
        <label className="mt-4 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-400 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
          <SearchIcon /><span className="sr-only">Search conversations</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people or subject" className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" />
          {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="rounded-md px-1 text-slate-400 hover:text-slate-700">×</button>}
        </label>
        <div className="mt-3 flex gap-2" role="group" aria-label="Conversation filters">
          <button type="button" onClick={() => setFilter("all")} aria-pressed={filter === "all"} className={"rounded-lg px-3 py-1.5 text-xs font-semibold transition " + (filter === "all" ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200" : "text-slate-500 hover:bg-slate-100")}>All</button>
          <button type="button" onClick={() => setFilter("priority")} aria-pressed={filter === "priority"} className={"rounded-lg px-3 py-1.5 text-xs font-semibold transition " + (filter === "priority" ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200" : "text-slate-500 hover:bg-slate-100")}>Priority</button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {filteredConversations.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><SearchIcon /></div><p className="mt-3 text-sm font-semibold text-slate-800">No conversations found</p><p className="mt-1 text-xs leading-5 text-slate-500">Try a different search or clear the priority filter.</p><button type="button" onClick={() => { setSearch(""); setFilter("all"); }} className="mt-3 text-xs font-semibold text-orange-700 hover:text-orange-800">Clear filters</button></div>
        ) : filteredConversations.map((conversation) => {
          const active = conversation.id === selectedId;
          const label = conversation.customer_name ?? conversation.customer_email ?? conversation.customer_handle;
          return <Link key={conversation.id} href={"/dashboard/inbox?c=" + conversation.id} aria-current={active ? "page" : undefined} className={"group mb-1 block rounded-xl border p-3 transition " + (active ? "border-orange-200 bg-orange-50/80 shadow-sm" : "border-transparent hover:border-slate-100 hover:bg-slate-50")}>
            <div className="flex items-start gap-3">
              <span className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold " + (active ? "bg-orange-100 text-orange-800" : "bg-slate-100 text-slate-600")}>{initials(label)}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-slate-900">{label}</span><span className="shrink-0 text-[10px] font-medium text-slate-400">{timeAgo(conversation.last_message_at)}</span></span>
                <span className="mt-1 block truncate text-xs text-slate-500">{conversation.email_subject ?? conversation.title ?? conversation.customer_email ?? conversation.customer_handle}</span>
                <span className="mt-2 flex items-center gap-1.5">
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">{conversation.platform}</span>
                  {conversation.urgency === "high" && <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-600">Priority</span>}
                </span>
              </span>
            </div>
          </Link>;
        })}
      </div>
      <div className="border-t border-slate-100 px-4 py-3"><div className="flex items-center gap-2 text-[11px] text-slate-500"><span className={"h-2 w-2 rounded-full " + (realtimeStatus === "live" ? "bg-emerald-500" : realtimeStatus === "offline" ? "bg-rose-500" : "animate-pulse bg-amber-500")} />{liveLabel} updates</div></div>
    </section>
  );

  const thread = selected ? (
    <section aria-label="Email conversation" className="flex min-h-[520px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_35px_-28px_rgba(15,23,42,0.35)]">
      <header className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/inbox" aria-label="Back to conversations" className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-50 xl:hidden">←</Link>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-800">{initials(selected.customer_name ?? selected.customer_email ?? selected.customer_handle)}</span>
          <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-slate-900">{selected.customer_name ?? selected.customer_email ?? selected.customer_handle}</div><div className="mt-0.5 truncate text-xs text-slate-500">{selected.customer_email ?? selected.customer_handle}</div></div>
          <span className={"hidden shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:inline-flex " + liveStyle}><span className="h-1.5 w-1.5 rounded-full bg-current" />{liveLabel}</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Subject</p><h2 className="mt-1 truncate text-sm font-semibold text-slate-800">{selected.email_subject ?? selected.title ?? "Email conversation"}</h2></div>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-semibold capitalize text-slate-600">{selected.status}</span>
        </div>
      </header>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-gradient-to-b from-white to-slate-50/70 px-4 py-5 sm:px-6">
        {messages.length === 0 ? <div className="flex h-full min-h-48 flex-col items-center justify-center text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100"><EnvelopeIcon /></span><p className="mt-3 text-sm font-semibold text-slate-800">No messages yet</p><p className="mt-1 text-xs text-slate-500">Your conversation will appear here.</p></div> : messages.map((message) => {
          const inbound = message.direction === "inbound";
          const ai = message.author === "ai";
          const authorLabel = ai ? "Growth AI" : inbound ? (selected.customer_name ?? "Customer") : "You";
          const deliveryLabel = message.delivery_status === "delivered" || message.delivered ? "Delivered" : message.delivery_status === "failed" ? "Not delivered" : message.delivery_status === "pending" ? "Sending" : message.delivery_status;
          return <div key={message.id} className={"flex " + (inbound ? "justify-start" : "justify-end")}>
            <div className={"flex max-w-[90%] items-end gap-2.5 sm:max-w-[82%] " + (inbound ? "" : "flex-row-reverse")}>
              <span className={"mb-5 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold sm:flex " + (inbound ? "bg-slate-100 text-slate-600" : ai ? "bg-violet-100 text-violet-700" : "bg-orange-100 text-orange-800")}>{initials(authorLabel)}</span>
              <div className="min-w-0">
                <div className={"mb-1.5 flex items-center gap-2 px-1 text-[10px] text-slate-400 " + (inbound ? "" : "justify-end")}><span className="font-semibold text-slate-500">{authorLabel}</span><span>{new Date(message.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span></div>
                <div className={"rounded-2xl border px-4 py-3 text-sm leading-6 shadow-sm " + (ai ? "border-violet-100 bg-violet-50 text-slate-800" : inbound ? "border-slate-200 bg-white text-slate-800" : "border-orange-100 bg-orange-50 text-slate-800")}><div className="whitespace-pre-wrap break-words" dir="auto">{message.body}</div></div>
                {!inbound && <div className={"mt-1.5 flex items-center gap-1.5 px-1 text-[10px] " + (message.delivery_status === "failed" ? "justify-end text-rose-600" : "justify-end text-slate-400")}><span>{deliveryLabel}</span><span aria-hidden="true">{message.delivery_status === "failed" ? "!" : message.delivered ? "✓✓" : "·"}</span></div>}
              </div>
            </div>
          </div>;
        })}
      </div>
      <div className="border-t border-slate-100 bg-white p-3 sm:p-4">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-50">
          <textarea value={composer} onChange={(event) => setComposer(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void sendMessage(); } }} placeholder="Write a reply…" aria-label="Write an email reply" className="min-h-20 max-h-40 w-full resize-y rounded-t-xl bg-transparent px-4 py-3 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400" />
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3 py-2.5">
            <p className="min-w-0 flex-1 text-[10px] leading-4 text-slate-400">Sent to their email and saved in this conversation.</p>
            <button type="button" disabled={sending || !composer.trim()} onClick={() => void sendMessage()} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-orange-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40"><span>{sending ? "Sending…" : "Send reply"}</span>{!sending && <span aria-hidden="true">↗</span>}</button>
          </div>
        </div>
        <p className="mt-2 px-1 text-[10px] text-slate-400">Enter to send <span className="px-1">·</span> Shift + Enter for a new line</p>
      </div>
    </section>
  ) : (
    <section aria-label="No conversation selected" className="hidden min-h-[520px] flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-8 text-center shadow-[0_12px_35px_-28px_rgba(15,23,42,0.35)] xl:flex">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-600"><EnvelopeIcon className="h-8 w-8" /></div><h2 className="mt-5 text-base font-semibold text-slate-900">Your inbox, in one place</h2><p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">Choose a conversation to reply, or start a new email. Sent messages stay saved in this workspace.</p>
      {!isDemo && <button type="button" onClick={() => { setNotice(null); setShowNew(true); }} className="mt-5 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700">Compose email</button>}
    </section>
  );

  return (
    <div className="w-full min-w-0 text-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold tracking-tight text-slate-950">Inbox</h1><span className={"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold " + liveStyle}><span className="h-1.5 w-1.5 rounded-full bg-current" />{liveLabel}</span></div><p className="mt-1.5 text-sm text-slate-500">Customer conversations with live updates and human + AI activity.</p></div>
        {!isDemo && <button type="button" onClick={() => { setNotice(null); setShowNew(true); }} className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200 sm:self-auto"><span aria-hidden="true" className="text-base leading-none">＋</span>Compose email</button>}
      </div>

      {notice && <div role="status" className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><span className="font-bold">!</span><p>{notice}</p></div>}

      <div className="mt-5 grid gap-3 xl:h-[calc(100dvh-220px)] xl:min-h-[540px] xl:grid-cols-[285px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)_250px]">{list}<div className={selectedId ? "block min-w-0" : "hidden min-w-0 xl:block"}>{thread}</div>
        {selected && <aside aria-label="Customer details" className="hidden min-w-0 space-y-3 2xl:block"><section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_35px_-28px_rgba(15,23,42,0.35)]"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Customer details</p><div className="mt-4 flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-800">{initials(selected.customer_name ?? selected.customer_email ?? selected.customer_handle)}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{selected.customer_name ?? "Customer"}</p><p className="truncate text-[11px] text-slate-500">{selected.customer_email ?? selected.customer_handle}</p></div></div><div className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-xs"><div className="flex items-center justify-between gap-3"><span className="text-slate-400">Channel</span><span className="capitalize text-slate-700">{selected.platform}</span></div><div className="flex items-center justify-between gap-3"><span className="text-slate-400">Status</span><span className="capitalize text-slate-700">{selected.status}</span></div>{selected.intent && <div className="flex items-center justify-between gap-3"><span className="text-slate-400">Intent</span><span className="max-w-[130px] truncate capitalize text-slate-700">{selected.intent}</span></div>}{selected.lead_score !== null && <div className="flex items-center justify-between gap-3"><span className="text-slate-400">Lead score</span><span className="font-semibold text-slate-700">{selected.lead_score}</span></div>}{selected.urgency && <div className="flex items-center justify-between gap-3"><span className="text-slate-400">Priority</span><span className="capitalize text-slate-700">{selected.urgency}</span></div>}{selected.assigned_to && <div className="flex items-center justify-between gap-3"><span className="text-slate-400">Assigned</span><span className="text-slate-700">Team member</span></div>}</div></section><section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_35px_-28px_rgba(15,23,42,0.35)]"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Latest activity</p><div className="mt-3 flex items-start gap-2.5"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500"/><div><p className="text-xs font-medium text-slate-700">Conversation updated</p><p className="mt-1 text-[10px] text-slate-400">{new Date(selected.last_message_at).toLocaleString()}</p></div></div></section></aside>}
      </div>

      {showNew && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowNew(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="compose-title" className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-2xl sm:p-6">
          <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><EnvelopeIcon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h2 id="compose-title" className="text-lg font-semibold text-slate-950">New email</h2><p className="mt-1 text-xs leading-5 text-slate-500">Send to their email address. A copy will be kept in this GrowthSpace conversation.</p></div><button type="button" onClick={() => setShowNew(false)} aria-label="Close compose window" className="rounded-lg px-2 py-1 text-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">×</button></div>
          <div className="mt-5 space-y-3"><label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">To</span><input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="customer@example.com" type="email" autoFocus className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-50" /></label><label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Customer name <span className="font-normal text-slate-400">(optional)</span></span><input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Name" className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-50" /></label><label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Subject</span><input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="What is this email about?" className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-50" /></label><label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Message</span><textarea value={composer} onChange={(event) => setComposer(event.target.value)} placeholder="Write your email…" className="min-h-36 w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-50" /></label></div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-[10px] leading-4 text-slate-400">The sent email and delivery status will be visible in the thread.</p><div className="flex gap-2"><button type="button" onClick={() => setShowNew(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Cancel</button><button type="button" disabled={sending || !email.trim() || !subject.trim() || !composer.trim()} onClick={() => void startConversation()} className="rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40">{sending ? "Sending…" : "Send email"}</button></div></div>
        </section>
      </div>}
    </div>
  );
}
