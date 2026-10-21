"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Field, Input, Modal, Select, Tabs, Textarea, Toggle, api, confirmTyped, fmtDate, toast, cx } from "./kit";
import MediaPicker from "./MediaPicker";
type FieldDef = { key: string; label: string; kind: string; i18n?: boolean; options?: string[]; item?: FieldDef[]; help?: string; placeholder?: string };
type Section = { id: string; type: string; visible: boolean; settings: Record<string, unknown>; content: Record<string, Record<string, unknown>>; label?: string; schedule?: { from?: string; to?: string }; locales?: string[] };
type Block = { type: string; name: string; icon: string; fields: FieldDef[]; desc: string };
type Doc = { key: string; title: string; kind: string; status: string; coded: boolean; sections: Section[]; published: Section[]; hasDraft: boolean; updatedAt?: string; updatedBy?: string; revisions: { id: string; actor: string | null; createdAt: string }[]; registry: { blocks: Block[]; legacy: { id: string; name: string; fields: FieldDef[] }[]; pageHero: FieldDef[] | null } };
const LOCS = ["en", "bn", "ar", "es", "fr", "de", "hi"];
const uid = () => Math.random().toString(36).slice(2, 10);
const CTA_FIELDS: FieldDef[] = [{ key: "title", label: "CTA title", kind: "text", i18n: true }, { key: "sub", label: "CTA text", kind: "textarea", i18n: true }];
const BODY_FIELDS: FieldDef[] = [{ key: "body", label: "Page body (markdown, ## headings)", kind: "md", i18n: true }];
/** Visual page builder: section list (drag to reorder, show/hide, duplicate, schedule, per-locale visibility) + per-locale field editor, draft/preview/publish and revisions. */
export default function PageBuilder({ pageKey }: { pageKey: string }) {
  const [d, setD] = useState<Doc | null>(null); const [secs, setSecs] = useState<Section[]>([]); const [sel, setSel] = useState<string | null>(null); const [loc, setLoc] = useState("en"); const [base, setBase] = useState("[]"); const [add, setAdd] = useState(false); const [drag, setDrag] = useState<number | null>(null); const [title, setTitle] = useState(""); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { const j = await api<Doc>(`/api/admin/pages?key=${encodeURIComponent(pageKey)}`); if (j) { setD(j); setTitle(j.title);
    let s = j.sections; if (!s.length && j.registry.legacy.length) s = j.registry.legacy.map(l => ({ id: l.id, type: "legacy", visible: true, settings: {}, content: {} }));
    setSecs(s); setBase(JSON.stringify(s)); setSel(x => x && s.some(y => y.id === x) ? x : s[0]?.id ?? null); } }, [pageKey]);
  useEffect(() => { load(); }, [load]);
  const dirty = JSON.stringify(secs) !== base || (d != null && title !== d.title);
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); }; window.addEventListener("beforeunload", h); return () => window.removeEventListener("beforeunload", h); }, [dirty]);
  const blockOf = (t: string) => d?.registry.blocks.find(b => b.type === t);
  const meta = useCallback((s: Section): { name: string; icon: string; fields: FieldDef[] } => {
    if (s.type === "legacy") { const l = d?.registry.legacy.find(x => x.id === s.id); return { name: l?.name || s.id, icon: "◧", fields: l?.fields || [] }; }
    if (s.type === "pageHero") return { name: "Page hero (built-in)", icon: "★", fields: d?.registry.pageHero || [] };
    if (s.type === "pageCta") return { name: "Closing CTA (built-in)", icon: "➜", fields: CTA_FIELDS };
    if (s.type === "richText" && s.settings.position === "body") return { name: "Page body (legal text)", icon: "§", fields: BODY_FIELDS };
    const b = blockOf(s.type); return { name: b?.name || s.type, icon: b?.icon || "?", fields: b?.fields || [] };
  }, [d]); // eslint-disable-line react-hooks/exhaustive-deps
  const cur = secs.find(s => s.id === sel);
  const upd = (id: string, f: (s: Section) => Section) => setSecs(ss => ss.map(s => s.id === id ? f(structuredClone(s)) : s));
  const getV = (s: Section, f: FieldDef) => f.i18n ? s.content?.[loc]?.[f.key] : s.settings?.[f.key];
  const setV = (s: Section, f: FieldDef, v: unknown) => upd(s.id, x => { if (f.i18n) { x.content ||= {}; x.content[loc] = { ...(x.content[loc] || {}), [f.key]: v }; } else x.settings = { ...x.settings, [f.key]: v }; return x; });
  const addBlock = (type: string, extra: Partial<Section> = {}) => { const s: Section = { id: uid(), type, visible: true, settings: {}, content: {}, ...extra }; setSecs(ss => [...ss, s]); setSel(s.id); setAdd(false); };
  const save = async (mode: "draft" | "publish") => { setBusy(true); const j = await api("/api/admin/pages", { method: "PUT", body: { key: pageKey, sections: secs, title, mode } }); setBusy(false); if (j) { toast(mode === "publish" ? "Published — live in all languages" : "Draft saved (not live)"); await load(); } return !!j; };
  const preview = async () => { if (dirty && !(await save("draft"))) return; window.open(`/api/admin/preview?path=${encodeURIComponent(`/${loc}${pageKey === "home" ? "" : pageKey}`)}`, "_blank"); };
  const filled = (s: Section) => LOCS.filter(l => Object.values(s.content?.[l] || {}).some(v => v !== "" && v != null && !(Array.isArray(v) && !v.length)));
  const has = (t: string, pos?: string) => secs.some(s => s.type === t && (!pos || s.settings.position === pos));
  const publicUrl = `/${loc}${pageKey === "home" ? "" : pageKey}`;
  if (!d) return <p className="text-sm text-slate-400">Loading page…</p>;
  return <>
    <Link href="/admin/pages" className="text-xs text-slate-400 hover:text-white">← Pages</Link>
    <div className="mb-4 mt-1 flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><input aria-label="Page title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-transparent font-display text-2xl font-bold capitalize text-white focus:outline-none" />
      <p className="flex flex-wrap items-center gap-2 text-xs text-slate-400"><code>{pageKey === "home" ? "/" : pageKey}</code>{d.status === "draft" && <Badge tone="red">unpublished</Badge>}{d.hasDraft && <Badge tone="amber">has draft</Badge>}{dirty && <Badge tone="amber">unsaved</Badge>}{d.updatedAt && <>· updated {fmtDate(d.updatedAt)} by {d.updatedBy}</>}</p></div>
      <div className="flex flex-wrap gap-2"><a href={publicUrl} target="_blank" rel="noreferrer"><Button size="sm" kind="subtle">Live ↗</Button></a><Button size="sm" kind="ghost" onClick={preview}>Preview draft</Button><Button size="sm" kind="ghost" disabled={busy || !dirty} onClick={() => save("draft")}>Save draft</Button><Button size="sm" disabled={busy} onClick={() => save("publish")}>Publish</Button>
        {d.kind === "custom" && <Button size="sm" kind="ghost" onClick={async () => { const st = d.status === "draft" ? "published" : "draft"; if (await api("/api/admin/pages", { method: "PUT", body: { key: pageKey, sections: secs, title, status: st } })) { toast(st === "published" ? "Page is live" : "Page unpublished"); load(); } }}>{d.status === "draft" ? "Make live" : "Unpublish"}</Button>}</div></div>
    <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
      <div className="grid content-start gap-3">
        <Card title="Sections" actions={<Button size="sm" onClick={() => setAdd(true)}>+ Add</Button>}>
          <ol className="grid gap-1.5">{secs.map((s, i) => { const m = meta(s); return <li key={s.id} draggable onDragStart={() => setDrag(i)} onDragOver={e => e.preventDefault()} onDrop={() => { if (drag === null) return; const n = [...secs]; const [x] = n.splice(drag, 1); n.splice(i, 0, x); setSecs(n); setDrag(null); }}
            className={cx("flex items-center gap-2 rounded-lg border px-2 py-1.5 text-sm", sel === s.id ? "border-sky-brand bg-sky-brand/10" : "border-white/10 bg-navy-950/50", !s.visible && "opacity-50")}>
            <span aria-hidden className="cursor-grab text-slate-500">⋮⋮</span><button className="min-w-0 flex-1 truncate text-left text-white" onClick={() => setSel(s.id)}>{m.icon} {s.label || m.name}{s.settings.position === "end" && <span className="text-[10px] text-slate-500"> · before CTA</span>}</button>
            <button aria-label={s.visible ? "Hide section" : "Show section"} title={s.visible ? "Hide" : "Show"} onClick={() => upd(s.id, x => ({ ...x, visible: !x.visible }))} className="text-slate-400 hover:text-white">{s.visible ? "◉" : "○"}</button>
            <span className="flex flex-col text-[10px] leading-none"><button aria-label="Move up" onClick={() => { if (!i) return; const n = [...secs]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setSecs(n); }}>▲</button><button aria-label="Move down" onClick={() => { if (i === secs.length - 1) return; const n = [...secs]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; setSecs(n); }}>▼</button></span></li>; })}
            {!secs.length && <li className="text-sm text-slate-400">No customisations yet — the page shows its built-in design. Add a hero override or blocks.</li>}</ol></Card>
        {d.coded && pageKey !== "home" && <p className="text-xs text-slate-500">Blocks render right after the page hero; set “Position: before CTA” to place them at the end. The built-in page content stays in between.</p>}
        <Card title="History">{d.revisions.length ? <ul className="grid gap-1 text-xs">{d.revisions.map(r => <li key={r.id} className="flex items-center justify-between gap-2"><span className="text-slate-300">{fmtDate(r.createdAt)} · {r.actor}</span><Button size="sm" kind="subtle" onClick={async () => { if (confirm("Restore this version and publish it?") && await api("/api/admin/pages", { method: "PUT", body: { key: pageKey, revision: r.id } })) { toast("Restored"); load(); } }}>Restore</Button></li>)}</ul> : <p className="text-xs text-slate-400">No earlier versions.</p>}
          <div className="mt-3 flex flex-wrap gap-2">{d.hasDraft && <Button size="sm" kind="ghost" onClick={async () => { if (confirm("Discard the unpublished draft?") && await api("/api/admin/pages", { method: "PUT", body: { key: pageKey, discard: true } })) load(); }}>Discard draft</Button>}
            {d.coded && <Button size="sm" kind="ghost" onClick={async () => { if (await confirmTyped("RESET", "Remove all customisations and use the built-in page?") && await api("/api/admin/pages", { method: "PUT", body: { key: pageKey, unmanage: true } })) { toast("Back to built-in"); load(); } }}>Reset to built-in</Button>}
            {d.kind === "custom" && <Button size="sm" kind="danger" onClick={async () => { if (await confirmTyped("DELETE", "Delete this page?") && await api(`/api/admin/pages?key=${encodeURIComponent(pageKey)}`, { method: "DELETE" })) location.assign("/admin/pages"); }}>Delete page</Button>}</div></Card>
      </div>
      <div className="min-w-0">{cur ? <Card title={<span>{meta(cur).icon} {meta(cur).name}</span>} actions={<><Button size="sm" kind="subtle" onClick={() => { const c = { ...structuredClone(cur), id: uid() }; const i = secs.findIndex(s => s.id === cur.id); const n = [...secs]; n.splice(i + 1, 0, c); setSecs(n); setSel(c.id); }}>Duplicate</Button>{cur.type !== "legacy" && <Button size="sm" kind="subtle" onClick={() => { setSecs(secs.filter(s => s.id !== cur.id)); setSel(null); }}>Remove</Button>}</>}>
        <div className="mb-4 flex flex-wrap items-center gap-3"><Tabs tabs={LOCS.map(l => [l, <span key={l}>{l}{filled(cur).includes(l) && " •"}</span>])} value={loc} onChange={setLoc} /><span className="text-xs text-slate-500">Empty fields use English (auto-translated where a translation exists), then the built-in copy.</span></div>
        <div className="grid gap-4">{meta(cur).fields.map(f => <FieldInput key={f.key + loc} f={f} v={getV(cur, f)} en={f.i18n ? cur.content?.en?.[f.key] : undefined} loc={loc} onChange={v => setV(cur, f, v)} />)}
          {!meta(cur).fields.length && <p className="text-sm text-slate-400">This section has no editable fields — you can reorder or hide it.</p>}</div>
        <details className="mt-6 rounded-xl border border-white/10 p-3 text-sm"><summary className="cursor-pointer text-slate-300">Visibility & advanced</summary><div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Admin label"><Input value={cur.label || ""} onChange={e => upd(cur.id, x => ({ ...x, label: e.target.value || undefined }))} /></Field>
          {d.coded && pageKey !== "home" && !["pageHero", "pageCta"].includes(cur.type) && cur.settings.position !== "body" && <Field label="Position"><Select value={String(cur.settings.position || "")} options={[["", "After hero"], ["end", "Before closing CTA"]]} onChange={e => upd(cur.id, x => ({ ...x, settings: { ...x.settings, position: e.target.value || undefined } }))} /></Field>}
          <Field label="Show from"><Input type="datetime-local" value={cur.schedule?.from?.slice(0, 16) || ""} onChange={e => upd(cur.id, x => ({ ...x, schedule: { ...x.schedule, from: e.target.value ? new Date(e.target.value).toISOString() : undefined } }))} /></Field>
          <Field label="Hide after"><Input type="datetime-local" value={cur.schedule?.to?.slice(0, 16) || ""} onChange={e => upd(cur.id, x => ({ ...x, schedule: { ...x.schedule, to: e.target.value ? new Date(e.target.value).toISOString() : undefined } }))} /></Field>
          <Field label="Only in languages" group className="sm:col-span-2"><div className="flex flex-wrap gap-3">{LOCS.map(l => <label key={l} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={!cur.locales?.length || cur.locales.includes(l)} onChange={e => upd(cur.id, x => { const all = x.locales?.length ? x.locales : LOCS; const n = e.target.checked ? [...new Set([...all, l])] : all.filter(y => y !== l); return { ...x, locales: n.length === LOCS.length ? undefined : n }; })} />{l}</label>)}</div></Field></div></details>
      </Card> : <Card><p className="text-sm text-slate-400">Select a section, or add one.</p></Card>}</div>
    </div>
    <Modal open={add} onClose={() => setAdd(false)} title="Add a section" wide><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {d.registry.pageHero && !has("pageHero") && <AddCard icon="★" name="Page hero override" desc="Change this page's hero kicker, title, subtitle and image" onClick={() => addBlock("pageHero")} />}
      {d.coded && pageKey !== "home" && !has("pageCta") && <AddCard icon="➜" name="Closing CTA override" desc="Change or hide the closing call-to-action" onClick={() => addBlock("pageCta")} />}
      {d.kind === "legal" && !has("richText", "body") && <AddCard icon="§" name="Page body" desc="Replace the legal text (markdown, per language)" onClick={() => addBlock("richText", { settings: { position: "body" } })} />}
      {d.registry.legacy.filter(l => !secs.some(s => s.type === "legacy" && s.id === l.id)).map(l => <AddCard key={l.id} icon="◧" name={l.name} desc={pageKey === "home" ? "Built-in home section" : "Built-in section of this page"} onClick={() => { setSecs([...secs, { id: l.id, type: "legacy", visible: true, settings: {}, content: {} }]); setSel(l.id); setAdd(false); }} />)}
      {d.registry.blocks.map(b => <AddCard key={b.type} icon={b.icon} name={b.name} desc={b.desc} onClick={() => addBlock(b.type)} />)}</div></Modal>
  </>;
}
const AddCard = ({ icon, name, desc, onClick }: { icon: string; name: string; desc: string; onClick: () => void }) => <button onClick={onClick} className="rounded-xl border border-white/10 p-3 text-left hover:border-sky-brand"><span className="text-lg">{icon}</span><p className="font-semibold text-white">{name}</p><p className="text-xs text-slate-400">{desc}</p></button>;
function FieldInput({ f, v, en, loc, onChange }: { f: FieldDef; v: unknown; en: unknown; loc: string; onChange: (v: unknown) => void }) {
  const dir = f.i18n && loc === "ar" ? "rtl" : "ltr"; const ph = f.i18n && loc !== "en" && typeof en === "string" && en ? en : f.placeholder; const s = typeof v === "string" ? v : v == null ? "" : String(v);
  const label = `${f.label}${f.i18n ? ` (${loc})` : ""}`;
  if (f.kind === "bool") return <Field label={f.label} group><Toggle checked={!!v} onChange={onChange} label={v ? "Yes" : "No"} /></Field>;
  if (f.kind === "select") return <Field label={label}><Select value={s} options={["", ...(f.options || [])]} onChange={e => onChange(e.target.value)} /></Field>;
  if (f.kind === "number") return <Field label={label}><Input type="number" value={s} onChange={e => onChange(e.target.value === "" ? undefined : Number(e.target.value))} /></Field>;
  if (f.kind === "color") return <Field label={label}><div className="flex gap-2"><input type="color" aria-label={f.label} value={/^#[0-9a-f]{6}$/i.test(s) ? s : "#48bded"} onChange={e => onChange(e.target.value)} className="h-9 w-12 rounded border border-white/10 bg-transparent" /><Input value={s} onChange={e => onChange(e.target.value)} /></div></Field>;
  if (f.kind === "image") return <Field label={label} help={f.help}><div className="flex items-center gap-2">{s && <img src={s} alt="" className="h-9 w-9 rounded object-cover" />}<Input value={s} onChange={e => onChange(e.target.value)} placeholder="/media/… or https://…" /><MediaPicker onPick={onChange} /></div></Field>;
  if (f.kind === "textarea" || f.kind === "md" || f.kind === "html") return <Field label={label} help={f.kind === "md" ? "Markdown: ## heading, **bold**, - list, [link](/path)" : f.kind === "html" ? "Scripts and event handlers are removed on save." : f.help}><Textarea dir={dir} rows={f.kind === "textarea" ? 3 : 12} className={f.kind === "html" ? "font-mono text-xs" : ""} value={s} placeholder={ph} onChange={e => onChange(e.target.value)} /></Field>;
  if (f.kind === "list") { const arr = (Array.isArray(v) ? v : []) as Record<string, unknown>[]; const enArr = Array.isArray(en) ? en as Record<string, unknown>[] : [];
    const start = !arr.length && enArr.length && loc !== "en";
    return <Field label={label} group help={start ? "Not translated yet — copy the English items to start." : undefined}><div className="grid gap-2">{start && <Button type="button" size="sm" kind="ghost" onClick={() => onChange(structuredClone(enArr))}>Copy English items</Button>}
      {arr.map((it, i) => <div key={i} className="grid gap-2 rounded-lg border border-white/10 p-2 sm:grid-cols-[1fr_auto]"><div className="grid gap-2">{(f.item || []).map(sf => <FieldInput key={sf.key} f={{ ...sf, i18n: false }} v={it[sf.key]} en={enArr[i]?.[sf.key]} loc={loc} onChange={nv => { const n = [...arr]; n[i] = { ...n[i], [sf.key]: nv }; onChange(n); }} />)}</div>
        <div className="flex gap-1 sm:flex-col"><Button type="button" size="sm" kind="subtle" aria-label="Move up" onClick={() => { if (!i) return; const n = [...arr]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }}>↑</Button><Button type="button" size="sm" kind="subtle" aria-label="Remove item" onClick={() => onChange(arr.filter((_, x) => x !== i))}>✕</Button></div></div>)}
      <Button type="button" size="sm" kind="ghost" onClick={() => onChange([...arr, Object.fromEntries((f.item || []).map(sf => [sf.key, ""]))])}>+ Add item</Button></div></Field>; }
  return <Field label={label} help={f.help}><Input dir={dir} value={s} placeholder={ph} onChange={e => onChange(e.target.value)} /></Field>;
}
