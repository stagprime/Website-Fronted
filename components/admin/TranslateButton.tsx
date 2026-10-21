"use client";
import { useState } from "react";
import { Button, Modal, Textarea, Badge, api, toast } from "./kit";
type E = { key: string; en: string; ai: boolean; values: Record<string, { built: string; override: string | null; status: string | null }> };
const NAMES: Record<string, string> = { en: "English", bn: "বাংলা", ar: "العربية", es: "Español", fr: "Français", de: "Deutsch", hi: "हिन्दी" };
/** 🌐 — edit the 7 locale versions of one string (UiString overrides). Text must be saved in English first. */
export default function TranslateButton({ text, k }: { text?: string; k?: string }) {
  const [open, setOpen] = useState(false); const [e, setE] = useState<E | null>(null); const [vals, setVals] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false);
  const load = async () => { setOpen(true); const r = await api<E>(`/api/admin/ui?${k ? `key=${encodeURIComponent(k)}` : `text=${encodeURIComponent(text || "")}`}`); if (r) { setE(r); setVals(Object.fromEntries(Object.entries(r.values).map(([l, v]) => [l, v.override ?? v.built]))); } };
  const save = async (l: string) => { if (!e) return; if (await api("/api/admin/ui", { method: "PUT", body: { key: e.key, locale: l, value: vals[l] } })) toast(`${NAMES[l]} saved`); };
  const ai = async () => { if (!e) return; setBusy(true); const r = await api<{ drafts: Record<string, string> }>("/api/admin/ui", { method: "POST", body: { key: e.key, en: text || e.en, locales: Object.keys(vals).filter(l => l !== "en" && !vals[l]) } }); setBusy(false); if (r) { setVals(v => ({ ...v, ...r.drafts })); toast(`AI drafted ${Object.keys(r.drafts).length} — review before publishing`); } };
  return <>
    <Button type="button" size="sm" kind="subtle" title="Translations" aria-label="Translations" onClick={load}>🌐</Button>
    <Modal open={open} onClose={() => setOpen(false)} title="Translations" wide>
      {!e ? <p className="text-sm text-slate-400">Loading…</p> : <div className="grid gap-3">
        <p className="text-xs text-slate-400">Key <code>{e.key}</code>. Leave a locale empty to use the built-in translation (or English). Save the English text in the form first if you just changed it.</p>
        {e.ai && <div><Button type="button" size="sm" kind="ghost" disabled={busy} onClick={ai}>{busy ? "Drafting…" : "✨ AI-draft empty locales"}</Button></div>}
        {Object.keys(e.values).map(l => <div key={l} className="grid gap-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">{NAMES[l]} <code className="text-slate-500">{l}</code>{e.values[l].status === "ai_draft" && <Badge tone="amber">AI draft</Badge>}{e.values[l].override != null && <Badge tone="sky">custom</Badge>}</div>
          <div className="flex gap-2"><Textarea dir={l === "ar" ? "rtl" : "ltr"} rows={2} value={l === "en" ? vals.en || text || "" : vals[l] ?? ""} placeholder={l === "en" ? text : e.values[l].built || "(falls back to English)"} onChange={ev => setVals(v => ({ ...v, [l]: ev.target.value }))} /><Button type="button" size="sm" onClick={() => save(l)}>Save</Button></div>
        </div>)}
      </div>}
    </Modal>
  </>;
}
