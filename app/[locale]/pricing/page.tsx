import { S } from "@/lib/site";
import { loadLoc, L, T, TT } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, wrap, CTA } from "@/components/ui";
import { ai } from "@/lib/art";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params);  return await seoMeta("/pricing", "Pricing — Service Packages & Starting Prices", "Transparent starting prices for SEO, social media, app and web development, content writing, AI video, Amazon KDP and Merch design. Custom quotes for larger projects."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); const { pricing, products } = S(); 
  return (<>
    <JsonLd data={breadcrumb([["Pricing", "/pricing"]])} />
    <PageHero img={ai("store-digital")} kicker="Pricing" title={<>{T("Clear starting prices.")} <span className="grad-text">{T("Custom quotes for scale.")}</span></>} sub="Every project is scoped individually — these are typical starting points. Larger or enterprise projects get a tailored proposal." crumbs={[["Pricing", "/pricing"]]} />
    <section className={`${wrap} pb-20 grid md:grid-cols-2 gap-6`}>{pricing.map(p => (
      <article key={p.area} className="reveal glass rounded-3xl p-8 relative overflow-hidden"><div className="absolute top-0 left-0 h-1 w-full" style={{ background: p.color }} />
        <h2 className="font-display text-xl font-bold text-white">{T(p.area)}</h2>
        <table className="mt-6 w-full text-sm"><tbody>{p.rows.map(([n, v]) => <tr key={n} className="border-t border-white/10"><td className="py-3.5 pr-4 text-slate-300">{TT(n)}</td><td className="py-3.5 text-right font-display text-white whitespace-nowrap">{TT(v)}</td></tr>)}</tbody></table>
        <div className="mt-6 flex gap-4 text-sm"><a href={L(`/services/${p.slug}`)} className="font-semibold" style={{ color: p.color }}>{T("Service details")} →</a><a href={L("/contact")} className="text-slate-300 hover:text-white">{T("Request quote")}</a></div>
      </article>))}</section>
    <section className="bg-slate-50 text-navy-900"><div className={`${wrap} py-16`}><Kicker light>{T("Digital products")}</Kicker><div className="grid sm:grid-cols-4 gap-4">{products.map(p => <a key={p.slug} href={L(`/store#${p.slug}`)} className="rounded-2xl bg-white border border-slate-200 p-5"><p className="font-semibold">{p.n}</p><p className="font-display text-2xl mt-2">{p.p}</p></a>)}</div>
      <p className="mt-6 text-xs text-slate-500">{T("Prices in USD. Payments processed securely by Stripe. Taxes may apply.")}</p></div></section>
    <CTA />
  </>);
}
