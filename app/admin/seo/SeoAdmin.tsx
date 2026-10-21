"use client";
import { useEffect, useState } from "react";
const LOC = ["en", "bn", "ar", "es", "fr", "de", "hi"];
type Rec = { title?: string | null; description?: string | null; focusKw?: string | null; secondaryKws?: string | null; canonical?: string | null; ogTitle?: string | null; ogDesc?: string | null; ogImage?: string | null; robotsIndex?: boolean; robotsFollow?: boolean; score?: number | null };
type Page = { path: string; record: Rec | null };
type Res = { score: number; title: string; desc: string; checks: { id: string; ok: boolean; msg: string }[] };
type Rd = { id: string; from: string; to: string; code: number; hits: number };
const inp = "w-full rounded-lg bg-navy-950 border border-white/10 px-3 py-2 text-sm text-white";
const post = (url: string, b: unknown) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json());
export default function SeoAdmin({ canEdit }: { canEdit: boolean }) {
  const [locale, setLocale] = useState("en"); const [pages, setPages] = useState<Page[]>([]); const [sel, setSel] = useState<Page | null>(null);
  const [res, setRes] = useState<Res | null>(null); const [msg, setMsg] = useState(""); const [q, setQ] = useState(""); const [rds, setRds] = useState<Rd[]>([]);
  const load = () => fetch(`/api/admin/seo?locale=${locale}`).then(r => r.json()).then(j => setPages(j.pages || []));
  const loadR = () => fetch("/api/admin/redirects").then(r => r.json()).then(j => setRds(j.redirects || []));
  useEffect(() => { load(); setSel(null); setRes(null); }, [locale]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { loadR(); }, []);
  async function run(p: Page) { setSel(p); setRes(null); setMsg("Analyzing…"); const j = await post("/api/admin/seo", { action: "analyze", path: p.path, locale, focusKw: p.record?.focusKw }); setMsg(""); if (j.ok) { setRes(j); load(); } else setMsg(j.error || "Failed"); }
  async function save(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); const fd = Object.fromEntries(new FormData(e.currentTarget)); const j = await post("/api/admin/seo", { action: "save", path: sel!.path, locale, ...fd, robotsIndex: fd.robotsIndex === "on", robotsFollow: fd.robotsFollow === "on" }); setMsg(j.ok ? "Saved — live now." : j.error); load(); }
  async function reset() { await post("/api/admin/seo", { action: "reset", path: sel!.path, locale }); setMsg("Override removed."); load(); }
  async function addR(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); const f = e.currentTarget; const j = await post("/api/admin/redirects", Object.fromEntries(new FormData(f))); if (j.ok) { f.reset(); loadR(); } else alert(j.error); }
  const r = sel?.record || {};
  return (<div className="grid gap-10">
    <div className="grid xl:grid-cols-[24rem_1fr] gap-6">
      <div className="rounded-2xl border border-white/10 bg-navy-900 p-4">
        <div className="flex gap-2"><label className="sr-only" htmlFor="loc">Locale</label><select id="loc" value={locale} onChange={e => setLocale(e.target.value)} className={inp + " w-24"}>{LOC.map(l => <option key={l}>{l}</option>)}</select><input aria-label="Filter pages" placeholder="Filter…" value={q} onChange={e => setQ(e.target.value)} className={inp} /></div>
        <ul className="mt-3 max-h-[60vh] overflow-y-auto divide-y divide-white/5">{pages.filter(p => p.path.includes(q)).map(p => <li key={p.path}><button onClick={() => run(p)} className={`w-full flex justify-between gap-2 py-2 px-2 text-start text-sm hover:bg-white/5 ${sel?.path === p.path ? "bg-white/5" : ""}`}><span className="truncate">{p.path}</span><span className={`text-xs ${p.record?.score == null ? "text-slate-500" : p.record.score >= 85 ? "text-emerald-400" : p.record.score >= 60 ? "text-amber-300" : "text-rose-400"}`}>{p.record?.score ?? "—"}{p.record?.title || p.record?.description ? " ✎" : ""}</span></button></li>)}</ul>
      </div>
      <div className="rounded-2xl border border-white/10 bg-navy-900 p-5">{!sel ? <p className="text-slate-400 text-sm">Pick a page to analyze and edit.</p> : <>
        <h2 className="font-semibold text-white">/{locale}{sel.path === "/" ? "" : sel.path} <a href={`/${locale}${sel.path === "/" ? "" : sel.path}`} target="_blank" className="text-xs text-sky-400">open ↗</a></h2>
        <p className="text-sm text-amber-300 mt-1">{msg}</p>
        {res && <div className="mt-4"><p className="text-4xl font-bold text-white">{res.score}<span className="text-base text-slate-400">/100</span></p><ul className="mt-3 grid sm:grid-cols-2 gap-1.5 text-sm">{res.checks.map(c => <li key={c.id} className={c.ok ? "text-emerald-300" : "text-rose-300"}>{c.ok ? "✓" : "✗"} {c.msg}</li>)}</ul></div>}
        <form key={sel.path + locale + JSON.stringify(r)} onSubmit={save} className="mt-6 grid sm:grid-cols-2 gap-3">
          {([["title", "Title override (≤60)"], ["description", "Meta description override (≤155)"], ["focusKw", "Focus keyword"], ["secondaryKws", "Secondary keywords (comma separated)"], ["canonical", "Canonical URL override"], ["ogTitle", "OG title"], ["ogDesc", "OG description"], ["ogImage", "OG image path (/img/...)"]] as const).map(([k, l]) =>
            <label key={k} className={`text-xs text-slate-400 ${k === "description" ? "sm:col-span-2" : ""}`}>{l}<input name={k} defaultValue={(r as Record<string, unknown>)[k] as string || ""} disabled={!canEdit} className={inp + " mt-1"} /></label>)}
          <label className="text-sm flex gap-2"><input type="checkbox" name="robotsIndex" defaultChecked={r.robotsIndex !== false} disabled={!canEdit} />index</label>
          <label className="text-sm flex gap-2"><input type="checkbox" name="robotsFollow" defaultChecked={r.robotsFollow !== false} disabled={!canEdit} />follow</label>
          {canEdit && <div className="sm:col-span-2 flex gap-3"><button className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white">Save override</button><button type="button" onClick={reset} className="rounded-full border border-white/15 px-5 py-2 text-sm">Remove override</button></div>}
        </form></>}</div>
    </div>
    <section id="redirects" className="rounded-2xl border border-white/10 bg-navy-900 p-5"><h2 className="font-semibold text-white">Redirect manager</h2><p className="text-xs text-slate-400 mt-1">Applies to URLs that don&apos;t match a real page. Use /old-path (all locales) or /en/old-path (one locale). 410 = gone.</p>
      {canEdit && <form onSubmit={addR} className="mt-4 grid sm:grid-cols-[1fr_1fr_7rem_auto] gap-2"><input name="from" required placeholder="/old-page" aria-label="From" className={inp} /><input name="to" placeholder="/services/saas or https://…" aria-label="To" className={inp} /><select name="code" aria-label="Type" className={inp}><option>301</option><option>302</option><option>410</option></select><button className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white">Add</button></form>}
      <table className="mt-4 w-full text-sm"><thead><tr className="text-left text-slate-400"><th className="py-2">From</th><th>To</th><th>Code</th><th>Hits</th><th /></tr></thead><tbody>{rds.map(d => <tr key={d.id} className="border-t border-white/5"><td className="py-2">{d.from}</td><td>{d.to}</td><td>{d.code}</td><td>{d.hits}</td><td>{canEdit && <button onClick={() => post("/api/admin/redirects", { action: "delete", id: d.id }).then(loadR)} className="text-rose-300 text-xs">Delete</button>}</td></tr>)}</tbody></table>
    </section>
  </div>);
}
