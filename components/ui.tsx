import { CONTACT } from "@/lib/i18n";
import { profiles, partners } from "@/content/site";
import { L, T, getLoc } from "@/lib/loc";
import Art from "./Art";
export { L, T };
export const wrap = "relative mx-auto max-w-7xl px-5 sm:px-8";
/** Flatten JSX to plain text (used to look up translations of rich headings). */
export function flat(n: React.ReactNode): string {
  if (n == null || typeof n === "boolean") return ""; if (typeof n === "string" || typeof n === "number") return String(n);
  if (Array.isArray(n)) return n.map(flat).join("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = (n as any).props; return p ? flat(p.children) : "";
}
/** Rich text: keeps JSX in English, swaps to the plain translated string in other locales. */
export function R({ children }: { children: React.ReactNode }) {
  if (getLoc() === "en") return <>{children}</>;
  const f = flat(children).replace(/\s+/g, " ").trim(); const t = T(f); return <>{t}</>;
}
const tx = (c: React.ReactNode) => (typeof c === "string" ? T(c) : <R>{c}</R>);
export function JsonLd({ data }: { data: object }) { return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />; }
export function Kicker({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`font-display text-[11px] tracking-[.3em] uppercase mb-4 flex items-center gap-3 ${light ? "text-blue-brand" : "text-sky-brand"}`}><span className={`h-px w-10 ${light ? "bg-blue-brand" : "bg-sky-brand"}`} />{tx(children)}</p>;
}
export function H2({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return <h2 data-split="scroll" className={`font-display text-3xl sm:text-5xl font-bold leading-[1.1] tracking-tight ${light ? "text-navy-900" : "text-white"}`}>{tx(children)}</h2>;
}
export function PageHero({ kicker, title, sub, crumbs, color = "#48BDED", img, children }: { kicker: string; title: React.ReactNode; sub?: string; crumbs: [string, string][]; color?: string; img?: string | null; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-24">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute -top-40 left-1/3 w-[36rem] h-[36rem] rounded-full blur-[120px] opacity-25" style={{ background: color }} />
      {img && <div className="absolute right-0 top-0 h-full w-full lg:w-[52%] opacity-35 lg:opacity-80" data-parallax="8" aria-hidden>
        <Art src={img} alt="" w={1280} h={720} priority sizes="(max-width:1024px) 100vw, 52vw" className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/50 to-transparent rtl:bg-gradient-to-l" /><div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-navy-950/60" /></div>}
      <div className={wrap}>
        <nav aria-label="Breadcrumb" className="mb-8 text-xs text-slate-400"><ol className="flex flex-wrap gap-2"><li><a href={L("/")} className="hover:text-white">{T("Home")}</a></li>
          {crumbs.map(([n, p], i) => <li key={p} className="flex gap-2"><span aria-hidden>/</span>{i === crumbs.length - 1 ? <span className="text-slate-200" aria-current="page">{T(n)}</span> : <a href={L(p)} className="hover:text-white">{T(n)}</a>}</li>)}</ol></nav>
        <Kicker>{kicker}</Kicker>
        <h1 data-split className="font-display text-4xl sm:text-6xl font-extrabold text-white leading-[1.05] tracking-tight max-w-4xl">{tx(title)}</h1>
        {sub && <p data-up className="mt-6 max-w-2xl text-lg text-slate-300 leading-relaxed">{T(sub)}</p>}
        {children}
      </div>
    </section>
  );
}
export function Btn({ href, children, ghost, ext }: { href: string; children: React.ReactNode; ghost?: boolean; ext?: boolean }) {
  return <a href={L(href)} data-cursor={ghost ? undefined : "Go"} target={ext ? "_blank" : undefined} rel={ext ? "noopener" : undefined} className={ghost ? "inline-block rounded-full border border-sky-brand/40 px-7 py-3.5 font-semibold text-sky-brand hover:bg-sky-brand/10 transition" : "inline-block rounded-full bg-gradient-to-r from-sky-brand to-blue-brand px-7 py-3.5 font-semibold text-white shadow-xl shadow-sky-brand/25 hover:shadow-sky-brand/50 transition"}>{tx(children)}</a>;
}
export function TrustStrip() {
  const items = [...profiles.map(p => ({ n: p.n, u: p.u })), ...partners.tech.map(n => ({ n, u: "" }))];
  return (
    <section aria-label={T("Profiles and platforms")} className="bg-slate-50 text-navy-900">
      <div className={`${wrap} py-12 flex flex-col lg:flex-row gap-6 lg:items-center`}>
        <p className="font-display text-xs tracking-[.25em] uppercase text-slate-600 shrink-0">{T("Find us on & work with")}</p>
        <ul className="flex flex-wrap gap-3">
          {items.map(i => <li key={i.n}>{i.u ? <a href={i.u} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:border-blue-brand hover:text-blue-brand transition">{i.n} ↗</a>
            : <span className="inline-flex rounded-full bg-slate-200/60 px-4 py-2 text-sm text-slate-700">{i.n}</span>}</li>)}
        </ul>
      </div>
    </section>
  );
}
/** Giant marquee strip used as a CTA on every page. */
export function Marquee({ text = "Let's build something big", href = "/contact" }: { text?: string; href?: string }) {
  const t = T(text); const row = Array.from({ length: 4 }, (_, i) => <span key={i} className="flex items-center gap-10 pr-10"><span>{t}</span><img src="/emblem.svg" alt="" className="h-[.8em] w-auto" /></span>);
  return (
    <a href={L(href)} data-cursor={T("Talk")} aria-label={t} className="block overflow-hidden border-y border-white/10 py-6 sm:py-10 group">
      <div dir="ltr" className="mq flex w-max whitespace-nowrap font-display font-extrabold text-5xl sm:text-8xl text-white/90 group-hover:text-sky-brand transition-colors">{row}{row}</div>
    </a>
  );
}
export function CTA({ title = "Ready to dominate your market?", sub = "Join the agency that builds its own empires. Talk to us on WhatsApp, Telegram or call directly." }: { title?: string; sub?: string }) {
  return (<>
    <Marquee />
    <section className="px-5 sm:px-8 py-24">
      <div className="reveal relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-brand via-navy-800 to-navy-900 p-8 sm:p-16 border border-sky-brand/30">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <div><h2 data-split="scroll" className="font-display text-3xl sm:text-5xl font-extrabold text-white leading-tight">{T(title)}</h2><p className="mt-5 text-slate-200 text-lg">{T(sub)}</p></div>
          <div className="grid gap-3">
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener" className="rounded-2xl bg-[#178a3e] px-6 py-4 font-semibold text-white flex justify-between">WhatsApp <span aria-hidden>→</span></a>
            <a href={CONTACT.telegram} target="_blank" rel="noopener" className="rounded-2xl bg-[#1b6fa0] px-6 py-4 font-semibold text-white flex justify-between">Telegram @stagprime <span aria-hidden>→</span></a>
            <a href={CONTACT.tel} className="rounded-2xl bg-white px-6 py-4 font-semibold text-navy-900 flex justify-between"><span>{T("Call")} <span dir="ltr">{CONTACT.phone}</span></span> <span aria-hidden>→</span></a>
            <a href={L("/contact")} className="text-center text-sm text-slate-200 hover:text-white">{T("or send a project brief →")}</a>
          </div>
        </div>
      </div>
    </section>
  </>);
}
