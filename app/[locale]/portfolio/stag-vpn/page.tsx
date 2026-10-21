import { loadLoc, T, TT } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, wrap, CTA } from "@/components/ui";
import { ai } from "@/lib/art";
import { SITE } from "@/lib/i18n";
import Image from "next/image";
import { VpnShots } from "@/components/Galleries";
import { vpn } from "@/lib/art";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); return await seoMeta("/portfolio/stag-vpn", "Stag VPN Case Study — Built In-House, Sold to NexGlobo", "How Stag Prime designed, built and scaled the Stag VPN Android app — rated about 4.8★ on Google Play — and transferred it to NexGlobo."); }
const blocks = [
  ["The challenge", "Build a fast, secure, privacy-first VPN app that could compete in a crowded market, monetize sustainably and be ready to hand over to a new owner."],
  ["What we built", "A complete Android VPN product: UI/UX, app engineering, support for industry-standard tunneling protocols, server management for a 50+ location network, and integrated monetization and notifications."],
  ["Growth", "App Store Optimization and subscription marketing grew an engaged user base, earning a Google Play rating of about 4.8★."],
  ["The outcome", "Stag VPN was successfully sold to NexGlobo, with the production-ready client application delivered and a deployment roadmap for the new owner's infrastructure team."],
];
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params);
  const ld = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Stag VPN", operatingSystem: "Android", applicationCategory: "SecurityApplication", url: "https://play.google.com/store/apps/details?id=com.doracone.stagvpn", creator: { "@id": `${SITE}/#org` } };
  return (<>
    <JsonLd data={breadcrumb([["Portfolio", "/portfolio"], ["Stag VPN", "/portfolio/stag-vpn"]])} /><JsonLd data={ld} />
    <PageHero img={ai("venture-stag-vpn")} kicker="Case Study · SaaS Product" title={<>{T("Stag VPN:")} <span className="grad-text">{T("built, scaled, sold.")}</span></>} sub="Secure. Fast. Private. An in-house product that showcases our app development, server management and subscription marketing." crumbs={[["Portfolio", "/portfolio"], ["Stag VPN", "/portfolio/stag-vpn"]]}>
      <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl">{[["~4.8★", "Google Play rating"], ["50+", "Server locations managed"], ["Android", "Platform"], ["Acquired", "by NexGlobo"]].map(([a, b]) => <div key={b} className="glass rounded-2xl p-4"><dt className="text-xs text-slate-400">{TT(b)}</dt><dd className="font-display text-xl text-white mt-1">{TT(a)}</dd></div>)}</dl>
    </PageHero>
    <section className={`${wrap} pb-16`}><div className="overflow-hidden rounded-[2rem] border border-white/10"><Image src={vpn("site-banner").web} alt="Stag VPN app on a phone in hand" width={1024} height={684} sizes="(max-width:1280px) 100vw, 80rem" className="w-full h-auto" /></div></section>
    <section className={`${wrap} pb-16`}><Kicker>{T("App screenshots")}</Kicker><VpnShots /></section>
    <section className={`${wrap} pb-20 grid md:grid-cols-2 gap-6`}>{blocks.map(([h, d], i) => <article key={h} className="reveal glass rounded-3xl p-8"><span className="font-display text-sky-brand">0{i + 1}</span><h2 className="mt-3 font-display text-2xl font-bold text-white">{TT(h)}</h2><p className="mt-3 text-slate-300 leading-relaxed">{TT(d)}</p></article>)}</section>
    <section className="bg-slate-50 text-navy-900"><div className={`${wrap} py-16`}><Kicker light>{T("Capabilities shown")}</Kicker><div className="flex flex-wrap gap-3">{["App Development", "UI/UX", "Server Management", "Protocol Engineering", "AdMob Monetization", "ASO", "Subscription Marketing", "Product Transfer"].map(c => <span key={c} className="rounded-full bg-white border border-slate-200 px-4 py-2 text-sm">{TT(c)}</span>)}</div>
      <div className="mt-8 flex gap-6 flex-wrap"><a href="https://play.google.com/store/apps/details?id=com.doracone.stagvpn" target="_blank" rel="noopener" className="font-semibold text-blue-brand">{T("Google Play listing")} ↗</a><a href="http://nexglobo.com/" target="_blank" rel="noopener" className="font-semibold text-blue-brand">{T("NexGlobo")} ↗</a></div></div></section>
    <CTA title="Want a product like this?" sub="We build apps end-to-end — and know how to grow and sell them." />
  </>);
}
