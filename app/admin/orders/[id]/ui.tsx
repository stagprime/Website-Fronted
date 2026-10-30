"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Field, Input, Modal, Select, Textarea, Toggle, api, confirmTyped, fmtDate, money, toast } from "@/components/admin/kit";
import { TONE, LABEL } from "../ui";
type Ev = { id: string; status: string; note: string | null; kind: string; internal: boolean; actorId: string | null; createdAt: string };
type D = { order: { id: string; email: string; title: string; item: string; kind: string; amount: number; currency: string; status: string; progress: number; dueAt: string | null; deliveredAt: string | null; createdAt: string; refundedAmount: number; couponCode: string | null; requirements: unknown; assigneeId: string | null; stripePaymentId: string | null; locale: string; user: { id: string; name: string | null; email: string } | null; events: Ev[]; files: { id: string; name: string; kind: string; createdAt: string }[]; messages: { id: string; fromStaff: boolean; body: string; file: string | null; createdAt: string }[] }; people: { id: string; name: string | null; email: string }[]; team: { id: string; name: string | null; email: string }[]; customerOrders: number; stripe: boolean; url: string };
const STAT = ["pending", "in_progress", "delivered", "revision", "completed", "cancelled"];
export default function UI({ id }: { id: string }) {
  const [d, setD] = useState<D | null>(null); const [msg, setMsg] = useState(""); const [note, setNote] = useState(""); const [refund, setRefund] = useState(false); const [rf, setRf] = useState({ amount: "", reason: "", manual: false });
  const load = useCallback(async () => { const j = await api<D>(`/api/admin/orders?id=${id}`); if (j) setD(j); }, [id]);
  useEffect(() => { load(); }, [load]);
  const put = async (body: Record<string, unknown>, ok = "Saved") => { if (await api("/api/admin/orders", { method: "PUT", body: { id, ...body } })) { toast(ok); load(); return true; } return false; };
  if (!d) return <p className="text-sm text-slate-400">Loading order…</p>;
  const o = d.order; const who = (aid: string | null) => aid ? (d.people.find(p => p.id === aid)?.email || "staff") : "system";
  const late = o.dueAt && new Date(o.dueAt) < new Date() && ["pending", "in_progress", "revision"].includes(o.status);
  const left = o.amount - o.refundedAmount;
  const timeline = [...o.events.map(e => ({ at: e.createdAt, k: "e" as const, e })), ...o.messages.map(m => ({ at: m.createdAt, k: "m" as const, m }))].sort((a, b) => a.at.localeCompare(b.at));
  const upload = async (files: FileList | null, deliver: boolean) => { if (!files?.length) return; const fd = new FormData(); fd.set("id", id); for (const f of Array.from(files)) fd.append("file", f); if (deliver) fd.set("deliver", "1"); if (note) fd.set("note", note);
    if (await api("/api/admin/orders", { method: "POST", form: fd })) { toast(deliver ? "Delivered — client notified" : "Files uploaded"); setNote(""); load(); } };
  const doRefund = async () => { const cents = rf.amount ? Math.round(Number(rf.amount) * 100) : left; if (!(await confirmTyped("REFUND", `Refund ${money(cents, o.currency)} to ${o.email}? This cannot be undone.`))) return;
    const j = await api<{ full: boolean }>("/api/admin/orders", { method: "POST", body: { action: "refund", id, amount: cents, reason: rf.reason, manual: rf.manual } }); if (j) { toast(j.full ? "Fully refunded" : "Partial refund issued"); setRefund(false); load(); } };
  return <>
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><Link href="/admin/orders" className="text-xs text-slate-400 hover:text-white">← Orders</Link><h1 className="mt-1 font-display text-2xl font-bold text-white">{o.title}</h1>
      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-400"><Badge tone={TONE[o.status]}>{LABEL(o.status)}</Badge>{late && <Badge tone="red">late</Badge>}<code>{o.id}</code> · {o.item} · {fmtDate(o.createdAt)}</p></div>
      <div className="flex flex-wrap gap-2"><a href={`/api/admin/preview?path=${encodeURIComponent(`/${o.locale}/account/orders/${o.id}`)}`} target="_blank" rel="noreferrer"><Button kind="ghost" size="sm">Client view ↗</Button></a>{left > 0 && <Button kind="danger" size="sm" onClick={() => setRefund(true)}>Refund…</Button>}</div></div>
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-6">
        <Card title="Progress">
          <div className="flex items-center gap-3"><input aria-label="Progress percent" type="range" min={0} max={100} step={5} defaultValue={o.progress} onMouseUp={e => put({ action: "progress", progress: Number(e.currentTarget.value) }, "Progress updated")} onKeyUp={e => put({ action: "progress", progress: Number(e.currentTarget.value) }, "Progress updated")} className="flex-1 accent-sky-500" /><span className="w-12 text-right font-semibold text-white">{o.progress}%</span></div>
          <form className="mt-4 flex gap-2" onSubmit={async e => { e.preventDefault(); const t = (e.currentTarget.elements.namedItem("ms") as HTMLInputElement); if (await put({ action: "milestone", note: t.value, notify: true }, "Milestone posted & client notified")) t.value = ""; }}><Input name="ms" placeholder="Post a milestone the client sees (e.g. “Wireframes ready”)…" /><Button size="sm">Post</Button></form>
        </Card>
        <Card title="Timeline & messages">
          <ol className="grid gap-3">{timeline.map(t => t.k === "e" ? <li key={t.e.id} className={`rounded-xl border p-3 text-sm ${t.e.internal ? "border-amber-400/30 bg-amber-500/5" : "border-white/10"}`}><div className="flex flex-wrap items-center gap-2 text-xs text-slate-400"><Badge tone={t.e.internal ? "amber" : t.e.kind === "refund" ? "red" : "slate"}>{t.e.internal ? "internal note" : t.e.kind}</Badge>{t.e.kind === "status" && <Badge tone={TONE[t.e.status]}>{t.e.status.replace("_", " ")}</Badge>}{fmtDate(t.e.createdAt)} · {who(t.e.actorId)}</div>{t.e.note && <p className="mt-1 whitespace-pre-wrap text-slate-200">{t.e.note}</p>}</li>
            : <li key={t.m.id} className={`max-w-[85%] rounded-2xl p-3 text-sm ${t.m.fromStaff ? "ms-auto bg-sky-600/30" : "bg-white/10"}`}><p className="text-[11px] text-slate-400">{t.m.fromStaff ? "Team" : o.email} · {fmtDate(t.m.createdAt)}</p><p className="whitespace-pre-wrap text-white">{t.m.body}</p>{t.m.file && <p className="text-xs text-sky-200">📎 {t.m.file.split("/").pop()}</p>}</li>)}</ol>
          <div className="mt-4 grid gap-2"><Textarea rows={3} value={msg} onChange={e => setMsg(e.target.value)} placeholder="Message the client (emailed to them)…" /><div className="flex flex-wrap gap-2"><Button size="sm" disabled={!msg.trim()} onClick={async () => { if (await put({ action: "message", note: msg }, "Message sent")) setMsg(""); }}>Send to client</Button><Button size="sm" kind="ghost" disabled={!msg.trim()} onClick={async () => { if (await put({ action: "note", note: msg }, "Internal note added")) setMsg(""); }}>Add internal note</Button></div></div>
        </Card>
        <Card title="Deliver">
          <Textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Delivery note for the client (optional)" />
          <div className="mt-3 flex flex-wrap gap-2"><label className="cursor-pointer rounded-lg bg-gradient-to-r from-sky-brand to-blue-brand px-4 py-2 text-sm font-semibold text-white">Upload & mark delivered<input type="file" multiple className="sr-only" onChange={e => upload(e.target.files, true)} /></label><label className="cursor-pointer rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-sky-brand">Upload files only<input type="file" multiple className="sr-only" onChange={e => upload(e.target.files, false)} /></label></div>
          {!!o.files.length && <ul className="mt-4 grid gap-1 text-sm">{o.files.map(f => <li key={f.id} className="flex items-center justify-between rounded bg-white/5 px-3 py-1.5"><a className="hover:text-sky-brand" href={`/api/download?f=${f.id}`}>📎 {f.name}</a><span className="text-xs text-slate-500"><Badge>{f.kind}</Badge> {fmtDate(f.createdAt)}</span></li>)}</ul>}
        </Card>
        {o.requirements != null && <Card title="Requirements"><dl className="grid gap-2 text-sm">{typeof o.requirements === "object" ? Object.entries(o.requirements as Record<string, string>).map(([k, v]) => <div key={k}><dt className="text-xs uppercase text-slate-400">{k}</dt><dd className="whitespace-pre-wrap text-white">{String(v)}</dd></div>) : <pre className="whitespace-pre-wrap">{String(o.requirements)}</pre>}</dl></Card>}
      </div>
      <div className="grid content-start gap-6">
        <Card title="Status">
          <div className="grid gap-3"><Select aria-label="Order status" value={o.status} options={STAT.map(s => [s, LABEL(s)])} onChange={async e => { const s = e.target.value; const n = prompt(`Optional note for the client (status → ${s.replace("_", " ")}):`) ?? ""; await put({ action: "status", status: s, note: n }, "Status updated — client emailed"); }} disabled={o.status === "refunded"} />
            <Field label="Assignee"><Select value={o.assigneeId || ""} options={[["", "Unassigned"], ...d.team.map(t => [t.id, t.name || t.email] as [string, string])]} onChange={e => put({ action: "assign", assigneeId: e.target.value }, "Assigned")} /></Field>
            <Field label="Due date"><Input type="datetime-local" defaultValue={o.dueAt ? new Date(o.dueAt).toISOString().slice(0, 16) : ""} onBlur={e => put({ action: "due", dueAt: e.target.value || null }, "Due date saved")} /></Field>
            {o.status === "delivered" && o.deliveredAt && <p className="rounded-lg bg-purple-500/10 p-2 text-xs text-purple-200">Delivered {fmtDate(o.deliveredAt)}. Auto-completes after 3 days without a response (configurable).</p>}</div>
        </Card>
        <Card title="Payment"><dl className="grid gap-1 text-sm"><div className="flex justify-between"><dt className="text-slate-400">Amount</dt><dd className="text-white">{money(o.amount, o.currency)}</dd></div>{o.refundedAmount > 0 && <div className="flex justify-between"><dt className="text-slate-400">Refunded</dt><dd className="text-red-300">−{money(o.refundedAmount, o.currency)}</dd></div>}{o.couponCode && <div className="flex justify-between"><dt className="text-slate-400">Coupon</dt><dd><code>{o.couponCode}</code></dd></div>}<div className="flex justify-between"><dt className="text-slate-400">Stripe</dt><dd className="truncate text-xs">{o.stripePaymentId || "—"}</dd></div></dl></Card>
        <Card title="Customer"><p className="text-sm text-white">{o.user?.name || "—"}</p><p className="text-sm text-slate-400">{o.email}</p><p className="mt-2 text-xs text-slate-500">{d.customerOrders} order(s) total · locale {o.locale}</p>{o.user && <Link href={`/admin/customers/${o.user.id}`} className="mt-2 inline-block text-sm text-sky-brand">Customer 360 →</Link>}</Card>
      </div>
    </div>
    <Modal open={refund} onClose={() => setRefund(false)} title="Refund order">
      <div className="grid gap-3"><p className="text-sm text-slate-300">Refundable: <b>{money(left, o.currency)}</b>{d.stripe ? " via Stripe" : " — no Stripe payment on this order"}.</p>
        <Field label={`Amount (${o.currency.toUpperCase()})`} help="Empty = full remaining amount"><Input type="number" step="0.01" min="0.01" max={left / 100} value={rf.amount} onChange={e => setRf({ ...rf, amount: e.target.value })} /></Field>
        <Field label="Reason (shown in timeline)"><Input value={rf.reason} onChange={e => setRf({ ...rf, reason: e.target.value })} /></Field>
        {!d.stripe && <Toggle checked={rf.manual} onChange={v => setRf({ ...rf, manual: v })} label="Record a manual refund (paid outside Stripe)" />}
        <div className="flex justify-end gap-2"><Button kind="ghost" onClick={() => setRefund(false)}>Cancel</Button><Button kind="danger" onClick={doRefund}>Refund</Button></div></div>
    </Modal>
  </>;
}
