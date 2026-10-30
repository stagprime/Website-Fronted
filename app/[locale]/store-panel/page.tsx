import { S } from "@/lib/site";
import { notFound } from "next/navigation";
import { loadLoc, T, getLoc } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, wrap, Btn, CTA, Kicker, H2 } from "@/components/ui";
import { ai } from "@/lib/art";
import { SITE } from "@/lib/i18n";
import { ViewContent } from "@/components/Track";
// Stag Prime Store Panel — a Stag Prime service (like Sentinel). Name, description, price, features and the subscribe link come from the
// "store-panel" entry in the CMS Products setting; the page 404s when that entry is removed. Subscriptions run in the Store Panel app itself.
const panel = () => S().products.find(x => x.slug === "store-panel");
const origin = (u: string) => { try { return new URL(u).origin; } catch { return u; } };
const faq: [string, string][] = [
  ["What is Stag Prime Store Panel?", "Store Panel is a multi-tenant store admin by Stag Prime LLC. Each business gets its own store admin to sell its own products and run its own delivery."],
  ["Is Store Panel for dropshipping?", "No. Store Panel is for businesses that own their products and handle their own delivery. It does not connect to dropshipping suppliers."],
  ["How much does it cost?", "One simple monthly plan. The current price is shown on this page and on the subscribe page."],
  ["How do I start?", "Choose Subscribe. You create your store account and pay securely with Stripe in Store Panel, then open your store admin."],
];
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); const p = panel(); return p ? await seoMeta("/store-panel", `${p.n} — Multi-Tenant Store Admin (${p.p})`, p.d) : {}; }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  await loadLoc(params); const p = panel(); if (!p) notFound(); const l = getLoc(); const url = p.url || "https://stag-prime-store-panel.vercel.app/subscribe";
  const amount = (p.p.match(/[\d.]+/) || [""])[0];
  const ld = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: p.n, applicationCategory: "BusinessApplication", applicationSubCategory: "E-commerce store admin", operatingSystem: "Web", url: `${SITE}/${l}/store-panel`, description: p.d, provider: { "@id": `${SITE}/#org` },
    ...(amount ? { offers: { "@type": "Offer", price: amount, priceCurrency: "USD", url, priceSpecification: { "@type": "UnitPriceSpecification", price: amount, priceCurrency: "USD", billingDuration: "P1M", unitCode: "MON" } } } : {}) };
  return (<>
    <JsonLd data={breadcrumb([["Store", "/store"], ["SaaS & Software", "/store/software"], [p.n, "/store-panel"]])} /><JsonLd data={ld} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: T(q), acceptedAnswer: { "@type": "Answer", text: T(a) } })) }} />
    <ViewContent name={p.n} type="saas" id="store-panel" />
    <PageHero img={ai("svc-saas")} color={p.color} kicker={`${T(p.n)} · ${p.p}`} title={T("Your own store. Your own products. Your own delivery.")} sub={T(p.d)} crumbs={[["Store", "/store"], ["SaaS & Software", "/store/software"], [p.n, "/store-panel"]]}>
      <div className="mt-9 flex flex-wrap gap-4 items-center"><Btn href={url} ext>{T("Subscribe")} — {p.p} →</Btn><Btn href={`${origin(url)}/login`} ghost ext>{T("Sign in to your store")}</Btn></div>
    </PageHero>
    <section className={`${wrap} pb-20 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-start`}>
      <div><Kicker>{T("What you get")}</Kicker><ul className="space-y-4">{(p.feats || []).map(f => <li key={f} className="flex gap-3 text-lg text-slate-200"><span style={{ color: p.color }}>✓</span>{T(f)}</li>)}</ul></div>
      <div className="glass rounded-3xl p-8"><Kicker>{T("Pricing")}</Kicker><p className="font-display text-4xl font-bold text-white">{p.p}</p><p className="mt-3 text-slate-300">{T("One store admin per business, billed monthly through Stripe.")}</p><div className="mt-6"><Btn href={url} ext>{T("Subscribe")} →</Btn></div></div>
    </section>
    <section className="bg-slate-50 text-navy-900"><div className={`${wrap} py-20 grid md:grid-cols-3 gap-6`}>
      {[["Multi-tenant", "Every business gets its own separate store admin, data and staff logins."], ["Your own products", "Add your own products, prices and stock — you own the catalogue."], ["Your own delivery", "Fulfil and deliver orders yourself. No dropshipping, no middleman."]].map(([t, d]) =>
        <article key={t} className="rounded-3xl bg-white border border-slate-200 p-7"><h2 className="font-display text-lg font-bold">{T(t)}</h2><p className="mt-3 text-sm text-slate-600">{T(d)}</p></article>)}
    </div></section>
    <section className={`${wrap} py-20 grid lg:grid-cols-2 gap-12`}>
      <div><Kicker>{T("Questions")}</Kicker><H2>Store Panel, answered.</H2></div>
      <div>{faq.map(([q, a]) => <details key={q} className="mb-3 rounded-2xl border border-white/10 p-5"><summary className="cursor-pointer font-semibold text-white">{T(q)}</summary><p className="mt-3 text-slate-300">{T(a)}</p></details>)}</div>
    </section>
    <CTA title="Need a custom store instead?" sub="Tell us about your shop and we'll build it for you." />
  </>);
}
