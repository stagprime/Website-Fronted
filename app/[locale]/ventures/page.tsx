import { S } from "@/lib/site";
import { loadLoc, L, T } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, wrap, CTA } from "@/components/ui";
import { ai } from "@/lib/art";
import Icon from "@/components/Icon";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params);  return await seoMeta("/ventures", "Ventures & Businesses", "Stag Prime builds its own products: Stag VPN, a print-on-demand network across six marketplaces, KDP & YouTube media, and software tools."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); const { ventures } = S(); 
  return (<>
    <JsonLd data={breadcrumb([["Ventures", "/ventures"]])} />
    <PageHero img={ai("venture-pod-merch")} kicker="Internal Assets" title={<>{T("We practice")} <span className="grad-text">{T("what we preach.")}</span></>} sub="Unlike traditional agencies, we are active operators. We build, scale, and monetize our own digital products." crumbs={[["Ventures", "/ventures"]]} />
    <section className={`${wrap} pb-24 grid md:grid-cols-2 gap-6`}>{ventures.map(v => (
      <a key={v.slug} href={L(`/ventures/${v.slug}`)} className="reveal glass glow-card rounded-3xl p-8"><span className="grid place-items-center w-12 h-12 rounded-2xl" style={{ background: `${v.color}22` }}><Icon name={v.icon} color={v.color} className="w-6 h-6" /></span>
        <p className="mt-6 text-xs uppercase tracking-widest" style={{ color: v.color }}>{T(v.tag)}</p><h2 className="mt-2 font-display text-2xl font-bold text-white">{T(v.title)}</h2><p className="mt-3 text-slate-400">{T(v.body)}</p><span className="mt-6 inline-block text-sm font-semibold text-sky-brand">{T("Explore")} →</span></a>))}</section>
    <CTA title="Want us to build your empire?" sub="We use the same team, tools, and strategies for your project." />
  </>);
}
