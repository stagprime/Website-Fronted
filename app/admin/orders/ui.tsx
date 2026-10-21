"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, DataTable, PageHeader, Tabs, api, fmtDate, money } from "@/components/admin/kit";
export type O = { id: string; email: string; title: string; item: string; kind: string; amount: number; currency: string; status: string; progress: number; dueAt: string | null; deliveredAt: string | null; createdAt: string; refundedAmount: number; couponCode: string | null };
export const TONE: Record<string, "slate" | "sky" | "green" | "amber" | "red" | "purple"> = { pending: "amber", in_progress: "sky", delivered: "purple", revision: "amber", completed: "green", cancelled: "slate", refunded: "red" };
export default function UI() {
  const [st, setSt] = useState("active"); const [d, setD] = useState<{ orders: O[]; counts: Record<string, number> } | null>(null);
  useEffect(() => { setD(null); api<{ orders: O[]; counts: Record<string, number> }>(`/api/admin/orders?status=${st}`).then(setD); }, [st]);
  const late = (o: O) => o.dueAt && new Date(o.dueAt) < new Date() && ["pending", "in_progress", "revision"].includes(o.status);
  const c = d?.counts || {};
  return <><PageHeader title="Orders" sub="Every purchase, gig and subscription. Delivered orders auto-complete after the number of days set in Site settings → Orders (default 3) if the client doesn't respond." />
    <div className="mb-4"><Tabs tabs={[["active", `Active (${(c.pending || 0) + (c.in_progress || 0) + (c.revision || 0) + (c.delivered || 0)})`], ["pending", `Needs requirements (${c.pending || 0})`], ["in_progress", `In progress (${c.in_progress || 0})`], ["revision", `Revision (${c.revision || 0})`], ["delivered", `Delivered (${c.delivered || 0})`], ["completed", `Completed (${c.completed || 0})`], ["refunded", "Refunded"], ["cancelled", "Cancelled"], ["", "All"]]} value={st} onChange={setSt} /></div>
    {!d ? <p className="text-sm text-slate-400">Loading…</p> : <DataTable rows={d.orders} search={o => `${o.id} ${o.email} ${o.title} ${o.item}`} onRow={o => location.assign(`/admin/orders/${o.id}`)} cols={[
      { key: "createdAt", label: "Date", sort: o => o.createdAt, render: o => <span className="whitespace-nowrap text-xs">{fmtDate(o.createdAt)}</span> },
      { key: "title", label: "Order", render: o => <Link href={`/admin/orders/${o.id}`} className="font-semibold text-white hover:text-sky-brand">{o.title}<span className="block text-xs font-normal text-slate-500">{o.item}</span></Link> },
      { key: "email", label: "Customer", sort: o => o.email },
      { key: "amount", label: "Amount", sort: o => o.amount, render: o => <>{money(o.amount, o.currency)}{o.refundedAmount > 0 && <span className="block text-xs text-red-300">−{money(o.refundedAmount, o.currency)}</span>}</> },
      { key: "status", label: "Status", sort: o => o.status, render: o => <span className="flex flex-col gap-1"><Badge tone={TONE[o.status]}>{o.status.replace("_", " ")}</Badge>{late(o) && <Badge tone="red">late</Badge>}</span> },
      { key: "progress", label: "Progress", sort: o => o.progress, render: o => <div className="h-1.5 w-24 rounded bg-white/10"><div className="h-full rounded bg-sky-brand" style={{ width: `${o.progress}%` }} /></div> },
      { key: "dueAt", label: "Due", sort: o => o.dueAt || "", render: o => <span className="text-xs">{o.dueAt ? fmtDate(o.dueAt) : "—"}</span> },
    ]} />}
  </>;
}
