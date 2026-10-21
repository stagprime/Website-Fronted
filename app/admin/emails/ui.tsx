"use client";
import { useEffect, useState } from "react";
import { Badge, Button, Card, Field, Input, PageHeader, Tabs, Textarea, Toggle, api, toast } from "@/components/admin/kit";
type Def = { label: string; vars: string[]; subject: string; body: string }; type Row = { id: string; key: string; locale: string; subject: string; body: string; enabled: boolean };
const LOCS = ["en", "bn", "ar", "es", "fr", "de", "hi"];
export default function UI() {
  const [d, setD] = useState<{ defaults: Record<string, Def>; rows: Row[]; transport: string } | null>(null); const [key, setKey] = useState(""); const [loc, setLoc] = useState("en"); const [f, setF] = useState({ subject: "", body: "", enabled: true });
  const load = async () => { const j = await api<{ defaults: Record<string, Def>; rows: Row[]; transport: string }>("/api/admin/emails"); if (j) { setD(j); setKey(k => k || Object.keys(j.defaults)[0]); } };
  useEffect(() => { load(); }, []);
  const row = d?.rows.find(r => r.key === key && r.locale === loc); const def = d?.defaults[key];
  useEffect(() => { if (def) setF(row ? { subject: row.subject, body: row.body, enabled: row.enabled } : { subject: def.subject, body: def.body, enabled: true }); }, [key, loc, d]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = async () => { const j = await api(`/api/admin/r?res=emailTemplate`, { method: row ? "PUT" : "POST", body: { ...(row && { id: row.id }), key, locale: loc, ...f } }); if (j) { toast("Template saved"); load(); } };
  const reset = async () => { if (row && confirm("Remove this override and use the default?") && await api(`/api/admin/r?res=emailTemplate&id=${row.id}`, { method: "DELETE" })) { toast("Back to default"); load(); } };
  const test = async () => { const j = await api<{ sent: boolean; to: string }>("/api/admin/emails", { method: "POST", body: { key, locale: loc } }); if (j) toast(j.sent ? `Test sent to ${j.to}` : `No mail transport — test written to data/outbox.jsonl`); };
  if (!d || !def) return <p className="text-sm text-slate-400">Loading…</p>;
  return <><PageHeader title="Email templates" sub={<>Transactional emails sent to customers and your team. Use <code>{"{{variable}}"}</code> placeholders. A missing locale falls back to English. Transport: <b>{d.transport}</b>.</>} />
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <Card><ul className="grid gap-1">{Object.entries(d.defaults).map(([k, v]) => <li key={k}><button onClick={() => setKey(k)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${k === key ? "bg-sky-brand/15 text-white" : "text-slate-300 hover:bg-white/5"}`}>{v.label}<span className="block text-[11px] text-slate-500">{k} · {d.rows.filter(r => r.key === k).map(r => r.locale).join(", ") || "default"}</span></button></li>)}</ul></Card>
      <Card title={def.label} actions={<><Button size="sm" kind="ghost" onClick={test}>Send test to me</Button>{row && <Button size="sm" kind="ghost" onClick={reset}>Use default</Button>}<Button size="sm" onClick={save}>Save</Button></>}>
        <div className="mb-4"><Tabs tabs={LOCS.map(l => [l, <span key={l}>{l}{d.rows.some(r => r.key === key && r.locale === l) && " •"}</span>])} value={loc} onChange={setLoc} /></div>
        <div className="grid gap-4"><Field label="Subject"><Input dir={loc === "ar" ? "rtl" : "ltr"} value={f.subject} onChange={e => setF({ ...f, subject: e.target.value })} /></Field>
          <Field label="Body (plain text)"><Textarea dir={loc === "ar" ? "rtl" : "ltr"} rows={12} value={f.body} onChange={e => setF({ ...f, body: e.target.value })} /></Field>
          <Field label="Enabled" group><Toggle checked={f.enabled} onChange={v => setF({ ...f, enabled: v })} label={f.enabled ? "This override is used" : "Disabled — default is used"} /></Field>
          <p className="text-xs text-slate-400">Variables: {def.vars.map(v => <Badge key={v}>{`{{${v}}}`}</Badge>)}</p></div>
      </Card></div></>;
}
