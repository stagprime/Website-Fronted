"use client";
import { useEffect, useState } from "react";
import { Badge, DataTable, PageHeader, api, fmtDate, money } from "@/components/admin/kit";
type C = { id: string; name: string | null; email: string; createdAt: string; lastLoginAt: string | null; disabled: boolean; emailVerified: string | null; orders: number; ltv: number };
export default function UI() {
  const [rows, setRows] = useState<C[] | null>(null);
  useEffect(() => { api<{ customers: C[] }>("/api/admin/customers").then(j => setRows(j?.customers || [])); }, []);
  const exportCsv = () => { if (!rows) return; const csv = ["email,name,orders,ltv_usd,created,last_login", ...rows.map(r => [r.email, r.name || "", r.orders, (r.ltv / 100).toFixed(2), r.createdAt, r.lastLoginAt || ""].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n"); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "customers.csv"; a.click(); };
  return <><PageHeader title="Customers" sub="Registered client accounts with lifetime value (paid minus refunds)." actions={<button onClick={exportCsv} className="rounded-lg border border-white/15 px-3 py-2 text-sm hover:border-sky-brand">Export CSV</button>} />
    {!rows ? <p className="text-sm text-slate-400">Loading…</p> : <DataTable rows={rows} search={r => `${r.email} ${r.name}`} onRow={r => location.assign(`/admin/customers/${r.id}`)} cols={[
      { key: "email", label: "Customer", sort: r => r.email, render: r => <><span className="font-semibold text-white">{r.name || "—"}</span><span className="block text-xs text-slate-400">{r.email}</span></> },
      { key: "orders", label: "Orders", sort: r => r.orders }, { key: "ltv", label: "LTV", sort: r => r.ltv, render: r => money(r.ltv) },
      { key: "state", label: "State", render: r => r.disabled ? <Badge tone="red">disabled</Badge> : r.emailVerified ? <Badge tone="green">verified</Badge> : <Badge tone="amber">unverified</Badge> },
      { key: "createdAt", label: "Joined", sort: r => r.createdAt, render: r => fmtDate(r.createdAt) }, { key: "lastLoginAt", label: "Last login", sort: r => r.lastLoginAt || "", render: r => fmtDate(r.lastLoginAt) },
    ]} />}</>;
}
