"use client";
import { useEffect, useState } from "react";
import { SettingTabs } from "@/components/admin/SettingEditor";
import { Badge, Button, Card, PageHeader, api } from "@/components/admin/kit";
type H = { checks: { id: string; value: string | null; source: string | null; validFormat: boolean | null; hint: string; inHtml: boolean | null }[]; consent: { enabled: boolean }; server: Record<string, boolean>; htmlFetched: boolean };
export default function UI() {
  const [h, setH] = useState<H | null>(null); const run = () => { setH(null); api<H>("/api/admin/tracking").then(setH); }; useEffect(run, []);
  return <><PageHeader title="Tracking & consent" sub="Public tag IDs (GA4, GTM, Meta Pixel, Google Ads, TikTok, LinkedIn). Values here override env vars and go live on save. Tags load only after consent when the banner is enabled (Consent Mode v2)." />
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]"><SettingTabs tabs={[["tracking", "Tracking IDs"], ["consent", "Consent banner"]]} />
      <Card title="Health check" actions={<Button size="sm" kind="ghost" onClick={run}>Re-run</Button>}>{!h ? <p className="text-sm text-slate-400">Checking…</p> : <div className="grid gap-2 text-sm">
        {h.checks.map(c => <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2"><span><b className="uppercase text-white">{c.id}</b><span className="block text-xs text-slate-400">{c.value ? <code>{c.value}</code> : "not set"}{c.source && ` · from ${c.source}`}</span></span>
          <span className="flex gap-1">{c.value == null ? <Badge>off</Badge> : <>{c.validFormat ? <Badge tone="green">format ok</Badge> : <Badge tone="red">expected {c.hint}</Badge>}{c.inHtml === true ? <Badge tone="green">in page</Badge> : c.inHtml === false ? <Badge tone="amber">not in HTML</Badge> : null}</>}</span></div>)}
        <p className="mt-2 text-xs text-slate-400">Consent banner: {h.consent.enabled ? "on (tags wait for consent)" : "off"}. Server-side: {Object.entries(h.server).map(([k, v]) => <span key={k} className="me-2"><code>{k}</code> {v ? "✓" : "✗"}</span>)}</p>
        {!h.htmlFetched && <p className="text-xs text-amber-200">Couldn’t fetch the homepage from the server to verify tags.</p>}</div>}</Card></div></>;
}
