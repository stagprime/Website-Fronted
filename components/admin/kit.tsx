"use client";
/** Admin UI kit: brand-styled primitives shared by every admin screen (navy #0E2346 / sky #48BDED, Open Sans / display font). */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export const inputCls = "w-full rounded-lg border border-white/10 bg-navy-950/80 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-brand focus:outline-none focus:ring-2 focus:ring-sky-brand/25";

// ---------- toasts (with optional undo) ----------
type Toast = { id: number; msg: string; kind: "ok" | "err" | "info"; undo?: () => void };
export function toast(msg: string, kind: Toast["kind"] = "ok", undo?: () => void) { window.dispatchEvent(new CustomEvent("sp-toast", { detail: { msg, kind, undo } })); }
export function Toaster() {
  const [list, setList] = useState<Toast[]>([]);
  useEffect(() => { const h = (e: Event) => { const d = (e as CustomEvent).detail; const id = Date.now() + Math.random(); setList(l => [...l, { id, ...d }]); setTimeout(() => setList(l => l.filter(t => t.id !== id)), d.undo ? 8000 : 4000); };
    window.addEventListener("sp-toast", h); return () => window.removeEventListener("sp-toast", h); }, []);
  return <div aria-live="polite" className="fixed bottom-4 right-4 z-[100] grid gap-2 w-80">{list.map(t => <div key={t.id} role="status" className={cx("rounded-xl border px-4 py-3 text-sm shadow-2xl flex items-center gap-3", t.kind === "err" ? "border-red-400/40 bg-red-950/95 text-red-100" : t.kind === "info" ? "border-white/15 bg-navy-800/95 text-slate-100" : "border-emerald-400/40 bg-emerald-950/95 text-emerald-100")}>
    <span className="flex-1">{t.msg}</span>{t.undo && <button className="font-semibold underline" onClick={() => { t.undo!(); setList(l => l.filter(x => x.id !== t.id)); }}>Undo</button>}</div>)}</div>;
}

// ---------- API ----------
export async function api<T = Record<string, unknown>>(url: string, opts: { method?: string; body?: unknown; form?: FormData; quiet?: boolean } = {}): Promise<(T & { ok: true }) | null> {
  try {
    const r = await fetch(url, { method: opts.method || (opts.body || opts.form ? "POST" : "GET"), headers: opts.form ? undefined : { "Content-Type": "application/json" }, body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined) });
    const j = await r.json().catch(() => ({ ok: false, error: `HTTP ${r.status}` }));
    if (!j.ok) { if (!opts.quiet) toast(j.error || "Something went wrong", "err"); return null; }
    return j;
  } catch { if (!opts.quiet) toast("Network error", "err"); return null; }
}
export function useApi<T>(url: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null); const [loading, setLoading] = useState(!!url);
  const load = useCallback(async () => { if (!url) return; setLoading(true); const j = await api<T>(url); setData(j as T | null); setLoading(false); }, [url]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load, ...deps]);
  return { data, loading, reload: load, setData };
}

