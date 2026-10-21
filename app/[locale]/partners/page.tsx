import { S } from "@/lib/site";
import { loadLoc, T, TT } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, wrap, CTA } from "@/components/ui";
import { ai } from "@/lib/art";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params);  return await seoMeta("/partners", "Partners & Platforms", "Stag Prime operates on Redbubble, Amazon KDP, Teespring and Zazzle, and builds with Shopify, Google Ads, Meta Business and Payoneer."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); const { partners } = S(); 
  const B = ({ t, items, d }: { t: string; items: string[]; d: string }) => <div><Kicker>{TT(t)}</Kicker><p className="text-slate-400 mb-6">{TT(d)}</p><div className="grid grid-cols-2 gap-4">{items.map(i => <div key={i} className="reveal glass glow-card rounded-2xl p-6 font-display text-white">{TT(i)}</div>)}</div></div>;
  return (<>
    <JsonLd data={breadcrumb([["Partners", "/partners"]])} />
    <PageHero img={ai("page-about")} kicker="Strategic Alliances" title={<>{T("Collaborating with the world's best platforms.")}</>} crumbs={[["Partners", "/partners"]]} />
    <section className={`${wrap} pb-24 grid md:grid-cols-2 gap-12`}><B t="Marketplace partners" d="Platforms where we operate our POD & e-commerce networks." items={partners.marketplaces} /><B t="Tech stack" d="The tools that power our agency and client success." items={partners.tech} /></section>
    <CTA title="Want to partner with Stag Prime?" sub="Let's create synergy and grow together." />
  </>);
}
