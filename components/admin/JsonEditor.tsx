"use client";
/**
 * Schema-less structured editor for any JSON setting (products, gigs, menus, footer, team…).
 * Infers inputs from the data: color pickers for hex values, media picker for image-ish keys, textareas for long text,
 * sortable/duplicable cards for object lists, tuple rows for [a, b] pairs. Strings can be translated inline (🌐) when i18n is on.
 */
import { useMemo, useState } from "react";
import { Button, Input, Textarea, Toggle, cx, inputCls } from "./kit";
import MediaPicker from "./MediaPicker";
import TranslateButton from "./TranslateButton";
type J = unknown;
export type Hint = { kind?: "text" | "textarea" | "color" | "image" | "url" | "select" | "number" | "md"; label?: string; options?: string[]; help?: string; hidden?: boolean };
const human = (k: string) => ({ n: "Name", d: "Description", p: "Price", t: "Title", u: "URL", q: "Question", a: "Answer", img: "Image", feats: "Features", subs: "Sub-items", svc: "Service slug", cat: "Category slug", pkgs: "Packages" } as Record<string, string>)[k] ?? k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, c => c.toUpperCase());
const titleKeys = ["name", "title", "n", "t", "label", "q", "key", "slug", "svc", "tier", "area", "group", "role"];
const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v);
const LONG = /^(d|desc|description|intro|body|sub|a|text|bio|note|extra|extraRules|customCss|systemPrompt|outcomes)$/i;
const IMG = /(^img$|image|logo|favicon|emblem|photo|ogImage|avatar|icon$)/i;
const URLK = /(href|url|^u$|link|whatsapp|telegram|^tel$)/i;
function blank(v: J): J {
  if (Array.isArray(v)) return [];
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)]));
  return typeof v === "number" ? 0 : typeof v === "boolean" ? false : "";
}
const titleOf = (o: Record<string, J>, i: number) => { for (const k of titleKeys) if (typeof o[k] === "string" && o[k]) return String(o[k]); const s = Object.values(o).find(x => typeof x === "string" && x); return s ? String(s).slice(0, 60) : `Item ${i + 1}`; };

