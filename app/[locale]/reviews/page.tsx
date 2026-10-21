import { S } from "@/lib/site";
import { useParamsLoc, L, T, TT } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, H2, wrap, Btn, CTA, TrustStrip } from "@/components/ui";
import { ai } from "@/lib/art";
import Icon from "@/components/Icon";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); const { profiles } = S();  return await seoMeta("/reviews", "Reviews & Public Profiles", "Read independent reviews of Stag Prime on Trustpilot, Clutch, Yelp, Crunchbase and Google Play."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); const { profiles } = S(); 
  return (<>
    <JsonLd data={breadcrumb([["Reviews", "/reviews"]])} />
    <PageHero img={ai("manifesto-studio")} kicker="Reviews" title={<>{T("Don't take our word for it —")} <span className="grad-text">{T("check our profiles.")}</span></>} sub="We only show verified, independent reviews. Read them directly on each platform, or leave one after your project." crumbs={[["Reviews", "/reviews"]]} />
    <section className={`${wrap} pb-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-6`}>{profiles.map(p => <a key={p.n} href={p.u} target="_blank" rel="noopener" className="reveal glass glow-card rounded-3xl p-8"><Icon name="star" color="#20BF55" className="w-7 h-7" /><h2 className="mt-4 font-display text-xl font-bold text-white">{p.n}</h2><p className="mt-2 text-slate-400">{T(p.d)}</p><span className="mt-5 inline-block text-sm font-semibold text-sky-brand">{T("Open profile")} ↗</span></a>)}</section>
    <CTA title="Worked with us?" sub="We'd love your honest feedback on Trustpilot or Clutch." />
  </>);
}
