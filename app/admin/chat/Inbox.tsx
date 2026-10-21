"use client";
import { useCallback, useEffect, useRef, useState } from "react";
type M = { id: string; sender: string; body: string; file?: string | null; createdAt: string };
type C = { id: string; name?: string; email?: string; status: string; locale: string; page?: string; updatedAt: string; messages: M[] };
/** Agent inbox: live list (SSE), conversation view, reply / close. Replying switches the chat from AI to human mode. */
export default function Inbox() {
  const [list, setList] = useState<C[]>([]); const [cur, setCur] = useState<C | null>(null); const [typing, setTyping] = useState(false); const [emailCopy, setEmailCopy] = useState(false);
  const curId = useRef<string | null>(null); curId.current = cur?.id ?? null;
  const load = useCallback(() => fetch("/api/admin/chat").then(r => r.json()).then(j => setList(j.conversations || [])), []);
  const open = (id: string) => fetch(`/api/admin/chat?id=${id}`).then(r => r.json()).then(j => setCur(j.conversation));
  useEffect(() => {
    load(); const es = new EventSource("/api/admin/chat/stream");
    es.onmessage = ev => { const e = JSON.parse(ev.data);
      if (e.type === "message") { load(); if (e.conversationId === curId.current) setCur(c => c && (c.messages.some(m => m.id === e.data.id) ? c : { ...c, messages: [...c.messages, e.data] })); if (e.data.sender === "visitor" && document.hidden) document.title = "● New chat message"; }
      if (e.type === "typing" && e.conversationId === curId.current && e.data.who === "visitor") { setTyping(true); setTimeout(() => setTyping(false), 5000); }
      if (e.type === "status") load(); };
    const v = () => { if (!document.hidden) document.title = "Stag Prime Admin"; }; document.addEventListener("visibilitychange", v);
    return () => { es.close(); document.removeEventListener("visibilitychange", v); };
  }, [load]);
  const act = (body: Record<string, unknown>) => fetch("/api/admin/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: cur?.id, ...body }) }).then(r => r.json());
  async function reply(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); const f = e.currentTarget; const body = (f.elements.namedItem("body") as HTMLTextAreaElement).value; if (!body.trim()) return; const j = await act({ action: "reply", body, email: emailCopy }); if (j.ok) { f.reset(); setCur(c => c && { ...c, status: "human", messages: c.messages.some(m => m.id === j.message.id) ? c.messages : [...c.messages, j.message] }); } }
  const badge = (s: string) => <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${s === "human" ? "bg-amber-400 text-navy-950" : s === "open" ? "bg-sky-500/20 text-sky-300" : "bg-white/10 text-slate-400"}`}>{s === "human" ? "needs agent" : s === "open" ? "AI" : s}</span>;
  return (
    <div className="grid lg:grid-cols-[20rem_1fr] gap-5 h-[calc(100vh-9rem)]">
      <ul className="overflow-y-auto rounded-2xl border border-white/10 bg-navy-900 divide-y divide-white/5">{list.map(c => (
        <li key={c.id}><button onClick={() => open(c.id)} className={`w-full text-start p-4 hover:bg-white/5 ${cur?.id === c.id ? "bg-white/5" : ""}`}>
          <div className="flex justify-between gap-2"><span className="font-semibold text-white truncate">{c.name || c.email || "Visitor"}</span>{badge(c.status)}</div>
          <p className="mt-1 text-xs text-slate-400 truncate">{c.messages[0]?.body || "—"}</p><p className="text-[10px] text-slate-500">{c.locale} · {new Date(c.updatedAt).toLocaleString()}</p></button></li>))}
        {!list.length && <li className="p-6 text-sm text-slate-400">No conversations yet.</li>}</ul>
      {cur ? <section className="flex flex-col rounded-2xl border border-white/10 bg-navy-900 min-h-0">
        <header className="flex flex-wrap items-center gap-3 border-b border-white/10 p-4"><div className="flex-1"><p className="font-semibold text-white">{cur.name} {badge(cur.status)}</p><p className="text-xs text-slate-400">{cur.email} · {cur.page}</p></div>
          {cur.status !== "closed" ? <button onClick={() => act({ action: "close" }).then(() => setCur({ ...cur, status: "closed" }))} className="rounded-full border border-white/15 px-4 py-1.5 text-xs">Close</button> : <button onClick={() => act({ action: "reopen" }).then(() => setCur({ ...cur, status: "open" }))} className="rounded-full border border-white/15 px-4 py-1.5 text-xs">Reopen</button>}</header>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">{cur.messages.map(m => <div key={m.id} className={`max-w-[80%] ${m.sender === "agent" ? "ms-auto text-end" : ""}`}><p className="text-[10px] text-slate-500">{m.sender} · {new Date(m.createdAt).toLocaleTimeString()}</p><p className={`inline-block whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm text-start ${m.sender === "agent" ? "bg-sky-600 text-white" : m.sender === "ai" ? "bg-violet-500/20" : m.sender === "system" ? "bg-transparent text-amber-300 text-xs" : "bg-white/10"}`}>{m.body}{m.file && <span className="block text-[11px] opacity-80">📎 {m.file}</span>}</p></div>)}
          {typing && <p className="text-xs text-slate-400">Visitor is typing…</p>}</div>
        <form onSubmit={reply} className="border-t border-white/10 p-3 grid gap-2"><label htmlFor="r" className="sr-only">Reply</label><textarea id="r" name="body" rows={2} onInput={() => act({ action: "typing" })} className="w-full rounded-xl bg-navy-950 border border-white/10 p-3 text-sm text-white" placeholder="Reply as Stag Prime team… (takes over from the AI)" />
          <div className="flex items-center gap-4"><button className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white">Send</button><label className="text-xs text-slate-400 flex gap-2"><input type="checkbox" checked={emailCopy} onChange={e => setEmailCopy(e.target.checked)} />Also email the visitor</label></div></form>
      </section> : <p className="text-slate-400">Select a conversation.</p>}
    </div>
  );
}
