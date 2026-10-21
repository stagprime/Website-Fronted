import { useParamsLoc, L, T, TT } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, H2, wrap, Btn, CTA, TrustStrip } from "@/components/ui";
import { ai } from "@/lib/art";
import { founderLd } from "@/lib/people";
import Icon from "@/components/Icon";
import { Counter } from "@/components/Fx";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); return await seoMeta("/about", "About Stag Prime — Operators, Not Just an Agency", "Stag Prime LLC is a Wyoming-registered full-service digital agency with an in-house team in Bangladesh, built by entrepreneurs for entrepreneurs."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params);
  return (<>
    <JsonLd data={breadcrumb([["About", "/about"]])} /><JsonLd data={founderLd()} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "AboutPage", url: "https://www.stagprime.com/en/about", mainEntity: { "@id": "https://www.stagprime.com/#org" }, speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "[data-speakable]"] } }} />
    <PageHero img={ai("page-about")} kicker="About Us" title={<>{T("Built by entrepreneurs,")} <span className="grad-text">{T("for entrepreneurs.")}</span></>} sub="Stag Prime started as a small group of operators building our own businesses. We scaled POD networks, launched SaaS products, and managed media channels — then realized the strategies we developed for ourselves were exactly what other businesses needed." crumbs={[["About", "/about"]]} />
    <section className={`${wrap} pb-20 grid grid-cols-3 gap-4 max-w-3xl`}>{[["5+", "Years Experience"], ["150+", "Projects Done"], ["100%", "In-House Tech"]].map(([n, l]) => <div key={l} className="glass rounded-3xl p-5 text-center"><div className="font-display text-3xl sm:text-5xl font-extrabold grad-text"><Counter value={n} /></div><p className="mt-2 text-xs sm:text-sm text-slate-400">{TT(l)}</p></div>)}</section>
    <section className="bg-slate-50 text-navy-900"><div className={`${wrap} py-20 grid md:grid-cols-2 gap-10`}>
      <div><Kicker light>{T("Vision")}</Kicker><p className="font-display text-2xl font-bold leading-snug">{T("To become the most trusted and innovative digital partner for businesses worldwide, empowering growth through cutting-edge solutions and strategic guidance.")}</p></div>
      <div><Kicker light>{T("Mission")}</Kicker><p className="font-display text-2xl font-bold leading-snug">{T("To deliver comprehensive digital services that drive measurable results, create meaningful experiences, and build long-lasting client relationships.")}</p></div></div></section>
    <section className={`${wrap} py-20`}><Kicker>{T("Our story")}</Kicker><H2>{T("Every business deserves top-tier digital solutions.")}</H2>
      <p className="mt-6 max-w-3xl text-lg text-slate-300 leading-relaxed">{T("What started as a small team of creatives and strategists has grown into a full-service digital agency, delivering everything from marketing and advertising to e-commerce, SaaS, consulting and technology solutions. Stag Prime combines creativity, innovation and strategy to help brands thrive in a digital-first world.")}</p>
      <div className="mt-14 grid md:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-8"><Icon name="info" color="#48BDED" className="w-7 h-7" /><h3 className="mt-4 font-display text-xl font-bold text-white">{T("USA — Stag Prime LLC")}</h3><p className="mt-2 text-slate-400">Registered in Wyoming (2026). 30 N Gould St #23907, Sheridan, WY 82801, USA.</p></div>
        <div className="glass rounded-3xl p-8"><Icon name="users" color="#1A936F" className="w-7 h-7" /><h3 className="mt-4 font-display text-xl font-bold text-white">{T("Bangladesh — Operations")}</h3><p className="mt-2 text-slate-400">{T("Our in-house tech, design and marketing team. 268/C Kadirganj, Boalia, Rajshahi-6000.")}</p></div>
      </div></section>
    <section className={`${wrap} pb-20`}><div className="glass rounded-[2rem] p-8 sm:p-12 grid md:grid-cols-[auto_1fr] gap-8 items-center">
      <img src="/emblem.svg" alt="" className="h-24 w-auto" /><div><Kicker>{T("Founder")}</Kicker><h2 className="font-display text-2xl sm:text-3xl font-bold text-white">Md Tariq Hossain</h2><p className="text-sky-brand">{T("CEO / Founder, Stag Prime LLC")}</p>
      <p data-speakable className="mt-4 text-slate-300 leading-relaxed">{T("Md Tariq Hossain founded Stag Prime to bring the operator mindset to client work. Under his leadership the team built and sold the Stag VPN app, grew a print-on-demand network of 10,000+ designs across six marketplaces, publishes on Amazon KDP and YouTube, and builds its own SaaS, including Stag Prime Sentinel.")}</p></div></div></section>
    <TrustStrip /><CTA />
  </>);
}
