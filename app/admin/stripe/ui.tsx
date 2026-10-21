"use client";
import { useEffect, useState } from "react";
import { Badge, Button, DataTable, PageHeader, api, fmtDate, money, toast } from "@/components/admin/kit";
type I = { id: string; name: string; amount: number; product: string | null; price: string | null; syncedAmount: number | null; syncedAt: string | null; state: string };
export default function UI() {
  const [d, setD] = useState<{ items: I[]; enabled: boolean; mode: string } | null>(null); const [busy, setBusy] = useState(false);
  const load = () => api<{ items: I[]; enabled: boolean; mode: string }>("/api/admin/stripe").then(setD); useEffect(() => { load(); }, []);
  const sync = async (ids?: string[]) => { setBusy(true); const j = await api<{ synced: number; errors: string[] }>("/api/admin/stripe", { method: "POST", body: { ids } }); setBusy(false); if (j) { toast(`Synced ${j.synced}${j.errors.length ? ` · ${j.errors.length} errors` : ""}`, j.errors.length ? "err" : "ok"); if (j.errors.length) console.warn(j.errors); load(); } };
  if (!d) return <p className="text-sm text-slate-400">Loading…</p>;
  const pending = d.items.filter(i => i.state !== "synced").length;
  return <><PageHeader title="Stripe sync" sub="Creates a Stripe Product + Price for every sellable catalog item (products, gig packages, deposits). When a price changes, a new Stripe Price is created and the old one archived. Checkout uses the synced price when it matches, otherwise inline pricing — so selling never breaks." actions={d.enabled ? <Button disabled={busy || !pending} onClick={() => sync()}>{busy ? "Syncing…" : `Sync ${pending} item(s)`}</Button> : undefined} />
    {!d.enabled ? <p className="mb-4 rounded-xl bg-amber-500/10 p-4 text-sm text-amber-200">Stripe is not configured. Set <code>STRIPE_SECRET_KEY</code> (and <code>STRIPE_WEBHOOK_SECRET</code>) in the server environment.</p> : <p className="mb-4 text-sm"><Badge tone={d.mode === "live" ? "red" : "sky"}>{d.mode} mode</Badge></p>}
    <DataTable rows={d.items} search={i => `${i.id} ${i.name}`} cols={[{ key: "name", label: "Item", sort: i => i.name, render: i => <><span className="text-white">{i.name}</span><code className="block text-xs text-slate-500">{i.id}</code></> }, { key: "amount", label: "Price", sort: i => i.amount, render: i => <>{money(i.amount)}{i.state === "changed" && <span className="block text-xs text-slate-500">Stripe: {money(i.syncedAmount || 0)}</span>}</> },
      { key: "state", label: "State", sort: i => i.state, render: i => <Badge tone={i.state === "synced" ? "green" : i.state === "changed" ? "amber" : "slate"}>{i.state}</Badge> }, { key: "price", label: "Stripe price", render: i => <code className="text-xs">{i.price || "—"}</code> }, { key: "syncedAt", label: "Synced", render: i => fmtDate(i.syncedAt) },
      { key: "a", label: "", render: i => d.enabled && i.state !== "synced" ? <Button size="sm" kind="ghost" disabled={busy} onClick={() => sync([i.id])}>Sync</Button> : null }]} /></>;
}