// ---------- primitives ----------
export function Button({ children, kind = "primary", size = "md", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: "primary" | "ghost" | "danger" | "subtle"; size?: "sm" | "md" }) {
  return <button {...p} className={cx("inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-brand",
    size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm",
    kind === "primary" && "bg-gradient-to-r from-sky-brand to-blue-brand text-white shadow-lg shadow-sky-brand/20 hover:brightness-110",
    kind === "ghost" && "border border-white/15 text-slate-200 hover:border-sky-brand hover:text-white",
    kind === "subtle" && "text-slate-300 hover:bg-white/5 hover:text-white",
    kind === "danger" && "border border-red-400/40 text-red-200 hover:bg-red-500/15", className)}>{children}</button>;
}
export function Field({ label, help, children, className }: { label: string; help?: string; children: React.ReactNode; className?: string }) {
  return <label className={cx("block", className)}><span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>{children}{help && <span className="mt-1 block text-xs text-slate-500">{help}</span>}</label>;
}
export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cx(inputCls, p.className)} />;
export const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea rows={4} {...p} className={cx(inputCls, "font-[inherit]", p.className)} />;
export const Select = ({ options, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: (string | [string, string])[] }) => <select {...p} className={cx(inputCls, p.className)}>{options.map(o => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>)}</select>;
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex items-center gap-2 text-sm text-slate-300"><span className={cx("relative h-5 w-9 rounded-full transition", checked ? "bg-sky-brand" : "bg-white/15")}><span className={cx("absolute top-0.5 h-4 w-4 rounded-full bg-white transition", checked ? "left-[1.15rem]" : "left-0.5")} /></span>{label}</button>;
}
export function Card({ title, actions, children, className }: { title?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={cx("rounded-2xl border border-white/10 bg-navy-900/80 p-5", className)}>{(title || actions) && <div className="mb-4 flex flex-wrap items-center justify-between gap-3">{title && <h2 className="font-semibold text-white">{title}</h2>}{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</div>}{children}</section>;
}
export function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "sky" | "green" | "amber" | "red" | "purple" }) {
  const t = { slate: "bg-white/10 text-slate-300", sky: "bg-sky-brand/15 text-sky-200", green: "bg-emerald-500/15 text-emerald-200", amber: "bg-amber-500/15 text-amber-200", red: "bg-red-500/15 text-red-200", purple: "bg-purple-500/15 text-purple-200" }[tone];
  return <span className={cx("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", t)}>{children}</span>;
}
export function PageHeader({ title, sub, actions }: { title: string; sub?: React.ReactNode; actions?: React.ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-2xl font-bold text-white">{title}</h1>{sub && <p className="mt-1 max-w-3xl text-sm text-slate-400">{sub}</p>}</div>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</div>;
}
export function Tabs({ tabs, value, onChange }: { tabs: (string | [string, React.ReactNode])[]; value: string; onChange: (v: string) => void }) {
  return <div role="tablist" className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-navy-950/60 p-1">{tabs.map(t => { const [k, l] = Array.isArray(t) ? t : [t, t]; return <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)} className={cx("rounded-lg px-3 py-1.5 text-xs font-semibold", value === k ? "bg-sky-brand text-navy-950" : "text-slate-300 hover:text-white")}>{l}</button>; })}</div>;
}
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => { if (!open) return; const h = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [open, onClose]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div role="dialog" aria-modal aria-label={title} className={cx("max-h-[90vh] w-full overflow-auto rounded-2xl border border-white/10 bg-navy-900 p-6 shadow-2xl", wide ? "max-w-5xl" : "max-w-xl")}>
      <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-white">{title}</h2><button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-white">✕</button></div>{children}</div></div>;
}
export function Empty({ children }: { children: React.ReactNode }) { return <p className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-400">{children}</p>; }
export async function confirmTyped(word: string, msg: string) { const v = window.prompt(`${msg}\n\nType ${word} to confirm.`); return v?.trim().toUpperCase() === word.toUpperCase(); }

// ---------- data table ----------
export type Col<T> = { key: string; label: string; render?: (r: T) => React.ReactNode; sort?: (r: T) => string | number; className?: string };
export function DataTable<T extends { id?: string }>({ rows, cols, onRow, search, empty = "Nothing here yet.", pageSize = 25, rowKey }: { rows: T[]; cols: Col<T>[]; onRow?: (r: T) => void; search?: (r: T) => string; empty?: string; pageSize?: number; rowKey?: (r: T) => string }) {
  const [q, setQ] = useState(""); const [sort, setSort] = useState<[string, 1 | -1] | null>(null); const [page, setPage] = useState(0);
  const list = useMemo(() => { let l = rows; if (q && search) { const n = q.toLowerCase(); l = l.filter(r => search(r).toLowerCase().includes(n)); }
    if (sort) { const c = cols.find(x => x.key === sort[0]); if (c?.sort) l = [...l].sort((a, b) => (c.sort!(a) > c.sort!(b) ? 1 : -1) * sort[1]); } return l; }, [rows, q, sort, cols, search]);
  const pages = Math.max(1, Math.ceil(list.length / pageSize)); const view = list.slice(page * pageSize, page * pageSize + pageSize);
  return <div>
    {search && <div className="mb-3 flex items-center gap-3"><Input placeholder="Filter…" value={q} onChange={e => { setQ(e.target.value); setPage(0); }} className="max-w-xs" /><span className="text-xs text-slate-500">{list.length} rows</span></div>}
    <div className="overflow-x-auto rounded-xl border border-white/10"><table className="w-full text-sm"><thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-slate-400"><tr>{cols.map(c => <th key={c.key} className={cx("px-3 py-2.5 font-semibold", c.className)}>{c.sort ? <button onClick={() => setSort(s => s?.[0] === c.key ? [c.key, s[1] === 1 ? -1 : 1] : [c.key, 1])} className="hover:text-white">{c.label}{sort?.[0] === c.key ? (sort[1] === 1 ? " ↑" : " ↓") : ""}</button> : c.label}</th>)}</tr></thead>
      <tbody>{view.length ? view.map((r, i) => <tr key={rowKey ? rowKey(r) : r.id ?? i} onClick={onRow ? () => onRow(r) : undefined} className={cx("border-t border-white/5", onRow && "cursor-pointer hover:bg-white/5")}>{cols.map(c => <td key={c.key} className={cx("px-3 py-2.5 align-top text-slate-200", c.className)}>{c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? "")}</td>)}</tr>)
        : <tr><td colSpan={cols.length} className="px-3 py-10 text-center text-slate-500">{empty}</td></tr>}</tbody></table></div>
    {pages > 1 && <div className="mt-3 flex items-center gap-2 text-xs text-slate-400"><Button size="sm" kind="ghost" disabled={!page} onClick={() => setPage(p => p - 1)}>← Prev</Button>Page {page + 1} / {pages}<Button size="sm" kind="ghost" disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}>Next →</Button></div>}
  </div>;
}
export const fmtDate = (d?: string | Date | null) => d ? new Date(d).toLocaleString("en-GB", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" }) + " (Dhaka)" : "—";
export const money = (cents: number, cur = "usd") => new Intl.NumberFormat("en-US", { style: "currency", currency: cur.toUpperCase() }).format((cents || 0) / 100);
export function useDirty<T>(value: T) { const base = useRef(JSON.stringify(value)); return { dirty: JSON.stringify(value) !== base.current, reset: (v: T) => { base.current = JSON.stringify(v); } }; }
