import { S } from "@/lib/site";
import { useParamsLoc, L, T, TT } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, H2, wrap, Btn, CTA, TrustStrip } from "@/components/ui";
import { ai } from "@/lib/art";
import Icon from "@/components/Icon";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); const { services, portfolio } = S();  return await seoMeta("/case-studies", "Case Studies & Consulting Services", "How Stag Prime delivers result-oriented solutions: our consulting approach across marketing, development, Amazon, YouTube and SaaS, with real case studies."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); const { services, portfolio } = S(); 
  return (<>
    <JsonLd data={breadcrumb([["Case Studies & Consulting", "/case-studies"]])} />
    <PageHero img={ai("svc-writing-consulting")} kicker="Case Studies & Consulting" title={<>{T("Result-oriented solutions,")} <span className="grad-text">{T("proven on our own businesses.")}</span></>} sub="Every engagement follows the same structure: understand the challenge, set goals, apply a strategy, and measure results." crumbs={[["Case Studies & Consulting", "/case-studies"]]} />
    <section className={`${wrap} pb-16 grid md:grid-cols-4 gap-4`}>{[["Overview", "Client, industry and the challenge."], ["Goals", "Clear, measurable KPIs."], ["Strategy", "The approach and channels used."], ["Results", "Metrics that prove the impact."]].map(([h, d], i) => <div key={h} className="reveal glass rounded-3xl p-6"><span className="font-display text-sky-brand">0{i + 1}</span><h2 className="mt-2 font-display font-bold text-white">{TT(h)}</h2><p className="mt-2 text-sm text-slate-400">{TT(d)}</p></div>)}</section>
    <section className="bg-slate-50 text-navy-900"><div className={`${wrap} py-20`}><Kicker light>{T("Case studies")}</Kicker><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">{portfolio.map(p => <a key={p.slug} href={L(p.href || "/portfolio")} className="rounded-3xl bg-white border border-slate-200 p-6 hover:shadow-xl transition"><p className="text-xs uppercase tracking-widest" style={{ color: p.color }}>{T(p.cat)}</p><h3 className="mt-2 font-display font-bold">{T(p.t)}</h3><p className="mt-2 text-sm text-slate-600">{T(p.d)}</p></a>)}</div></div></section>
    <section className={`${wrap} py-20`}><Kicker>{T("Consulting areas")}</Kicker><H2>{T("Strategy for every growth channel.")}</H2>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{["Digital Marketing Strategy", "SEO Consulting", "Content Marketing", "Social Media Marketing", "Email Marketing", "PPC Consulting", "Branding & Positioning", "Analytics & Data / CRO", "Website UX Consulting", "E-commerce Strategy", "Training & Workshops", "Reputation Management", "Influencer Marketing", "Video Marketing", "Market Research & Feasibility"].map(c => <div key={c} className="rounded-2xl border border-white/10 bg-navy-800/50 p-5 text-white flex gap-3"><Icon name="chart" color="#48BDED" />{TT(c)}</div>)}</div>
      <div className="mt-10"><Btn href={`/services/${services[4].slug}`}>{T("Writing & Consulting service")} →</Btn></div></section>
    <CTA title="Book a free strategy consultation." />
  </>);
}
