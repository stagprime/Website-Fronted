import { S, gigOf } from "@/lib/site";
import { useParamsLoc, L, T, TT, getLoc } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, H2, wrap, Btn, CTA, TrustStrip } from "@/components/ui";
import { ai } from "@/lib/art";
import { GigPackages } from "@/components/Gig";
import { ServiceProducts } from "@/components/Store";
import Icon from "@/components/Icon";
import { notFound } from "next/navigation";
import { SITE } from "@/lib/i18n";
export async function generateStaticParams() { const { getSettings } = await import("@/lib/settings"); return (await getSettings()).services.map(s => ({ slug: s.slug })); }
type P = { params: Promise<{ slug: string; locale: string }> };
export async function generateMetadata({ params }: P) { await useParamsLoc(params); const { services, pricing, extended, faqs, process } = S();  const { slug } = await params; const s = services.find(x => x.slug === slug); return s ? await seoMeta(`/services/${s.slug}`, `${T(s.title)} Services`, s.intro) : {}; }
export default async function Page({ params }: P) { await useParamsLoc(params); const { services, pricing, extended, faqs, process } = S(); 
  const { slug } = await params; const s = services.find(x => x.slug === slug); if (!s) notFound();
  const price = pricing.find(p => p.slug === s.slug); const others = services.filter(x => x.slug !== s.slug);
  const ld = { "@context": "https://schema.org", "@type": "Service", name: s.title, serviceType: s.title, description: s.intro, provider: { "@id": `${SITE}/#org` }, areaServed: "Worldwide", url: `${SITE}/${getLoc()}/services/${s.slug}`,
    hasOfferCatalog: { "@type": "OfferCatalog", name: s.title, itemListElement: (gigOf(s.slug)?.pkgs || []).map(p => ({ "@type": "Offer", name: p.name, price: p.price, priceCurrency: "USD", availability: "https://schema.org/InStock", itemOffered: { "@type": "Service", name: `${s.title} — ${p.name}` } })) } };
  return (<>
    <JsonLd data={breadcrumb([["Services", "/services"], [s.title, `/services/${s.slug}`]])} /><JsonLd data={ld} />
    <PageHero img={ai(`svc-${s.slug}`)} kicker={T(s.short)} title={T(s.title)} sub={T(s.intro)} color={s.color} crumbs={[["Services", "/services"], [s.title, `/services/${s.slug}`]]}>
      <div className="mt-9 flex flex-wrap gap-4"><Btn href="#packages">{T("See packages & order")} →</Btn><Btn href="/contact" ghost>{T("Get a custom quote")}</Btn><Btn href="https://wa.me/13073964184" ghost ext>{T("WhatsApp us")}</Btn></div>
    </PageHero>
    <section className={`${wrap} pb-20`}>
      <div className="grid md:grid-cols-3 gap-5">{s.subs.map((x, i) => (
        <article key={T(x.t)} className="reveal glass glow-card rounded-3xl p-7"><span className="font-display text-sm" style={{ color: s.color }}>0{i + 1}</span><h2 className="mt-4 font-display text-lg font-bold text-white">{T(x.t)}</h2><p className="mt-3 text-slate-400">{T(x.d)}</p></article>))}</div>
    </section>
    <section className="bg-slate-50 text-navy-900"><div className={`${wrap} py-20 grid lg:grid-cols-2 gap-12`}>
      <div><Kicker light>{T("Full capability list")}</Kicker><H2 light>Everything included in {s.title.toLowerCase()}.</H2>
        <ul className="mt-8 grid sm:grid-cols-2 gap-3">{(extended[s.slug] || []).map(e => <li key={e} className="flex gap-3 rounded-2xl bg-white border border-slate-200 p-4 text-sm"><span style={{ color: s.color }}>✓</span>{TT(e)}</li>)}</ul></div>
      <div><Kicker light>{T("Outcomes")}</Kicker><ul className="space-y-3">{s.outcomes.map(o => <li key={o} className="font-display text-xl sm:text-2xl font-bold">{TT(o)}</li>)}</ul>
        {price && <div className="mt-10 rounded-3xl bg-navy-900 text-white p-7"><p className="font-display text-sm text-sky-brand">{T("Starting prices")}</p><table className="mt-4 w-full text-sm"><tbody>{price.rows.map(([n, p]) => <tr key={n} className="border-t border-white/10"><td className="py-3 pr-4 text-slate-300">{TT(n)}</td><td className="py-3 text-right font-display">{TT(p)}</td></tr>)}</tbody></table><p className="mt-4 text-xs text-slate-400">{T("Final quote depends on scope.")} <a href={L("/pricing")} className="text-sky-brand">{T("All pricing")} →</a></p></div>}
      </div></div></section>
    <GigPackages svc={s.slug} color={s.color} />
    <ServiceProducts svc={s.slug} />
    <section className={`${wrap} py-20`}><Kicker>{T("Process")}</Kicker><ol className="grid md:grid-cols-4 gap-5">{process.map(([h, d], i) => <li key={h} className="rounded-3xl border border-white/10 p-6"><span className="font-display" style={{ color: s.color }}>0{i + 1}</span><h3 className="mt-2 font-display font-bold text-white">{TT(h)}</h3><p className="mt-2 text-sm text-slate-400">{TT(d)}</p></li>)}</ol>
      <div className="mt-16"><Kicker>{T("Other services")}</Kicker><div className="flex flex-wrap gap-3">{others.map(o => <a key={o.slug} href={L(`/services/${o.slug}`)} className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-slate-300 hover:text-white hover:border-sky-brand">{T(o.title)}</a>)}</div></div></section>
    <CTA title="Ready to grow? Let's talk." />
  </>);
}
