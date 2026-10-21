"use client";
import { useEffect, useState } from "react";
import JsonEditor, { type Hint } from "./JsonEditor";
import { Button, Card, Badge, Tabs, Textarea, api, toast, fmtDate, confirmTyped } from "./kit";
type R = { key: string; value: unknown; default: unknown; overridden: boolean; canEdit: boolean; meta: { label: string; desc: string; i18n?: boolean }; revisions: { id: string; actor: string | null; createdAt: string }[] };
/** Structured editor for one Setting key with save, reset-to-default, revisions, raw JSON mode and unsaved-change guard. */
export function SettingEditor({ k, hints, extra }: { k: string; hints?: Record<string, Hint>; extra?: React.ReactNode }) {
  const [r, setR] = useState<R | null>(null); const [v, setV] = useState<unknown>(null); const [base, setBase] = useState(""); const [raw, setRaw] = useState(false); const [rawText, setRawText] = useState(""); const [busy, setBusy] = useState(false);
  const load = async () => { const j = await api<R>(`/api/admin/settings?key=${k}`); if (j) { setR(j); setV(j.value); setBase(JSON.stringify(j.value)); setRawText(JSON.stringify(j.value, null, 2)); } };
  useEffect(() => { load(); }, [k]); // eslint-disable-line react-hooks/exhaustive-deps
  const dirty = r != null && JSON.stringify(v) !== base;
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); } }; window.addEventListener("beforeunload", h); return () => window.removeEventListener("beforeunload", h); }, [dirty]);
  const put = async (body: Record<string, unknown>, msg: string) => { setBusy(true); const prev = r?.value; const j = await api<{ value: unknown }>("/api/admin/settings", { method: "PUT", body: { key: k, ...body } }); setBusy(false);
    if (j) { toast(msg, "ok", body.value !== undefined ? () => api("/api/admin/settings", { method: "PUT", body: { key: k, value: prev } }).then(load) : undefined); await load(); } };
  const save = () => { let val = v; if (raw) { try { val = JSON.parse(rawText); } catch { return toast("Raw JSON is invalid", "err"); } } put({ value: val }, `${r?.meta.label} saved — live on the site`); };
  if (!r) return <Card><p className="text-sm text-slate-400">Loading {k}…</p></Card>;
  return <Card title={<span className="flex items-center gap-2">{r.meta.label} {r.overridden ? <Badge tone="sky">customised</Badge> : <Badge>default</Badge>}{dirty && <Badge tone="amber">unsaved</Badge>}</span>}
    actions={<div className="flex flex-wrap gap-2">
      <Button size="sm" kind="subtle" onClick={() => { if (!raw) setRawText(JSON.stringify(v, null, 2)); else { try { setV(JSON.parse(rawText)); } catch { return toast("Raw JSON is invalid", "err"); } } setRaw(!raw); }}>{raw ? "Form" : "{ } JSON"}</Button>
      {r.overridden && r.canEdit && <Button size="sm" kind="ghost" onClick={async () => { if (await confirmTyped("RESET", `Reset ${r.meta.label} to the built-in default?`)) put({ reset: true }, "Reset to default"); }}>Reset</Button>}
      {r.canEdit && <Button size="sm" disabled={!dirty && !raw || busy} onClick={save}>{busy ? "Saving…" : "Save"}</Button>}
    </div>}>
    <p className="mb-4 text-sm text-slate-400">{r.meta.desc}{r.meta.i18n && " Text is entered in English; use 🌐 to edit the other 6 languages."}</p>
    {!r.canEdit && <p className="mb-3 rounded-lg bg-amber-500/10 p-2 text-xs text-amber-200">Read-only for your role.</p>}
    {extra}
    {raw ? <Textarea rows={24} className="font-mono text-xs" value={rawText} onChange={e => setRawText(e.target.value)} spellCheck={false} /> : <JsonEditor value={v} onChange={setV} hints={hints} i18n={!!r.meta.i18n} readOnly={!r.canEdit} />}
    {!!r.revisions.length && <details className="mt-5 text-sm"><summary className="cursor-pointer text-slate-400">Revision history ({r.revisions.length})</summary>
      <ul className="mt-2 grid gap-1">{r.revisions.map(x => <li key={x.id} className="flex items-center justify-between gap-2 rounded bg-white/5 px-2 py-1"><span className="text-slate-300">{fmtDate(x.createdAt)} · {x.actor || "system"}</span>{r.canEdit && <Button size="sm" kind="subtle" onClick={() => put({ revision: x.id }, "Revision restored")}>Restore</Button>}</li>)}</ul></details>}
  </Card>;
}
/** Tabbed group of settings editors (one tab per key). */
export function SettingTabs({ tabs, hints }: { tabs: [string, string][]; hints?: Record<string, Record<string, Hint>> }) {
  const [t, setT] = useState(tabs[0][0]);
  useEffect(() => { const h = location.hash.slice(1); if (tabs.some(x => x[0] === h)) setT(h); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <div className="grid gap-4"><Tabs tabs={tabs} value={t} onChange={x => { setT(x); history.replaceState(null, "", `#${x}`); }} /><SettingEditor key={t} k={t} hints={hints?.[t]} /></div>;
}
