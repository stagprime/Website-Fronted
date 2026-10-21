import { S } from "@/lib/site";
import { permanentRedirect } from "next/navigation";
import { loadLoc, L, T, getLoc } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, wrap, CTA } from "@/components/ui";
import { ai } from "@/lib/art";
import { SITE } from "@/lib/i18n";
import { CatNav, CatSection } from "@/components/Store";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params);  return await seoMeta("/store", "Digital Products, SaaS & Merch Store", "Shop Stag Prime's own products: Figma UI kit, KDP cover templates, POD automation script, free SEO checklist, Stag Prime Sentinel and original merch."); }
const productLd = (l: string, products = S().products) => ({ "@context": "https://schema.org", "@type": "ItemList", itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, item: p.kind === "saas"
  ? { "@type": "SoftwareApplication", name: p.n, description: p.d, applicationCategory: "BusinessApplication", operatingSystem: "Web", url: `${SITE}/${l}/stag-sentinel`, publisher: { "@id": `${SITE}/#org` }, offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Plans set up per team — request access", availability: "https://schema.org/InStock" } }
  : { "@type": "Product", name: p.n, description: p.d, brand: { "@type": "Brand", name: "Stag Prime" }, offers: { "@type": "Offer", priceCurrency: "USD", price: p.kind === "free" ? "0" : p.p.replace("$", ""), availability: "https://schema.org/InStock", url: `${SITE}/${l}/store#${p.slug}` } } })) });
export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ category?: string }> }) { await loadLoc(params); const { storeCats, stores } = S(); 
  // ?category=<slug> (used by social/calendar links) → canonical category page
  const q = (await searchParams).category; if (q && storeCats.some(c => c.slug === q)) permanentRedirect(L(`/store/${q}`));
  return (<>
    <JsonLd data={breadcrumb([["Store", "/store"]])} /><JsonLd data={productLd(getLoc())} />
    <PageHero img={ai("store-digital")} kicker="Our Store" title="Products we build — and use ourselves." sub="Every service area at Stag Prime also ships its own products: tools, templates, software and merch. Secure checkout by Stripe." crumbs={[["Store", "/store"]]} />
    <section className={`${wrap} pb-24`}>
      <CatNav />
      {storeCats.map(c => <CatSection key={c.slug} slug={c.slug} />)}
      <div className="mt-10 flex flex-wrap gap-3">{stores.map(s => <a key={s.n} href={s.u} target="_blank" rel="noopener" className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-sky-brand hover:text-white">{s.n} ↗</a>)}</div>
      <p className="mt-8 text-sm text-slate-300">{T("Bulk or custom orders?")} <a href={L("/contact")} className="font-semibold text-sky-brand">{T("Request a custom quote")} →</a></p>
    </section>
    <CTA title="Need a service instead?" sub="Every product category is backed by an in-house service team. See packages and starting prices, or ask for a custom quote." />
  </>);
}
