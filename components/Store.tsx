import Image from "next/image";
import { BuyButton } from "./Buy";
import { L, T, getLoc } from "@/lib/loc";
import type { Product } from "@/content/site";
import { S } from "@/lib/site";
import { MerchGrid } from "./Galleries";
import Icon from "./Icon";
export function ProductCard({ p }: { p: Product }) {
  const l = getLoc(); const { storeCats } = S(); const cat = storeCats.find(c => c.slug === p.cat);
  const detail = p.slug === "stag-sentinel" ? "/stag-sentinel" : null;
  return (
    <article id={p.slug} className="reveal glass glow-card rounded-3xl p-6 flex flex-col scroll-mt-28">
      {p.img ? <Image src={p.img} alt={`${p.n} — ${T("product screenshot")}`} width={1024} height={640} sizes="(max-width:640px) 90vw, 22rem" className="h-36 w-full rounded-2xl object-cover object-left-top" />
        : <div className="h-36 rounded-2xl grid place-items-center" style={{ background: `linear-gradient(135deg, ${p.color}, #0E2346)` }}><Icon name={cat?.icon || "store"} color="#fff" className="w-10 h-10" /></div>}
      {cat && <a href={L(`/store/${cat.slug}`)} className="mt-4 text-[11px] uppercase tracking-[.2em]" style={{ color: cat.color }}>{T(cat.t)}</a>}
      <h3 className="mt-2 font-display font-bold text-white">{detail ? <a href={L(detail)} className="hover:text-sky-brand">{T(p.n)}</a> : T(p.n)}</h3>
      <p className="mt-2 text-sm text-slate-300 flex-1">{T(p.d)}</p>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><span className="font-display text-xl text-white">{p.kind === "digital" ? p.p : p.kind === "free" ? T("Free") : T("Team plans")}</span>
        {p.kind === "digital" && <BuyButton id={`product:${p.slug}`} locale={l} label={T("Buy with Stripe")} busy={T("Opening checkout…")} cursor={T("Buy")} />}
        {p.kind === "free" && <a href={L(`/contact?topic=${encodeURIComponent(p.n)}`)} className="rounded-full bg-gradient-to-r from-sky-brand to-blue-brand px-5 py-2.5 text-sm font-semibold text-white">{T("Get it free")}</a>}
        {p.kind === "saas" && <a href={L(detail || "/contact")} className="rounded-full bg-gradient-to-r from-sky-brand to-blue-brand px-5 py-2.5 text-sm font-semibold text-white">{T("Request access")}</a>}
      </div>
    </article>
  );
}
export function CatNav({ active }: { active?: string }) {
  const chip = (href: string, label: string, on: boolean, color = "#48BDED") => <a key={href} href={L(href)} aria-current={on ? "page" : undefined} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${on ? "text-navy-950" : "border-white/15 text-slate-200 hover:text-white"}`} style={on ? { background: color, borderColor: color } : undefined}>{label}</a>;
  const { storeCats } = S();
  return <nav aria-label={T("Store categories")} className="flex flex-wrap gap-2">{chip("/store", T("All products"), !active)}{storeCats.map(c => chip(`/store/${c.slug}`, T(c.t), active === c.slug, c.color))}</nav>;
}
export function CatSection({ slug, heading = true }: { slug: string; heading?: boolean }) {
  const { storeCats, products, services } = S(); const c = storeCats.find(x => x.slug === slug); if (!c) return null; const items = products.filter(p => p.cat === slug); const svc = services.find(s => s.slug === c.svc);
  return (
    <section aria-labelledby={`cat-${slug}`} className="mt-14">
      {heading && <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 id={`cat-${slug}`} className="font-display text-2xl font-bold text-white"><a href={L(`/store/${slug}`)} className="hover:text-sky-brand">{T(c.t)}</a></h2><p className="mt-1 text-sm text-slate-300">{T(c.d)}</p></div>
        {svc && <a href={L(`/services/${svc.slug}`)} className="text-sm font-semibold text-sky-brand">{T("Related service")}: {T(svc.title)} →</a>}</div>}
      {slug === "merch" ? <div className="mt-6"><MerchGrid n={12} /></div>
        : items.length ? <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{items.map(p => <ProductCard key={p.slug} p={p} />)}</div>
        : <div className="mt-6 rounded-3xl border border-dashed border-white/20 p-8 flex flex-wrap items-center justify-between gap-4"><p className="text-slate-200"><span className="font-display font-bold text-white">{T("Coming soon.")}</span> {T("We're preparing products in this category. Tell us what you need and we'll notify you at launch.")}</p>
            <a href={L(`/contact?topic=${encodeURIComponent(`Notify me: ${c.t}`)}`)} className="rounded-full border border-sky-brand/50 px-5 py-2.5 text-sm font-semibold text-sky-brand hover:bg-sky-brand/10">{T("Notify me / request a product")} →</a></div>}
    </section>
  );
}
/** Used on service pages: "Our products in this category". */
export function ServiceProducts({ svc }: { svc: string }) {
  const { storeCats, products } = S(); const c = storeCats.find(x => x.svc === svc); if (!c) return null; const items = products.filter(p => p.cat === c.slug);
  return (
    <section className="relative mx-auto max-w-7xl px-5 sm:px-8 py-16">
      <p className="font-display text-[11px] tracking-[.3em] uppercase mb-4 text-sky-brand">{T("Our products in this category")}</p>
      <div className="flex flex-wrap items-end justify-between gap-4"><h2 className="font-display text-3xl font-bold text-white">{T(c.t)}</h2><a href={L(`/store/${c.slug}`)} className="text-sm font-semibold text-sky-brand">{T("Open store category")} →</a></div>
      {items.length ? <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{items.map(p => <ProductCard key={p.slug} p={p} />)}</div>
        : <p className="mt-6 rounded-3xl border border-dashed border-white/20 p-6 text-slate-200">{T("Coming soon.")} <a href={L(`/contact?topic=${encodeURIComponent(`Notify me: ${c.t}`)}`)} className="font-semibold text-sky-brand">{T("Notify me / request a product")} →</a></p>}
    </section>
  );
}
