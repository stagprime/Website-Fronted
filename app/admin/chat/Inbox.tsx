"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Input, Select, Tabs, api, toast } from "@/components/admin/kit";
type M = { id: string; sender: string; body: string; file?: string | null; createdAt: string };
type C = { id: string; name?: string; email?: string; status: string; locale: string; page?: string; updatedAt: string; assigneeId?: string | null; tags?: string | null; messages: M[] };
/** Agent inbox: live list (SSE), filters, assignment, tags, internal notes, canned + AI-suggested replies. Replying switches the chat from AI to human mode. */
export default function Inbox({ me, team, canned, ai }: { me: string; team: { id: string; label: string }[]; canned: string[]; ai: boolean }) {
  const [list, setList] = useState<C[]>([]); const [cur, setCur] = useState<C | null>(null); const [typing, setTyping] = useState(false); const [emailCopy, setEmailCopy] = useState(false);
  const [f, setF] = useState("needs"); const [q, setQ] = useState(""); const [text, setText] = useState(""); const [noteMode, setNoteMode] = useState(false);
  const curId = useRef<string | null>(null); curId.current = cur?.id ?? null;
  const load = useCallback(() => fetch("/api/admin/chat").then(r => r.json()).then(j => setList(j.conversations || [])), []);
  const open = useCallback((id: string) => fetch(`/api/admin/chat?id=${id}`).then(r => r.json()).then(j => { setCur(j.conversation); history.replaceState(null, "", `?id=${id}`); }), []);
  useEffect(() => {
    load(); const id = new URLSearchParams(location.search).get("id"); if (id) open(id);
    const es = new EventSource("/api/admin/chat/stream");
    es.onmessage = ev => { const e = JSON.parse(ev.data);
      if (e.type === "message") { load(); if (e.conversationId === curId.current) setCur(c => c && (c.messages.some(m => m.id === e.data.id) ? c : { ...c, messages: [...c.messages, e.data] })); if (e.data.sender === "visitor" && document.hidden) document.title = "● New chat message"; }
      if (e.type === "typing" && e.conversationId === curId.current && e.data.who === "visitor") { setTyping(true); setTimeout(() => setTyping(false), 5000); }
      if (e.type === "status") load(); };
    const v = () => { if (!document.hidden) document.title = "Stag Prime Admin"; }; document.addEventListener("visibilitychange", v);
    return () => { es.close(); document.removeEventListener("visibilitychange", v); };
  }, [load, open]);
  const act = (body: Record<string, unknown>) => api<Record<string, unknown>>("/api/admin/chat", { method: "POST", body: { id: cur?.id, ...body } });
  async function send() { if (!text.trim() || !cur) return;
    if (noteMode) { if (await act({ action: "note", body: text })) { setText(""); open(cur.id); toast("Internal note added"); } return; }
    const j = await act({ action: "reply", body: text, email: emailCopy }); if (j) { setText(""); const m = j.message as M; setCur(c => c && { ...c, status: "human", messages: c.messages.some(x => x.id === m.id) ? c.messages : [...c.messages, m] }); } }
  const badge = (s: string) => <Badge tone={s === "human" ? "amber" : s === "open" ? "sky" : "slate"}>{s === "human" ? "needs agent" : s === "open" ? "AI" : s}</Badge>;
  const shown = list.filter(c => (f === "all" || (f === "needs" && c.status === "human") || (f === "ai" && c.status === "open") || (f === "closed" && c.status === "closed") || (f === "mine" && c.assigneeId === me)) && (!q || JSON.stringify(c).toLowerCase().includes(q.toLowerCase())));
  const n = (s: string) => list.filter(c => c.status === s).length;
  return (
    <div className="grid h-[calc(100vh-9rem)] gap-5 lg:grid-cols-[22rem_1fr]">
      <div className="flex min-h-0 flex-col gap-2"><Tabs tabs={[["needs", `Needs agent (${n("human")})`], ["ai", `AI (${n("open")})`], ["mine", "Mine"], ["closed", "Closed"], ["all", "All"]]} value={f} onChange={setF} /><Input placeholder="Search name, email, tag…" value={q} onChange={e => setQ(e.target.value)} />
        <ul className="flex-1 divide-y divide-white/5 overflow-y-auto rounded-2xl border border-white/10 bg-navy-900">{shown.map(c => (
          <li key={c.id}><button onClick={() => open(c.id)} className={`w-full p-4 text-start hover:bg-white/5 ${cur?.id === c.id ? "bg-white/5" : ""}`}>
            <div className="flex justify-between gap-2"><span className="truncate font-semibold text-white">{c.name || c.email || "Visitor"}</span>{badge(c.status)}</div>
            <p className="mt-1 truncate text-xs text-slate-400">{c.messages[0]?.body || "—"}</p><p className="text-[10px] text-slate-500">{c.locale} · {new Date(c.updatedAt).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}{c.tags && ` · #${c.tags.split(",").join(" #")}`}</p></button></li>))}
          {!shown.length && <li className="p-6 text-sm text-slate-400">No conversations here.</li>}</ul></div>
      {cur ? <section className="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-navy-900">
        <header className="flex flex-wrap items-center gap-3 border-b border-white/10 p-4"><div className="min-w-0 flex-1"><p className="font-semibold text-white">{cur.name || "Visitor"} {badge(cur.status)}</p><p className="truncate text-xs text-slate-400">{cur.email} · {cur.page} · {cur.locale}</p></div>
          <Select aria-label="Assignee" className="!w-40" value={cur.assigneeId || ""} options={[["", "Unassigned"], ...team.map(t => [t.id, t.label] as [string, string])]} onChange={async e => { const v = e.target.value; if (await act({ action: "assign", assigneeId: v })) { setCur({ ...cur, assigneeId: v }); load(); } }} />
          <Input aria-label="Tags" className="!w-40" defaultValue={cur.tags || ""} key={cur.id} placeholder="tags, comma" onBlur={async e => { const j = await act({ action: "tags", tags: e.target.value }); if (j) { setCur({ ...cur, tags: String(j.tags || "") }); load(); } }} />
          {cur.status !== "closed" ? <Button size="sm" kind="ghost" onClick={() => act({ action: "close" }).then(() => { setCur({ ...cur, status: "closed" }); load(); })}>Close</Button> : <Button size="sm" kind="ghost" onClick={() => act({ action: "reopen" }).then(() => { setCur({ ...cur, status: "open" }); load(); })}>Reopen</Button>}</header>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">{cur.messages.map(m => <div key={m.id} className={`max-w-[80%] ${m.sender === "agent" ? "ms-auto text-end" : m.sender === "note" ? "mx-auto text-center" : ""}`}><p className="text-[10px] text-slate-500">{m.sender === "note" ? "internal note" : m.sender} · {new Date(m.createdAt).toLocaleTimeString("en-GB", { timeZone: "Asia/Dhaka" })}</p><p className={`inline-block whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-start text-sm ${m.sender === "agent" ? "bg-sky-600 text-white" : m.sender === "ai" ? "bg-violet-500/20" : m.sender === "note" ? "border border-amber-400/30 bg-amber-500/10 text-amber-100" : m.sender === "system" ? "bg-transparent text-xs text-amber-300" : "bg-white/10"}`}>{m.body}{m.file && <span className="block text-[11px] opacity-80">📎 {m.file}</span>}</p></div>)}
          {typing && <p className="text-xs text-slate-400">Visitor is typing…</p>}</div>
        <form onSubmit={e => { e.preventDefault(); send(); }} className="grid gap-2 border-t border-white/10 p-3">
          {!!canned.length && <div className="flex flex-wrap gap-1">{canned.map((c, i) => <button type="button" key={i} onClick={() => setText(c)} className="max-w-[16rem] truncate rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10">{c}</button>)}</div>}
          <label htmlFor="r" className="sr-only">Reply</label><textarea id="r" value={text} onChange={e => setText(e.target.value)} rows={2} onInput={() => !noteMode && act({ action: "typing" })} onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }} className={`w-full rounded-xl border p-3 text-sm text-white ${noteMode ? "border-amber-400/40 bg-amber-500/5" : "border-white/10 bg-navy-950"}`} placeholder={noteMode ? "Internal note — the visitor never sees this" : "Reply as the team… (takes over from the AI) · Ctrl/⌘+Enter to send"} />
          <div className="flex flex-wrap items-center gap-3"><Button size="sm">{noteMode ? "Add note" : "Send"}</Button><label className="flex gap-2 text-xs text-slate-400"><input type="checkbox" checked={noteMode} onChange={e => setNoteMode(e.target.checked)} />Internal note</label>{!noteMode && <label className="flex gap-2 text-xs text-slate-400"><input type="checkbox" checked={emailCopy} onChange={e => setEmailCopy(e.target.checked)} />Also email the visitor</label>}
            {ai && <Button type="button" size="sm" kind="ghost" onClick={async () => { const j = await act({ action: "suggest" }); if (j?.suggestion) setText(String(j.suggestion)); }}>✨ Suggest reply</Button>}</div></form>
      </section> : <p className="text-slate-400">Select a conversation.</p>}
    </div>
  );
}
