"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cx } from "./kit";
type Hit = { label: string; sub?: string; href: string; kind: string };
const ACTIONS: Hit[] = [
  { label: "New blog post", href: "/admin/blog/edit?new=1", kind: "Action" },
  { label: "New custom page", href: "/admin/pages?new=1", kind: "Action" },
  { label: "Edit home page", href: "/admin/pages/edit?key=home", kind: "Action" },
  { label: "Translate missing strings", href: "/admin/translations?missing=1", kind: "Action" },
  { label: "Add redirect", href: "/admin/seo/redirects", kind: "Action" },
  { label: "Upload media", href: "/admin/media", kind: "Action" },
  { label: "Create backup", href: "/admin/backups", kind: "Action" },
  { label: "Open website (en)", href: "/en", kind: "Action" },
];
/** ⌘K command palette: jump to any admin screen, run actions, and search orders, customers, posts, pages and media. */
export default function CommandPalette({ open, onClose, nav }: { open: boolean; onClose: () => void; nav: { group: string; items: { href: string; label: string; keys?: string }[] }[] }) {
  const [q, setQ] = useState(""); const [remote, setRemote] = useState<Hit[]>([]); const [i, setI] = useState(0); const ref = useRef<HTMLInputElement>(null); const router = useRouter();
  useEffect(() => { if (open) { setQ(""); setI(0); setTimeout(() => ref.current?.focus(), 10); } }, [open]);
  useEffect(() => { if (q.trim().length < 2) { setRemote([]); return; } const c = new AbortController();
    const t = setTimeout(() => fetch(`/api/admin/search?q=${encodeURIComponent(q)}`, { signal: c.signal }).then(r => r.json()).then(j => j.ok && setRemote(j.hits)).catch(() => {}), 160);
    return () => { clearTimeout(t); c.abort(); }; }, [q]);
  const local = useMemo(() => { const n = q.toLowerCase(); const all: Hit[] = [...nav.flatMap(g => g.items.map(x => ({ label: x.label, sub: x.keys ? `${g.group} · ${x.keys}` : g.group, href: x.href, kind: "Go to" }))), ...ACTIONS];
    return n ? all.filter(h => (h.label + " " + (h.sub || "")).toLowerCase().includes(n)) : all; }, [q, nav]);
  const hits = [...local, ...remote].slice(0, 40);
  if (!open) return null;
  const go = (h: Hit) => { onClose(); if (h.href.startsWith("/admin")) router.push(h.href); else window.open(h.href, "_blank"); };
  return <div className="fixed inset-0 z-[95] flex items-start justify-center bg-black/60 p-4 pt-[12vh]" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div role="dialog" aria-modal aria-label="Command palette" className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-navy-900 shadow-2xl">
      <input ref={ref} value={q} onChange={e => { setQ(e.target.value); setI(0); }} placeholder="Type a command, page, order id, email, post…" aria-label="Search"
        onKeyDown={e => { if (e.key === "Escape") onClose(); if (e.key === "ArrowDown") { e.preventDefault(); setI(x => Math.min(hits.length - 1, x + 1)); } if (e.key === "ArrowUp") { e.preventDefault(); setI(x => Math.max(0, x - 1)); } if (e.key === "Enter" && hits[i]) go(hits[i]); }}
        className="w-full border-b border-white/10 bg-transparent px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none" />
      <ul role="listbox" className="max-h-[55vh] overflow-y-auto p-2">{hits.length ? hits.map((h, k) => <li key={h.kind + h.href + k} role="option" aria-selected={k === i}>
        <button onMouseEnter={() => setI(k)} onClick={() => go(h)} className={cx("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm", k === i ? "bg-sky-brand/15 text-white" : "text-slate-300")}>
          <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wider text-sky-brand">{h.kind}</span><span className="flex-1 truncate">{h.label}</span>{h.sub && <span className="truncate text-xs text-slate-500">{h.sub}</span>}</button></li>)
        : <li className="px-3 py-6 text-center text-sm text-slate-500">No results</li>}</ul>
      <p className="border-t border-white/10 px-4 py-2 text-[11px] text-slate-500">↑↓ to move · Enter to open · Esc to close · tip: press <kbd>g</kbd> then a letter to jump</p>
    </div></div>;
}
