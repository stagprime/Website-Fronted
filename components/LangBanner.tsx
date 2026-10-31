"use client";
import { useEffect, useState } from "react";
// Suggests a language (from cookie set by middleware via Accept-Language / geo header). Never redirects.
export default function LangBanner({ locale, names, labels }: { locale: string; names: Record<string, string>; labels: Record<string, { q: string; yes: string; no: string }> }) {
  const [s, setS] = useState<string | null>(null);
  useEffect(() => {
    const c = Object.fromEntries(document.cookie.split("; ").map(x => x.split("=")));
    const sug = c.sp_suggest; if (!sug || sug === locale || c.NEXT_LOCALE || c.sp_dismiss || !labels[sug]) return; setS(sug);
  }, [locale, labels]);
  useEffect(() => { document.documentElement.classList.toggle("lang-suggest", !!s); return () => document.documentElement.classList.remove("lang-suggest"); }, [s]);
  if (!s) return null;
  const go = () => { document.cookie = `NEXT_LOCALE=${s};path=/;max-age=31536000;samesite=lax`; location.href = location.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, `/${s}`) + location.search; };
  const no = () => { document.cookie = `sp_dismiss=1;path=/;max-age=2592000;samesite=lax`; setS(null); };
  return (
    <div role="region" aria-label={names[s]} lang={s} dir={s === "ar" ? "rtl" : "ltr"} className="fixed z-[45] top-[4.75rem] sm:top-[5.25rem] inset-x-4 sm:inset-x-8 mx-auto max-w-7xl rounded-2xl glass shadow-2xl shadow-black/50 px-5 py-3 flex flex-wrap items-center gap-3">
      <span className="text-sm text-white flex-1 min-w-[12rem]">🌐 {labels[s].q}</span>
      <button onClick={go} className="rounded-full bg-gradient-to-r from-sky-brand to-blue-brand px-4 py-2 text-sm font-semibold text-white">{labels[s].yes} · {names[s]}</button>
      <button onClick={no} className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200">{labels[s].no}</button>
    </div>
  );
}
