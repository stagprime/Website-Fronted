"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Toaster, cx } from "./kit";
import CommandPalette from "./CommandPalette";
type Item = { href: string; label: string; icon: string; keys?: string };
export default function AdminShell({ nav, who, badges, children }: { nav: { group: string; items: Item[] }[]; who: { email: string; name: string | null; role: string }; badges: Record<string, number>; children: React.ReactNode }) {
  const path = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false); const [pal, setPal] = useState(false); const [dense, setDense] = useState(false);
  useEffect(() => { setDense(localStorage.getItem("sp-dense") === "1"); }, []);
  useEffect(() => { document.documentElement.classList.toggle("sp-dense", dense); localStorage.setItem("sp-dense", dense ? "1" : "0"); }, [dense]);
  // Keyboard: ⌘K / Ctrl+K palette, "g x" go-to shortcuts (from nav), "?" help.
  useEffect(() => {
    let g = false, t: ReturnType<typeof setTimeout> | undefined;
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName; const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(tag) || (e.target as HTMLElement)?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPal(p => !p); return; }
      if (typing) return;
      if (e.key === "/") { e.preventDefault(); setPal(true); return; }
      if (e.key === "g") { g = true; clearTimeout(t); t = setTimeout(() => (g = false), 900); return; }
      if (g) { const it = nav.flatMap(x => x.items).find(i => i.keys === `g ${e.key}`); g = false; if (it) router.push(it.href); }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [nav, router]);
  const active = (h: string) => h === "/admin" ? path === "/admin" : path === h || path.startsWith(h + "/");
  const best = nav.flatMap(g => g.items).filter(i => active(i.href)).sort((a, b) => b.href.length - a.href.length)[0]?.href;
  return (<div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
    <aside className={cx("fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto border-r border-white/10 bg-navy-900 p-4 transition lg:static lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
      <a href="/admin" className="flex items-center gap-2 px-2"><img src="/emblem.svg" alt="" className="h-8" /><span className="font-display font-bold text-white">Stag Prime <span className="text-sky-brand">Admin</span></span></a>
      <button onClick={() => setPal(true)} className="mt-5 flex w-full items-center justify-between rounded-lg border border-white/10 bg-navy-950/60 px-3 py-2 text-xs text-slate-400 hover:border-sky-brand"><span>Search or jump…</span><kbd className="rounded bg-white/10 px-1.5">⌘K</kbd></button>
      <nav aria-label="Admin" className="mt-4 grid gap-4">{nav.map(g => <div key={g.group}><p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">{g.group}</p>
        {g.items.map(i => <a key={i.href} href={i.href} aria-current={best === i.href ? "page" : undefined} className={cx("flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm", best === i.href ? "bg-sky-brand/15 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white")}>
          <span aria-hidden className="w-5 text-center text-sky-brand">{i.icon}</span><span className="flex-1">{i.label}</span>{badges[i.href] ? <span className="rounded-full bg-sky-brand px-1.5 text-[10px] font-bold text-navy-950">{badges[i.href]}</span> : null}</a>)}</div>)}</nav>
      <div className="mt-6 border-t border-white/10 pt-4 text-xs text-slate-400"><p className="truncate text-slate-200">{who.name || who.email}</p><p>{who.email}</p><p className="mt-1"><span className="rounded bg-white/10 px-1.5 py-0.5 uppercase tracking-wider">{who.role}</span></p>
        <div className="mt-3 flex flex-wrap gap-3"><a href="/en" className="hover:text-white">← Website</a><button onClick={() => setDense(d => !d)} className="hover:text-white">{dense ? "Comfortable" : "Compact"}</button><a href="/api/auth/signout" className="hover:text-white">Sign out</a></div></div>
    </aside>
    {open && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}
    <div className="min-w-0">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-navy-950/85 px-4 py-2.5 backdrop-blur lg:hidden"><button onClick={() => setOpen(true)} aria-label="Open menu" className="text-xl">☰</button><span className="font-semibold text-white">Admin</span><button onClick={() => setPal(true)} className="ml-auto text-sm text-slate-400">Search</button></header>
      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
    <CommandPalette open={pal} onClose={() => setPal(false)} nav={nav} />
    <Toaster />
  </div>);
}
