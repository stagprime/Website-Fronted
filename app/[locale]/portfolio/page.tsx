import { S } from "@/lib/site";
import { loadLoc, L, T } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, H2, wrap, CTA } from "@/components/ui";
import { ai } from "@/lib/art";
import Image from "next/image";
import { MerchGrid } from "@/components/Galleries";
import { vpn } from "@/lib/art";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params);  return await seoMeta("/portfolio", "Company Portfolio & Case Studies", "Real results: Stag VPN built and sold to NexGlobo, a FinTech dashboard for a US client, 300% ROI e-commerce campaigns, and Redbubble best-selling designs."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); const { portfolio } = S(); 
  return (<>
    <JsonLd data={breadcrumb([["Portfolio", "/portfolio"]])} />
    <PageHero img={ai("hero-collage")} kicker="Our Masterpieces" title={<>{T("Real results.")} <span className="grad-text">{T("Real growth.")}</span></>} sub="Selected work across development, marketing and creative & POD." crumbs={[["Portfolio", "/portfolio"]]} />
    <section className={`${wrap} pb-24 grid md:grid-cols-2 gap-6`}>{portfolio.map(p => {
      const inner = (<><div className="h-48 rounded-2xl mb-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${p.color}, #0E2346)` }}>{p.slug === "stag-vpn" ? <Image src={vpn("site-phone").web} alt="Stag VPN app on two phones" fill sizes="40rem" className="object-contain p-2" /> : <div className="absolute inset-0 grid-bg opacity-70" />}<span className="absolute bottom-4 left-5 font-display text-2xl font-extrabold text-white/90">{T(p.t)}</span></div>
        <p className="text-xs uppercase tracking-widest" style={{ color: p.color }}>{T(p.cat)}</p><h2 className="mt-2 font-display text-xl font-bold text-white">{T(p.t)}</h2><p className="mt-2 text-slate-400">{T(p.d)}</p>{p.href && <span className="mt-4 inline-block text-sm font-semibold text-sky-brand">{T("Read case study")} →</span>}</>);
      return p.href ? <a key={p.slug} href={L(p.href)} className="reveal glass glow-card rounded-3xl p-6">{inner}</a> : <article key={p.slug} className="reveal glass rounded-3xl p-6">{inner}</article>; })}</section>
    <section className={`${wrap} pb-20`}><Kicker>{T("Creative & POD — live designs")}</Kicker><MerchGrid /></section>
    <section className="bg-slate-50 text-navy-900"><div className={`${wrap} py-16 flex flex-wrap justify-between items-center gap-6`}><H2 light>{T("Have a project in mind?")}</H2><div className="flex gap-4"><a href={L("/case-studies")} className="font-semibold text-blue-brand">{T("Our consulting approach")} →</a></div></div></section>
    <CTA />
  </>);
}
