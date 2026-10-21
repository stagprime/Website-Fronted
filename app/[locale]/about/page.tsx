import { loadLoc, T } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, H2, wrap, CTA, TrustStrip } from "@/components/ui";
import { ai } from "@/lib/art";
import { founderLd } from "@/lib/people";
import Icon from "@/components/Icon";
import { Counter } from "@/components/Fx";
import Blocks from "@/components/Blocks";
import { coded } from "@/lib/cms/page";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); return await seoMeta("/about", "About Stag Prime — Operators, Not Just an Agency", "Stag Prime LLC is a Wyoming-registered full-service digital agency with an in-house team in Bangladesh, built by entrepreneurs for entrepreneurs."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); const c = coded("/about");
  return (<>
    <JsonLd data={breadcrumb([["About", "/about"]])} /><JsonLd data={founderLd()} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "AboutPage", url: "https://www.stagprime.com/en/about", mainEntity: { "@id": "https://www.stagprime.com/#org" }, speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "[data-speakable]"] } }} />
    <PageHero img={ai("page-about")} kicker="About Us" title={<>{T("Built by entrepreneurs,")} <span className="grad-text">{T("for entrepreneurs.")}</span></>} sub="Stag Prime started as a small group of operators building our own businesses. We scaled POD networks, launched SaaS products, and managed media channels — then realized the strategies we developed for ourselves were exactly what other businesses needed." crumbs={[["About", "/about"]]} />
    <Blocks sections={c.order} filter={x => x.type === "legacy"} legacy={{
    stats: <section className={`${wrap} pb-20 grid grid-cols-3 gap-4 max-w-3xl`}>{c.items<{ value: string; label: string }>("stats", "items").map((x, i) => <div key={i} className="glass rounded-3xl p-5 text-center"><div className="font-display text-3xl sm:text-5xl font-extrabold grad-text"><Counter value={x.value} /></div><p className="mt-2 text-xs sm:text-sm text-slate-400">{x.label}</p></div>)}</section>,
    vision: <section className="bg-slate-50 text-navy-900"><div className={`${wrap} py-20 grid md:grid-cols-2 gap-10`}>
      <div><Kicker light>{c.text("vision", "visionKicker")}</Kicker><p className="font-display text-2xl font-bold leading-snug">{c.text("vision", "vision")}</p></div>
      <div><Kicker light>{c.text("vision", "missionKicker")}</Kicker><p className="font-display text-2xl font-bold leading-snug">{c.text("vision", "mission")}</p></div></div></section>,
    story: <section className={`${wrap} py-20`}><Kicker>{c.text("story", "kicker")}</Kicker><H2>{c.text("story", "heading")}</H2>
      <p className="mt-6 max-w-3xl text-lg text-slate-300 leading-relaxed">{c.text("story", "body")}</p>
      <div className="mt-14 grid md:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-8"><Icon name="info" color="#48BDED" className="w-7 h-7" /><h3 className="mt-4 font-display text-xl font-bold text-white">{c.text("story", "usTitle")}</h3><p className="mt-2 text-slate-400">{c.text("story", "usText")}</p></div>
        <div className="glass rounded-3xl p-8"><Icon name="users" color="#1A936F" className="w-7 h-7" /><h3 className="mt-4 font-display text-xl font-bold text-white">{c.text("story", "bdTitle")}</h3><p className="mt-2 text-slate-400">{c.text("story", "bdText")}</p></div>
      </div></section>,
    founder: <section className={`${wrap} pb-20`}><div className="glass rounded-[2rem] p-8 sm:p-12 grid md:grid-cols-[auto_1fr] gap-8 items-center">
      <img src="/emblem.svg" alt="" className="h-24 w-auto" /><div><Kicker>{c.text("founder", "kicker")}</Kicker><h2 className="font-display text-2xl sm:text-3xl font-bold text-white">{c.val<string>("founder", "name")}</h2><p className="text-sky-brand">{c.text("founder", "role")}</p>
      <p data-speakable className="mt-4 text-slate-300 leading-relaxed">{c.text("founder", "bio")}</p></div></div></section>,
    trust: <TrustStrip />,
    }} />
    <CTA />
  </>);
}
