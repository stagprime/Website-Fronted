"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Textarea, Toggle, api, fmtDate, money, toast } from "@/components/admin/kit";
import { TONE } from "../../orders/ui";
type D = { customer: { id: string; name: string | null; email: string; locale: string; emailVerified: string | null; disabled: boolean; notes: string | null; createdAt: string; lastLoginAt: string | null; totpEnabled: boolean }; orders: { id: string; title: string; amount: number; currency: string; status: string; createdAt: string; refundedAmount: number }[]; chats: { id: string; status: string; updatedAt: string; page: string | null }[]; forms: { id: string; formKey: string; createdAt: string; status: string }[]; ltv: number };
export default function UI({ id }: { id: string }) {
  const [d, setD] = useState<D | null>(null); const [notes, setNotes] = useState("");
  const load = async () => { const j = await api<D>(`/api/admin/customers?id=${id}`); if (j) { setD(j); setNotes(j.customer.notes || ""); } };
  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d) return <p className="text-sm text-slate-400">Loading…</p>;
  const c = d.customer; const save = async (body: Record<string, unknown>) => { if (await api("/api/admin/customers", { method: "PUT", body: { id, ...body } })) { toast("Saved"); load(); } };
  return <><Link href="/admin/customers" className="text-xs text-slate-400 hover:text-white">← Customers</Link>
    <div className="mb-6 mt-1 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-2xl font-bold text-white">{c.name || c.email}</h1><p className="text-sm text-slate-400">{c.email} · joined {fmtDate(c.createdAt)} · last login {fmtDate(c.lastLoginAt)} · {c.locale}</p></div>
      <div className="grid grid-cols-3 gap-3 text-center">{[["Lifetime value", money(d.ltv)], ["Orders", d.orders.length], ["Chats", d.chats.length]].map(([l, v]) => <div key={String(l)} className="rounded-xl border border-white/10 px-4 py-2"><p className="text-lg font-bold text-white">{v}</p><p className="text-[11px] uppercase text-slate-400">{l}</p></div>)}</div></div>
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]"><div className="grid gap-6">
      <Card title="Orders">{d.orders.length ? <ul className="grid gap-2">{d.orders.map(o => <li key={o.id}><Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm hover:bg-white/10"><span className="text-white">{o.title}<span className="block text-xs text-slate-500">{fmtDate(o.createdAt)}</span></span><span className="flex items-center gap-2">{money(o.amount, o.currency)}<Badge tone={TONE[o.status]}>{o.status.replace("_", " ")}</Badge></span></Link></li>)}</ul> : <p className="text-sm text-slate-400">No orders.</p>}</Card>
      <Card title="Conversations & forms"><ul className="grid gap-2 text-sm">{d.chats.map(ch => <li key={ch.id}><Link className="hover:text-sky-brand" href={`/admin/chat?id=${ch.id}`}>💬 Chat · {ch.status} · {fmtDate(ch.updatedAt)} {ch.page && <span className="text-slate-500">from {ch.page}</span>}</Link></li>)}{d.forms.map(f => <li key={f.id}><Link className="hover:text-sky-brand" href="/admin/forms">☐ {f.formKey} · {fmtDate(f.createdAt)}</Link></li>)}{!d.chats.length && !d.forms.length && <li className="text-slate-400">None.</li>}</ul></Card></div>
      <div className="grid content-start gap-6"><Card title="Private notes"><Textarea rows={8} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Only staff can see this." /><Button size="sm" className="mt-2" onClick={() => save({ notes })}>Save notes</Button></Card>
        <Card title="Account"><div className="grid gap-2 text-sm"><p>{c.emailVerified ? <Badge tone="green">email verified</Badge> : <Badge tone="amber">unverified</Badge>} {c.totpEnabled && <Badge tone="sky">2FA</Badge>}</p><Toggle checked={c.disabled} onChange={v => { if (!v || confirm("Disable this account? They won't be able to log in.")) save({ disabled: v }); }} label={c.disabled ? "Disabled" : "Active"} /></div></Card></div></div></>;
}
