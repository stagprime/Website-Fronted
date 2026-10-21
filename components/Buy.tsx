"use client";
import { useState } from "react";
import { track } from "@/lib/analytics";
// Stripe Checkout button. Falls back to the contact page (with a message) when checkout isn't configured.
export function BuyButton({ id, label, busy, locale, amount, className, cursor }: { id: string; label: string; busy: string; locale: string; amount?: number; className?: string; cursor?: string }) {
  const [s, setS] = useState<"idle" | "busy" | string>("idle");
  async function go() {
    setS("busy"); track("InitiateCheckout", { content_ids: [id], value: amount, currency: "USD" });
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, amount, locale }) });
      const j = await r.json();
      if (j.url) { location.href = j.url; return; }
      setS(j.error || "Error"); if (j.fallback) setTimeout(() => { location.href = j.fallback; }, 2200);
    } catch { setS("Network error"); }
  }
  return (<span className="inline-flex flex-col items-start gap-1">
    <button type="button" onClick={go} disabled={s === "busy"} data-cursor={cursor} className={className || "rounded-full bg-gradient-to-r from-sky-brand to-blue-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"}>{s === "busy" ? busy : label}</button>
    {s !== "idle" && s !== "busy" && <span role="status" className="text-xs text-amber-300 max-w-[16rem]">{s}</span>}
  </span>);
}
export function DonateBox({ tiers, locale, t }: { tiers: number[]; locale: string; t: Record<string, string> }) {
  const [a, setA] = useState(25);
  return (
    <div className="rounded-3xl bg-navy-900 text-white p-7">
      <p className="font-display text-lg font-bold">{t.title}</p>
      <div className="mt-5 flex flex-wrap gap-2" role="radiogroup" aria-label={t.amount}>
        {tiers.map(x => <button key={x} type="button" role="radio" aria-checked={a === x} onClick={() => setA(x)} className={`rounded-full px-4 py-2 text-sm font-semibold border ${a === x ? "bg-sky-brand text-navy-950 border-sky-brand" : "border-white/20 text-white"}`}>${x}</button>)}
      </div>
      <label className="mt-4 block text-sm text-slate-300">{t.custom}<input type="number" min={5} max={10000} value={a} onChange={e => setA(Number(e.target.value))} className="mt-1 w-40 rounded-xl bg-navy-950 border border-white/15 px-3 py-2 text-white" /></label>
      <div className="mt-6"><BuyButton id="donation" amount={a} locale={locale} label={`${t.cta} $${a}`} busy={t.busy} /></div>
      <p className="mt-4 text-xs text-slate-400">{t.note}</p>
    </div>
  );
}
