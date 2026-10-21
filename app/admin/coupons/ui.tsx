"use client";
import ResourceManager from "@/components/admin/ResourceManager";
import { Badge, PageHeader, fmtDate, money } from "@/components/admin/kit";
type R = Record<string, unknown>;
export default function UI() {
  const live = (r: R) => !!r.active && (!r.endsAt || new Date(String(r.endsAt)) > new Date()) && (!r.startsAt || new Date(String(r.startsAt)) <= new Date()) && (r.maxRedemptions == null || Number(r.redeemed) < Number(r.maxRedemptions));
  return <><PageHeader title="Coupons & offers" sub="Codes customers enter at checkout. Validated and applied server-side; redemptions are counted when Stripe confirms payment. Fixed amounts are in cents (e.g. 1500 = $15)." />
    <ResourceManager res="coupon" cols={[
      { key: "code", label: "Code", sort: r => String(r.code), render: r => <code className="font-semibold text-white">{String(r.code)}</code> },
      { key: "value", label: "Discount", render: r => r.kind === "percent" ? `${r.value}%` : money(Number(r.value)) },
      { key: "appliesTo", label: "Applies to", render: r => String(r.appliesTo || "*") === "*" ? "Everything" : String(r.appliesTo) },
      { key: "redeemed", label: "Used", sort: r => Number(r.redeemed), render: r => `${r.redeemed}${r.maxRedemptions ? ` / ${r.maxRedemptions}` : ""}` },
      { key: "endsAt", label: "Ends", render: r => fmtDate(r.endsAt as string) },
      { key: "active", label: "Status", render: r => live(r) ? <Badge tone="green">live</Badge> : <Badge>{r.active ? "inactive window" : "off"}</Badge> },
    ]} fields={[
      { key: "code", label: "Code", placeholder: "LAUNCH20", help: "Letters/numbers, saved uppercase" }, { key: "kind", label: "Type", kind: "select", options: [["percent", "Percent off"], ["fixed", "Fixed amount off (cents)"]], def: "percent" },
      { key: "value", label: "Value", kind: "number", help: "Percent 1–100, or cents for fixed" }, { key: "appliesTo", label: "Applies to", def: "*", help: "* = all, or comma list: gig:, product:, gig:saas:basic, deposit:" },
      { key: "maxRedemptions", label: "Max redemptions", kind: "number", help: "Empty = unlimited" }, { key: "active", label: "Active", kind: "bool" },
      { key: "startsAt", label: "Starts", kind: "date" }, { key: "endsAt", label: "Ends", kind: "date" },
    ]} />
  </>;
}
