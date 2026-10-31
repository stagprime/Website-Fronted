import { S } from "@/lib/site";
import { loadLoc, L, T, TT } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, H2, wrap, CTA } from "@/components/ui";
import { ai } from "@/lib/art";
import Icon from "@/components/Icon";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params);  return await seoMeta("/services", "Services — Marketing, Development, AI, Amazon & SaaS", "Explore Stag Prime's complete growth stack: digital marketing, web & app development, Amazon & YouTube automation, AI video & animation, writing & consulting, and SaaS."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); const { services, process } = S(); 
  return (<>
    <JsonLd data={breadcrumb([["Services", "/services"]])} />
    <PageHero img={ai("hero-collage")} kicker="Elite Digital Solutions" title={<>{T("From strategy to execution —")} <span className="grad-text">{T("we handle everything.")}</span></>} sub="Six service areas, one in-house team. Pick an area to see what's included and starting prices." crumbs={[["Services", "/services"]]} />
    <section className={`${wrap} pb-24 grid gap-6 md:grid-cols-2 lg:grid-cols-3`}>
      {services.map((s, i) => (
        <a key={s.slug} href={L(`/services/${s.slug}`)} className="reveal glass glow-card group relative overflow-hidden rounded-3xl p-8 flex flex-col">
          <div className="absolute -top-16 -end-16 w-48 h-48 rounded-full opacity-20 blur-3xl group-hover:opacity-50 transition" style={{ background: s.color }} />
          <div className="flex justify-between"><span className="grid place-items-center w-12 h-12 rounded-2xl" style={{ background: `${s.color}22` }}><Icon name={s.icon} color={s.color} className="w-6 h-6" /></span><span className="font-display text-xs text-slate-300">0{i + 1}</span></div>
          <h2 className="mt-6 font-display text-xl font-bold text-white leading-snug min-h-[3.25rem]">{T(s.title)}</h2><p className="mt-3 text-slate-400 leading-relaxed">{T(s.intro)}</p>
          <ul className="mt-5 space-y-2 text-sm text-slate-300">{s.subs.map(x => <li key={x.t} className="flex gap-2"><span style={{ color: s.color }}>▸</span>{T(x.t)}</li>)}</ul>
          <span className="mt-auto pt-6 inline-block text-sm font-semibold" style={{ color: s.color }}>{T("View details")} →</span>
        </a>))}
    </section>
    <section className="bg-slate-50 text-navy-900"><div className={`${wrap} py-20`}><Kicker light>{T("How We Work")}</Kicker><H2 light>{T("Analyze → Strategize → Execute → Scale")}</H2>
      <ol className="mt-10 grid md:grid-cols-4 gap-5">{process.map(([h, d], i) => <li key={h} className="rounded-3xl bg-white border border-slate-200 p-6"><span className="font-display text-blue-brand">0{i + 1}</span><h3 className="mt-2 font-display font-bold">{TT(h)}</h3><p className="mt-2 text-sm text-slate-600">{TT(d)}</p></li>)}</ol></div></section>
    <CTA />
  </>);
}