export default function JsonEditor({ value, onChange, hints = {}, i18n = false, readOnly = false }: { value: J; onChange: (v: J) => void; hints?: Record<string, Hint>; i18n?: boolean; readOnly?: boolean }) {
  return <fieldset disabled={readOnly} className="min-w-0"><Node k="" v={value} set={onChange} hints={hints} i18n={i18n} depth={0} /></fieldset>;
}
function Node({ k, v, set, hints, i18n, depth }: { k: string; v: J; set: (v: J) => void; hints: Record<string, Hint>; i18n: boolean; depth: number }) {
  const h = hints[k] || {};
  if (h.hidden) return null;
  if (Array.isArray(v)) return <ArrayNode k={k} v={v} set={set} hints={hints} i18n={i18n} depth={depth} />;
  if (v && typeof v === "object") return <ObjectNode v={v as Record<string, J>} set={set} hints={hints} i18n={i18n} depth={depth} />;
  return <Leaf k={k} v={v} set={set} hint={h} i18n={i18n} />;
}
function ObjectNode({ v, set, hints, i18n, depth }: { v: Record<string, J>; set: (v: J) => void; hints: Record<string, Hint>; i18n: boolean; depth: number }) {
  const entries = Object.entries(v);
  const simple = entries.filter(([, x]) => x === null || typeof x !== "object"); const complex = entries.filter(([, x]) => x !== null && typeof x === "object");
  return <div className="grid gap-4">
    {!!simple.length && <div className="grid gap-3 sm:grid-cols-2">{simple.map(([k, x]) => { const long = typeof x === "string" && (LONG.test(k) || x.length > 90 || hints[k]?.kind === "textarea" || hints[k]?.kind === "md");
      return hints[k]?.hidden ? null : <div key={k} className={long ? "sm:col-span-2" : ""}><Lbl k={k} hint={hints[k]} /><Leaf k={k} v={x} set={nv => set({ ...v, [k]: nv })} hint={hints[k] || {}} i18n={i18n} /></div>; })}</div>}
    {complex.map(([k, x]) => hints[k]?.hidden ? null : <div key={k} className={cx("rounded-xl border border-white/10 p-3", depth % 2 ? "bg-navy-950/40" : "bg-navy-900/40")}><Lbl k={k} hint={hints[k]} /><Node k={k} v={x} set={nv => set({ ...v, [k]: nv })} hints={hints} i18n={i18n} depth={depth + 1} /></div>)}
  </div>;
}
const Lbl = ({ k, hint }: { k: string; hint?: Hint }) => <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400" title={hint?.help}>{hint?.label || human(k)}{hint?.help && <span className="ml-1 normal-case tracking-normal font-normal text-slate-500">— {hint.help}</span>}</p>;
function Leaf({ k, v, set, hint, i18n }: { k: string; v: J; set: (v: J) => void; hint: Hint; i18n: boolean }) {
  if (typeof v === "boolean") return <Toggle checked={v} onChange={set} label={v ? "On" : "Off"} />;
  if (typeof v === "number" || hint.kind === "number") return <Input type="number" value={String(v ?? 0)} onChange={e => set(e.target.value === "" ? 0 : Number(e.target.value))} />;
  const s = v == null ? "" : String(v);
  if (hint.kind === "select" && hint.options) return <select className={inputCls} value={s} onChange={e => set(e.target.value)}>{hint.options.map(o => <option key={o}>{o}</option>)}</select>;
  if (hint.kind === "color" || (isHex(s) && hint.kind !== "text")) return <div className="flex gap-2"><input type="color" aria-label={`${human(k)} color`} value={isHex(s) ? s : "#000000"} onChange={e => set(e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent" /><Input value={s} onChange={e => set(e.target.value)} /></div>;
  if (hint.kind === "image" || (IMG.test(k) && hint.kind !== "text" && (s === "" || s.startsWith("/") || s.startsWith("http")))) return <div className="flex gap-2 items-center">{s && /\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/i.test(s) && <img src={s} alt="" className="h-9 w-9 rounded object-cover bg-white/5" />}<Input value={s} onChange={e => set(e.target.value)} placeholder="/img/… or https://…" /><MediaPicker onPick={u => set(u)} /></div>;
  const long = LONG.test(k) || s.length > 90 || hint.kind === "textarea" || hint.kind === "md";
  const tr = i18n && !URLK.test(k) && !IMG.test(k) && !/^(slug|svc|cat|key|tier|kind|color|icon|href|u|id|value|tilt|code|source)$/i.test(k) && /[a-z]{3}/i.test(s);
  return <div className="flex gap-2 items-start">{long ? <Textarea value={s} onChange={e => set(e.target.value)} rows={Math.min(10, Math.max(3, Math.ceil(s.length / 90)))} /> : <Input value={s} onChange={e => set(e.target.value)} type={URLK.test(k) && hint.kind !== "text" ? "text" : "text"} />}{tr && <TranslateButton text={s} />}</div>;
}
function ArrayNode({ k, v, set, hints, i18n, depth }: { k: string; v: J[]; set: (v: J) => void; hints: Record<string, Hint>; i18n: boolean; depth: number }) {
  const [open, setOpen] = useState<number | null>(null); const [q, setQ] = useState(""); const [drag, setDrag] = useState<number | null>(null);
  const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= v.length) return; const n = [...v]; [n[i], n[j]] = [n[j], n[i]]; set(n); };
  const del = (i: number) => set(v.filter((_, x) => x !== i));
  const dup = (i: number) => { const n = [...v]; n.splice(i + 1, 0, structuredClone(v[i])); set(n); };
  const add = () => { const tpl = v.length ? blank(v[0]) : ""; set([...v, Array.isArray(v[0]) ? v[0].map(() => "") : tpl]); setOpen(v.length); };
  const objs = v.length > 0 && v.every(x => x && typeof x === "object" && !Array.isArray(x));
  const tuples = v.length > 0 && v.every(x => Array.isArray(x) && x.every(y => typeof y !== "object"));
  const filtered = useMemo(() => v.map((x, i) => [x, i] as const).filter(([x]) => !q || JSON.stringify(x).toLowerCase().includes(q.toLowerCase())), [v, q]);
  const tools = (i: number) => <span className="flex shrink-0 gap-1"><Button type="button" size="sm" kind="subtle" aria-label="Move up" onClick={() => move(i, -1)}>↑</Button><Button type="button" size="sm" kind="subtle" aria-label="Move down" onClick={() => move(i, 1)}>↓</Button><Button type="button" size="sm" kind="subtle" aria-label="Duplicate" onClick={() => dup(i)}>⧉</Button><Button type="button" size="sm" kind="subtle" aria-label="Delete" onClick={() => del(i)}>✕</Button></span>;
  const dnd = (i: number) => ({ draggable: true, onDragStart: () => setDrag(i), onDragOver: (e: React.DragEvent) => e.preventDefault(), onDrop: () => { if (drag === null || drag === i) return; const n = [...v]; const [m] = n.splice(drag, 1); n.splice(i, 0, m); set(n); setDrag(null); } });
  return <div className="grid gap-2">
    {v.length > 6 && <Input placeholder={`Filter ${v.length} items…`} value={q} onChange={e => setQ(e.target.value)} className="max-w-xs" />}
    {objs ? filtered.map(([x, i]) => <div key={i} {...dnd(i)} className={cx("rounded-xl border bg-navy-950/50", open === i ? "border-sky-brand/50" : "border-white/10")}>
        <div className="flex items-center gap-2 px-3 py-2"><span aria-hidden className="cursor-grab text-slate-500">⋮⋮</span><button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex-1 truncate text-left text-sm font-semibold text-white">{titleOf(x as Record<string, J>, i)}</button>{tools(i)}</div>
        {open === i && <div className="border-t border-white/10 p-3"><Node k={k} v={x} set={nv => { const n = [...v]; n[i] = nv; set(n); }} hints={hints} i18n={i18n} depth={depth + 1} /></div>}</div>)
      : tuples ? filtered.map(([x, i]) => <div key={i} {...dnd(i)} className="flex items-start gap-2"><span aria-hidden className="mt-2 cursor-grab text-slate-500">⋮⋮</span><div className="grid flex-1 gap-2 sm:grid-cols-[1fr_2fr]">{(x as J[]).map((y, j) => <Leaf key={j} k={j === 0 ? "t" : "d"} v={y} set={nv => { const n = [...v]; const row = [...(x as J[])]; row[j] = nv; n[i] = row; set(n); }} hint={{}} i18n={i18n} />)}</div>{tools(i)}</div>)
      : filtered.map(([x, i]) => <div key={i} {...dnd(i)} className="flex items-start gap-2"><span aria-hidden className="mt-2 cursor-grab text-slate-500">⋮⋮</span><div className="flex-1"><Node k={k} v={x} set={nv => { const n = [...v]; n[i] = nv; set(n); }} hints={hints} i18n={i18n} depth={depth + 1} /></div>{tools(i)}</div>)}
    <div><Button type="button" size="sm" kind="ghost" onClick={add}>+ Add {human(k || "item").replace(/s$/, "").toLowerCase()}</Button></div>
  </div>;
}
