"use client";
import { useEffect, useState } from "react";
import type { NavGroup } from "@/lib/nav";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

type G = NavGroup & { key: string };
export type HeaderBrand = { emblem: string; contact: { whatsapp: string; telegram: string; tel: string; phone: string; telegramHandle: string } };
export default function Header({ nav, ui, locale, names, brand }: { nav: G[]; ui: Record<string, string>; locale: string; names: Record<string, string>; brand: HeaderBrand }) {
  const CONTACT = brand.contact;
  const L = (h: string) => (/^([a-z]+:|\/[a-z]{2}(\/|$))/.test(h) ? h : `/${locale}${h === "/" ? "" : h}`);
  const path = usePathname() || `/${locale}`;
  const [lang, setLang] = useState(false);
  const swap = (l: string) => path.replace(/^\/[a-z]{2}(?=\/|$)/, `/${l}`);
  const pick = (l: string) => { document.cookie = `NEXT_LOCALE=${l};path=/;max-age=31536000;samesite=lax`; };
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [acc, setAcc] = useState<string | null>(nav[0]?.label ?? null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const f = () => setScrolled(window.scrollY > 20); f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  useEffect(() => { document.body.style.overflow = drawer ? "hidden" : ""; document.body.classList.toggle("menu-open", drawer); }, [drawer]);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(null), setDrawer(false)); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);
  const g = nav.find(n => n.label === open);
  return (
    <header className="fixed top-0 inset-x-0 z-40" onMouseLeave={() => setOpen(null)}>
      <div className="mx-auto max-w-7xl px-3 sm:px-8 mt-3">
        <nav aria-label={ui["Main"]} className={`rounded-2xl flex items-center justify-between px-3 sm:px-4 py-2.5 transition ${scrolled || open ? "glass shadow-2xl shadow-black/40" : "border border-transparent"}`}>
          <a href={L("/")} className="flex items-center gap-2.5" aria-label={ui["Stag Prime home"]}>
            <img src={brand.emblem} alt="" width={46} height={56} className="h-12 w-auto sm:h-14 drop-shadow-[0_0_12px_rgba(72,189,237,.35)]" />
            <span className="font-display font-extrabold tracking-wide text-white leading-none text-lg sm:text-xl">Stag <span className="grad-text">PRIME</span><span className="block text-[8px] sm:text-[9px] font-medium tracking-[.42em] text-slate-400 mt-1.5">DIGITAL AGENCY</span></span>
          </a>
          <ul className="hidden lg:flex items-center gap-1 text-sm">
            {nav.map(n => (
              <li key={n.label} onMouseEnter={() => setOpen(n.cols ? n.label : null)}>
                {n.cols ? (
                  <button aria-expanded={open === n.label} onClick={() => setOpen(open === n.label ? null : n.label)} onFocus={() => setOpen(n.label)}
                    className={`flex items-center gap-1 rounded-full px-4 py-2 transition ${open === n.label ? "bg-white/10 text-white" : "text-slate-300 hover:text-white"}`}>
                    {n.label}<svg className={`w-3 h-3 transition ${open === n.label ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4.5l3 3 3-3" /></svg>
                  </button>
                ) : <a href={L(n.href)} className="block rounded-full px-4 py-2 text-slate-300 hover:text-white">{n.label}</a>}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <a href={L("/login")} className="hidden xl:inline text-sm text-slate-300 hover:text-white px-2">{ui["Login"]}</a>
            <div className="relative" onMouseLeave={() => setLang(false)}>
              <button aria-label={ui["Language"]} aria-expanded={lang} aria-haspopup="true" onClick={() => setLang(!lang)} className="flex items-center gap-1 text-xs border border-white/15 rounded-full px-3 py-2 text-slate-200 hover:text-white uppercase">🌐 {locale}</button>
              {lang && <ul className="absolute end-0 top-full mt-2 w-44 rounded-2xl border border-sky-brand/20 bg-[rgba(6,23,51,0.98)] p-2 shadow-2xl shadow-black/60 mega-in">
                {Object.entries(names).map(([l, n]) => <li key={l}><a href={swap(l)} hrefLang={l} lang={l} onClick={() => pick(l)} aria-current={l === locale ? "true" : undefined} className={`flex justify-between rounded-xl px-3 py-2 text-sm ${l === locale ? "bg-sky-brand/15 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>{n}<span className="text-xs uppercase text-slate-400">{l}</span></a></li>)}
              </ul>}
            </div>
            <a href={L("/contact")} className="hidden sm:inline-block rounded-full bg-gradient-to-r from-sky-brand to-blue-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-brand/20">{ui["Book a Call"]}</a>
            <button className="lg:hidden grid place-items-center w-11 h-11 rounded-xl glass" aria-label={ui["Open menu"]} aria-expanded={drawer} onClick={() => setDrawer(true)}>
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
            </button>
          </div>
        </nav>

        {g && g.cols && (
          <div className="hidden lg:block mega-in mt-2 rounded-3xl border border-sky-brand/20 bg-[rgba(6,23,51,0.97)] backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden">
            <div className="p-6 grid grid-cols-[1fr_17rem] gap-6">
              <div className={`grid gap-6 ${g.cols.length > 1 ? "grid-cols-[2fr_1fr]" : ""}`}>
                {g.cols.map(c => (
                  <div key={c.title}>
                    <p className="text-[11px] uppercase tracking-[.25em] text-slate-500 mb-3 px-3">{c.title}</p>
                    <ul className={`grid gap-1 ${c.items.length > 4 && !c.items[0].ext ? "grid-cols-2" : ""}`}>
                      {c.items.map(i => (
                        <li key={i.t}><a href={L(i.href)} target={i.ext ? "_blank" : undefined} rel={i.ext ? "noopener" : undefined} style={{ ["--c" as string]: i.color || "#48BDED" }}
                          className="group flex gap-3 rounded-2xl p-3 border border-transparent mi transition">
                          {i.icon ? <span className="grid place-items-center shrink-0 w-10 h-10 rounded-xl border border-white/10 group-hover:scale-110 transition" style={{ background: `${i.color}22` }}><Icon name={i.icon} color={i.color} /></span> : <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-brand" />}
                          <span className="min-w-0">
                            <span className="flex items-center gap-1 font-semibold text-white group-hover:text-[color:var(--c)] transition">{i.t}{i.ext ? " ↗" : <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition">→</span>}</span>
                            {i.d && <span className="block text-xs text-slate-400 mt-0.5">{i.d}</span>}
                            {i.subs && <ul className="mt-2 space-y-1">{i.subs.map(x => <li key={x} className="flex gap-2 text-[12.5px] text-slate-300 group-hover:text-slate-100"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: i.color }} />{x}</li>)}</ul>}
                          </span>
                        </a></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <a href={L(g.featured?.href || g.href)} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-brand via-[#0E3A6E] to-navy-800 p-6 flex flex-col border border-sky-brand/30">
                <div className="absolute inset-0 grid-bg opacity-40" />
                <img src={brand.emblem} alt="" className="relative h-20 w-auto self-start drop-shadow-[0_0_20px_rgba(72,189,237,.5)] group-hover:scale-105 transition" />
                <span className="relative mt-auto pt-6 text-[11px] uppercase tracking-widest text-sky-brand">{ui["Featured"]}</span>
                <span className="relative mt-2 font-display text-lg font-bold text-white">{g.featured?.t || g.label}</span>
                <span className="relative mt-2 text-sm text-slate-200">{g.featured?.d || ""}</span>
                <span className="relative mt-4 text-sm font-semibold text-white">{g.featured?.cta || ui["Explore"]} →</span>
              </a>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-navy-900/80 px-6 py-3.5 text-sm">
              <a href={L(g.href)} className="font-semibold text-sky-brand hover:text-white">{ui["View all"]}: {g.label} →</a>
              <div className="flex items-center gap-5 text-slate-300">
                <span className="text-slate-500">{ui["Quick chat:"]}</span>
                <a href={CONTACT.whatsapp} target="_blank" rel="noopener" className="flex items-center gap-2 hover:text-[#20BF55]"><span className="h-2 w-2 rounded-full bg-[#178a3e]" />WhatsApp</a>
                <a href={CONTACT.telegram} target="_blank" rel="noopener" className="flex items-center gap-2 hover:text-[#2AABEE]"><span className="h-2 w-2 rounded-full bg-[#1b6fa0]" />Telegram {CONTACT.telegramHandle}</a>
                <a href={CONTACT.tel} dir="ltr" className="hover:text-white">{CONTACT.phone}</a>
              </div>
            </div>
          </div>
        )}
      </div>
      {g && g.cols && <div aria-hidden onMouseEnter={() => setOpen(null)} onClick={() => setOpen(null)} className="hidden lg:block fixed inset-0 -z-10 bg-navy-950/70 backdrop-blur-sm mega-in" />}

      {drawer && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-navy-950 flex flex-col" role="dialog" aria-modal="true" aria-label={ui["Menu"]}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <span className="flex items-center gap-2.5"><img src={brand.emblem} alt="" className="h-11 w-auto" /><span className="font-display font-extrabold text-white text-lg">Stag <span className="grad-text">PRIME</span></span></span>
            <button aria-label={ui["Close menu"]} onClick={() => setDrawer(false)} className="grid place-items-center w-11 h-11 rounded-xl glass text-white text-2xl">×</button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {nav.map(n => (
              <div key={n.label} className="border-b border-white/5">
                {n.cols ? (<>
                  <button className="w-full flex justify-between items-center py-4 font-display text-lg text-white" aria-expanded={acc === n.label} onClick={() => setAcc(acc === n.label ? null : n.label)}>
                    {n.label}<span className={`text-sky-brand transition ${acc === n.label ? "rotate-45" : ""}`}>+</span></button>
                  {acc === n.label && <ul className="pb-4 grid gap-1">{n.cols.flatMap(c => c.items).map(i => (
                    <li key={i.t}><a href={L(i.href)} target={i.ext ? "_blank" : undefined} rel="noopener" className="flex items-center gap-3 rounded-xl p-2.5 active:bg-white/5">
                      {i.icon ? <span className="grid place-items-center w-9 h-9 rounded-lg" style={{ background: `${i.color}22` }}><Icon name={i.icon} color={i.color} className="w-4 h-4" /></span> : <span className="w-9 grid place-items-center text-sky-brand">↗</span>}
                      <span><span className="block text-sm font-semibold text-slate-100">{i.t}</span>{i.d && <span className="block text-xs text-slate-500">{i.d}</span>}</span></a></li>))}</ul>}
                </>) : <a href={L(n.href)} className="block py-4 font-display text-lg text-white">{n.label}</a>}
              </div>
            ))}
            <a href={L("/contact")} className="block py-4 font-display text-lg text-white border-b border-white/5">{ui["Contact"]}</a>
            <a href={L("/login")} className="block py-4 font-display text-lg text-white border-b border-white/5">{ui["Login / Sign up"]}</a>
          </div>
          <div className="p-5 grid grid-cols-3 gap-2 border-t border-white/10">
            <a href={CONTACT.whatsapp} className="rounded-xl bg-[#178a3e] py-3 text-center text-sm font-semibold text-white">WhatsApp</a>
            <a href={CONTACT.telegram} className="rounded-xl bg-[#1b6fa0] py-3 text-center text-sm font-semibold text-white">Telegram</a>
            <a href={CONTACT.tel} className="rounded-xl bg-white py-3 text-center text-sm font-semibold text-navy-900">{ui["Call"]}</a>
          </div>
        </div>
      )}
    </header>
  );
}
