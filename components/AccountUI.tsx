"use client";
import { useState } from "react";
type FT = Record<string, string>; const tf = (t: FT, k: string) => t[k] ?? k;
const inp = "w-full rounded-xl bg-navy-950/70 border border-white/10 px-4 py-3 text-white focus:border-sky-brand focus:outline-none focus:ring-2 focus:ring-sky-brand/30";
function useAction(t: FT) {
  const [st, setSt] = useState<{ s: string; m?: string }>({ s: "idle" });
  async function send(fd: FormData, url = "/api/orders", json = false) {
    setSt({ s: "busy" });
    try { const r = await fetch(url, json ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(fd)) } : { method: "POST", body: fd }); const j = await r.json(); if (!j.ok) setSt({ s: "err", m: j.error }); else { setSt({ s: "ok", m: tf(t, "Saved.") }); setTimeout(() => location.reload(), 600); } }
    catch { setSt({ s: "err", m: tf(t, "Network error — please use WhatsApp or email.") }); }
  }
  const msg = <p role="status" aria-live="polite" className={`text-sm ${st.s === "ok" ? "text-area-lime" : "text-amber-300"}`}>{st.m}</p>;
  return { send, busy: st.s === "busy", msg };
}
const Btn = ({ busy, children, t }: { busy: boolean; children: React.ReactNode; t: FT }) => <button disabled={busy} className="rounded-full bg-gradient-to-r from-sky-brand to-blue-brand px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? tf(t, "Sending…") : children}</button>;
export function RequirementsForm({ orderId, questions, t }: { orderId: string; questions: string[]; t: FT }) {
  const { send, busy, msg } = useAction(t);
  return <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set("orderId", orderId); fd.set("action", "requirements"); send(fd); }} className="grid gap-4">
    {questions.map((q, i) => <div key={q}><label htmlFor={`rq${i}`} className="block text-sm text-slate-300 mb-1.5">{q}</label><textarea id={`rq${i}`} name={`q_${q}`} rows={2} required={i < 2} className={inp} /></div>)}
    <div><label htmlFor="rqf" className="block text-sm text-slate-300 mb-1.5">{tf(t, "Attach files (optional)")}</label><input id="rqf" name="file" type="file" className={inp} /></div>
    <div className="flex items-center gap-4"><Btn busy={busy} t={t}>{tf(t, "Submit requirements")}</Btn>{msg}</div></form>;
}
export function MessageForm({ orderId, t }: { orderId: string; t: FT }) {
  const { send, busy, msg } = useAction(t);
  return <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set("orderId", orderId); fd.set("action", "message"); send(fd); }} className="grid gap-3">
    <label htmlFor="mb" className="sr-only">{tf(t, "Message")}</label><textarea id="mb" name="body" rows={3} className={inp} placeholder={tf(t, "Write a message to our team…")} />
    <div className="flex flex-wrap items-center gap-3"><label className="text-sm text-slate-300">{tf(t, "Attach a file")} <input name="file" type="file" className="ms-2 text-xs" /></label><Btn busy={busy} t={t}>{tf(t, "Send")}</Btn>{msg}</div></form>;
}
export function DeliveryActions({ orderId, t }: { orderId: string; t: FT }) {
  const { send, busy, msg } = useAction(t);
  const go = (action: string, note?: string) => { const fd = new FormData(); fd.set("orderId", orderId); fd.set("action", action); if (note) fd.set("note", note); send(fd); };
  return <div className="flex flex-wrap items-center gap-3"><button disabled={busy} onClick={() => go("accept")} className="rounded-full bg-area-lime/90 px-5 py-2.5 text-sm font-semibold text-navy-950">{tf(t, "Accept delivery")}</button>
    <button disabled={busy} onClick={() => { const n = prompt(tf(t, "What should we change?")); if (n) go("revision", n); }} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white">{tf(t, "Request a revision")}</button>{msg}</div>;
}
export function ProfileForm({ name, locale, names, t }: { name: string; locale: string; names: Record<string, string>; t: FT }) {
  const { send, busy, msg } = useAction(t);
  return <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set("action", "profile"); send(fd, "/api/account", true); }} className="grid sm:grid-cols-[1fr_12rem_auto] gap-3 items-end">
    <div><label htmlFor="pn" className="block text-sm text-slate-300 mb-1.5">{tf(t, "Full name")}</label><input id="pn" name="name" defaultValue={name} className={inp} /></div>
    <div><label htmlFor="pl" className="block text-sm text-slate-300 mb-1.5">{tf(t, "Language")}</label><select id="pl" name="locale" defaultValue={locale} className={inp}>{Object.entries(names).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
    <Btn busy={busy} t={t}>{tf(t, "Save")}</Btn><div className="sm:col-span-3">{msg}</div></form>;
}
export function TokenForm({ kind, email, token, locale, t }: { kind: "verify" | "reset"; email: string; token: string; locale: string; t: FT }) {
  const [st, setSt] = useState<{ s: string; m?: string }>({ s: "idle" });
  async function go(password?: string) {
    setSt({ s: "busy" }); const r = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: kind, email, token, password, locale }) }); const j = await r.json();
    setSt(j.ok ? { s: "ok", m: tf(t, kind === "verify" ? "Email verified — you can log in now." : "Password updated — you can log in now.") } : { s: "err", m: j.error });
  }
  return <div className="grid gap-4">
    {kind === "reset" ? <form onSubmit={e => { e.preventDefault(); go(String(new FormData(e.currentTarget).get("password"))); }} className="grid gap-3"><label htmlFor="np" className="text-sm text-slate-300">{tf(t, "New password")}</label><input id="np" name="password" type="password" minLength={8} required autoComplete="new-password" className={inp} /><Btn busy={st.s === "busy"} t={t}>{tf(t, "Set new password")}</Btn></form>
      : st.s === "idle" ? <Btn busy={false} t={t}><span onClick={() => go()}>{tf(t, "Verify my email")}</span></Btn> : null}
    <p role="status" aria-live="polite" className={st.s === "ok" ? "text-area-lime" : "text-amber-300"}>{st.m}</p>
    {st.s === "ok" && <a href={`/${locale}/login`} className="font-semibold text-sky-brand">{tf(t, "Login")} →</a>}
  </div>;
}
