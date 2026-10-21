"use client";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import type { ChatProps } from "./Launcher";
type Msg = { id: string; sender: "visitor" | "ai" | "agent" | "system"; body: string; file?: string | null; createdAt: string };
type Conv = { id: string; status: string; name?: string | null } | null;
const inp = "w-full rounded-xl bg-navy-950/80 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-sky-brand focus:outline-none focus:ring-2 focus:ring-sky-brand/30";
export default function Panel({ t, locale, contact, greeting, onClose }: ChatProps & { onClose: () => void }) {
  const [conv, setConv] = useState<Conv>(null); const [msgs, setMsgs] = useState<Msg[]>([]); const [loading, setLoading] = useState(true);
  const [caps, setCaps] = useState({ ai: false, agents: false }); const [typing, setTyping] = useState<string | null>(null);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [lead, setLead] = useState(false);
  const list = useRef<HTMLDivElement>(null); const box = useRef<HTMLDivElement>(null); const lastType = useRef(0);
  const post = (b: Record<string, string>) => fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...b, locale }) }).then(r => r.json());
  useEffect(() => { fetch("/api/chat").then(r => r.json()).then(j => { setConv(j.conversation); setMsgs(j.messages || []); setCaps({ ai: j.ai, agents: j.agents }); setLoading(false); }); }, []);
  useEffect(() => { // real-time via SSE
    if (!conv) return; const es = new EventSource("/api/chat/stream"); let tm: ReturnType<typeof setTimeout>;
    es.onmessage = ev => { const e = JSON.parse(ev.data);
      if (e.type === "message") { setTyping(null); setMsgs(m => m.some(x => x.id === e.data.id) ? m : [...m, e.data]); }
      if (e.type === "typing" && e.data.who !== "visitor") { setTyping(e.data.who); clearTimeout(tm); tm = setTimeout(() => setTyping(null), 6000); }
      if (e.type === "status") setConv(c => c && { ...c, status: e.data.status }); };
    return () => es.close();
  }, [conv?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight }); }, [msgs, typing]);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); addEventListener("keydown", k); box.current?.querySelector<HTMLElement>("input,textarea,button")?.focus(); return () => removeEventListener("keydown", k); }, [onClose, loading]);
  const offline = !caps.ai && !caps.agents;
  async function start(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>; setBusy(true); setErr("");
    if (offline) { const j = await post({ ...fd, action: "offline", page: location.pathname }); setBusy(false); if (!j.ok) return setErr(j.error); track("Lead", { form: "chat-offline" }); return setLead(true); }
    const j = await post({ ...fd, action: "start", page: location.pathname }); setBusy(false); if (!j.ok) return setErr(j.error || t["Please enter your name and a valid email."]);
    document.cookie = "sp_chat_on=1;path=/;max-age=2592000;samesite=lax"; setConv(j.conversation); setCaps({ ai: j.ai, agents: j.agents }); track("Contact", { method: "live-chat" });
    if (fd.message) { await send(fd.message); }
  }
  async function send(text: string, file?: File) {
    setErr(""); let j;
    if (file) { const fd = new FormData(); fd.set("action", "send"); fd.set("body", text); fd.set("file", file); fd.set("locale", locale); j = await fetch("/api/chat", { method: "POST", body: fd }).then(r => r.json()); }
    else j = await post({ action: "send", body: text });
    if (!j.ok) setErr(j.error); else setMsgs(m => m.some(x => x.id === j.message.id) ? m : [...m, j.message]);
  }
  async function onSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget; const text = (f.elements.namedItem("body") as HTMLTextAreaElement).value.trim(); const file = (f.elements.namedItem("file") as HTMLInputElement).files?.[0];
    if (!text && !file) return; setBusy(true); await send(text, file); setBusy(false); f.reset();
  }
  const human = async () => { const j = await post({ action: "human" }); setConv(c => c && { ...c, status: "human" }); if (!j.agents) setCaps(c => ({ ...c, agents: false })); };
  const who = (s: string) => s === "visitor" ? t["You"] : s === "ai" ? t["Assistant"] : t["Stag Prime team"];
  const sys = (b: string) => b === "handoff" ? t["A team member has been notified and will reply here shortly."] : b === "handoff-offline" ? t["Our team is offline right now — leave a message and we'll email you back."] : b;
  return (
    <div ref={box} role="dialog" aria-modal="false" aria-label={t["Live chat"]} className="w-[min(94vw,23rem)] h-[min(78vh,36rem)] flex flex-col rounded-3xl bg-navy-900 border border-white/10 shadow-2xl shadow-black/60 overflow-hidden">
      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-brand to-navy-800 px-4 py-3">
        <img src="/emblem.svg" alt="" className="h-8 w-auto" /><div className="flex-1"><p className="font-display text-sm font-bold text-white">Stag Prime</p><p className="text-[11px] text-slate-200 flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${caps.agents || caps.ai ? "bg-area-lime" : "bg-slate-400"}`} />{t["Live chat"]}</p></div>
        <button onClick={onClose} aria-label={t["Close chat"]} className="grid place-items-center w-9 h-9 rounded-full hover:bg-white/10 text-white"><svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg></button>
      </div>
      {loading ? <div className="flex-1 grid place-items-center text-sm text-slate-300">…</div> : !conv || conv.status === "closed" ? (
        <div className="flex-1 overflow-y-auto p-5">
          <p data-testid="chat-greeting" className="font-display text-lg font-bold text-white">{greeting || t["Hi! How can we help?"]}</p>
          <p className="mt-1 text-sm text-slate-300">{conv?.status === "closed" ? t["This chat was closed. Start a new one any time."] : offline ? t["Our team is offline right now — leave a message and we'll email you back."] : t["Ask about services, packages, prices or Sentinel. We usually reply within minutes."]}</p>
          {lead ? <p role="status" className="mt-6 text-area-lime text-sm">{t["Thanks! We'll get back to you by email soon."]}</p> :
          <form onSubmit={start} className="mt-5 grid gap-3">
            <div aria-hidden className="absolute -left-[9999px]"><input name="website" tabIndex={-1} autoComplete="off" /></div>
            <label className="sr-only" htmlFor="cn">{t["Your name"]}</label><input id="cn" name="name" required placeholder={t["Your name"]} autoComplete="name" className={inp} />
            <label className="sr-only" htmlFor="ce">{t["Email"]}</label><input id="ce" name="email" type="email" required placeholder={t["Email"]} autoComplete="email" className={inp} />
            <label className="sr-only" htmlFor="cm">{t["Message"]}</label><textarea id="cm" name="message" rows={3} required={offline} placeholder={t["Type a message…"]} className={inp} />
            <button disabled={busy} className="rounded-full bg-gradient-to-r from-sky-brand to-blue-brand py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? t["Sending…"] : offline ? t["Send message"] : t["Start chat"]}</button>
            <p role="status" aria-live="polite" className="text-xs text-amber-300">{err}</p>
          </form>}
          <div className="mt-4 grid grid-cols-2 gap-2"><a href={contact.whatsapp} target="_blank" rel="noopener" onClick={() => track("Contact", { method: "whatsapp" })} className="rounded-full bg-[#178a3e] py-2 text-center text-xs font-semibold text-white">{t["Continue on WhatsApp"]}</a><a href={contact.telegram} target="_blank" rel="noopener" onClick={() => track("Contact", { method: "telegram" })} className="rounded-full bg-[#1b6fa0] py-2 text-center text-xs font-semibold text-white">{t["Continue on Telegram"]}</a></div>
        </div>) : (<>
        <div ref={list} className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite" aria-relevant="additions">
          {caps.ai && conv.status === "open" && <p className="text-center text-[11px] text-slate-400">{t["AI answers may be imperfect — ask for a person any time."]}</p>}
          {msgs.map(m => m.sender === "system" ? <p key={m.id} className="text-center text-xs text-sky-brand">{sys(m.body)}</p> :
            <div key={m.id} className={`max-w-[85%] ${m.sender === "visitor" ? "ms-auto text-end" : ""}`}><p className="text-[10px] text-slate-400 mb-0.5">{who(m.sender)}</p>
              <p className={`inline-block rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap text-start ${m.sender === "visitor" ? "bg-blue-brand text-white" : "bg-white/8 bg-navy-800 text-slate-100"}`}>{m.body}{m.file && <span className="block text-[11px] opacity-80">📎 {m.file.split("/").pop()}</span>}</p></div>)}
          {typing && <p className="text-xs text-slate-400">{typing === "ai" ? t["Assistant"] : t["Stag Prime team"]} {t["is typing…"]}</p>}
        </div>
        <div className="flex gap-2 px-3 pt-1 overflow-x-auto">
          {conv.status !== "human" && <button onClick={human} className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white hover:border-sky-brand">{t["Talk to a person"]}</button>}
          <a href={contact.whatsapp} target="_blank" rel="noopener" className="shrink-0 rounded-full bg-[#178a3e] px-3 py-1.5 text-xs font-semibold text-white">WhatsApp</a>
          <a href={contact.telegram} target="_blank" rel="noopener" className="shrink-0 rounded-full bg-[#1b6fa0] px-3 py-1.5 text-xs font-semibold text-white">Telegram</a>
        </div>
        <form onSubmit={onSend} className="p-3 flex items-end gap-2">
          <label className="grid place-items-center w-10 h-10 shrink-0 rounded-full border border-white/15 text-white cursor-pointer hover:border-sky-brand" title={t["Attach a file"]}><span aria-hidden>📎</span><span className="sr-only">{t["Attach a file"]}</span><input name="file" type="file" className="sr-only" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.zip,.txt" /></label>
          <label className="sr-only" htmlFor="cb">{t["Message"]}</label>
          <textarea id="cb" name="body" rows={1} placeholder={t["Type a message…"]} className={`${inp} resize-none`}
            onInput={() => { if (Date.now() - lastType.current > 3000) { lastType.current = Date.now(); post({ action: "typing" }); } }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} />
          <button disabled={busy} className="rounded-full bg-gradient-to-r from-sky-brand to-blue-brand px-4 h-10 text-sm font-semibold text-white disabled:opacity-60">{t["Send"]}</button>
        </form>
        {err && <p role="status" className="px-4 pb-2 text-xs text-amber-300">{err}</p>}
      </>)}
    </div>
  );
}
