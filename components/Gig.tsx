import { BuyButton } from "./Buy";
import { T, getLoc, L } from "@/lib/loc";
import { gigOf } from "@/lib/site";
import { ViewContent } from "./Track";
export function GigPackages({ svc, color }: { svc: string; color: string }) {
  const g = gigOf(svc); if (!g) return null; const l = getLoc();
  const allF = [...new Set(g.pkgs.flatMap(p => p.features))];
  return (
    <section id="packages" aria-labelledby="pk" className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 scroll-mt-24">
      <ViewContent name={g.title} type="service" id={`gig:${svc}`} value={g.pkgs[0].price} />
      <p className="font-display text-[11px] tracking-[.3em] uppercase mb-4 text-sky-brand">{T("Packages")}</p>
      <h2 id="pk" data-split="scroll" className="font-display text-3xl sm:text-5xl font-bold text-white">{T(g.title)}</h2>
      <div className="mt-10 grid md:grid-cols-3 gap-5">{g.pkgs.map((p, i) => (
        <article key={p.tier} className={`reveal rounded-[1.75rem] p-7 flex flex-col border ${i === 1 ? "bg-gradient-to-b from-blue-brand/40 to-navy-900 border-sky-brand/50" : "glass border-white/10"}`}>
          <div className="flex items-center justify-between"><p className="text-xs uppercase tracking-[.2em]" style={{ color }}>{T(p.tier === "basic" ? "Basic" : p.tier === "standard" ? "Standard" : "Premium")}</p>{i === 1 && <span className="rounded-full bg-sky-brand px-3 py-1 text-[11px] font-bold text-navy-950">{T("Most popular")}</span>}</div>
          <h3 className="mt-3 font-display text-xl font-bold text-white">{T(p.name)}</h3><p className="mt-2 text-sm text-slate-300">{T(p.desc)}</p>
          <p className="mt-5 font-display text-4xl font-extrabold text-white">${p.price.toLocaleString("en-US")}</p>
          <p className="mt-2 text-sm text-slate-300">⏱ {p.days} {T("days delivery")} · ↻ {p.revisions} {T("revisions")}</p>
          <ul className="mt-5 space-y-2 text-sm text-slate-200 flex-1">{p.features.map(f => <li key={f} className="flex gap-2"><span style={{ color }}>✓</span>{T(f)}</li>)}</ul>
          <div className="mt-7"><BuyButton id={`gig:${svc}:${p.tier}`} locale={l} label={`${T("Order now")} · $${p.price.toLocaleString("en-US")}`} busy={T("Opening checkout…")} cursor={T("Order")} className="w-full rounded-full bg-gradient-to-r from-sky-brand to-blue-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" /></div>
        </article>))}</div>
      <div className="mt-10 overflow-x-auto rounded-3xl border border-white/10">
        <table className="w-full min-w-[40rem] text-sm"><caption className="sr-only">{T("Package comparison")}</caption>
          <thead><tr className="bg-white/5 text-left"><th scope="col" className="p-4 text-slate-300">{T("Compare packages")}</th>{g.pkgs.map(p => <th key={p.tier} scope="col" className="p-4 font-display text-white">{T(p.name)}</th>)}</tr></thead>
          <tbody>
            <tr className="border-t border-white/10"><th scope="row" className="p-4 text-left font-normal text-slate-300">{T("Price")}</th>{g.pkgs.map(p => <td key={p.tier} className="p-4 text-white">${p.price.toLocaleString("en-US")}</td>)}</tr>
            <tr className="border-t border-white/10"><th scope="row" className="p-4 text-left font-normal text-slate-300">{T("Delivery")}</th>{g.pkgs.map(p => <td key={p.tier} className="p-4 text-white">{p.days} {T("days")}</td>)}</tr>
            <tr className="border-t border-white/10"><th scope="row" className="p-4 text-left font-normal text-slate-300">{T("Revisions")}</th>{g.pkgs.map(p => <td key={p.tier} className="p-4 text-white">{p.revisions}</td>)}</tr>
            {allF.map(f => <tr key={f} className="border-t border-white/10"><th scope="row" className="p-4 text-left font-normal text-slate-300">{T(f)}</th>{g.pkgs.map(p => <td key={p.tier} className="p-4">{p.features.includes(f) || p.features.some(x => x.startsWith("Everything in")) && g.pkgs.indexOf(p) > 0 ? <span style={{ color }} aria-label={T("Included")}>✓</span> : <span className="text-slate-500" aria-label={T("Not included")}>—</span>}</td>)}</tr>)}
          </tbody></table></div>
      <div className="mt-12 grid lg:grid-cols-2 gap-8">
        <div><h3 className="font-display text-xl font-bold text-white">{T("What we need from you")}</h3><p className="mt-2 text-sm text-slate-300">{T("After payment you'll get a short requirements form in your account:")}</p><ul className="mt-4 space-y-2 text-sm text-slate-200">{g.requirements.map(r => <li key={r} className="flex gap-2"><span className="text-sky-brand">•</span>{T(r)}</li>)}</ul>
          <p className="mt-4 text-sm text-slate-300">{T("Need something custom?")} <a href={L("/contact")} className="font-semibold text-sky-brand">{T("Request a custom offer")} →</a></p></div>
        <div><h3 className="font-display text-xl font-bold text-white">{T("Package FAQ")}</h3>{g.faq.map(([q, a]) => <details key={q} className="mt-3 rounded-2xl border border-white/10 p-5"><summary className="cursor-pointer font-semibold text-white">{T(q)}</summary><p className="mt-3 text-sm text-slate-300">{T(a)}</p></details>)}</div>
      </div>
    </section>
  );
}
