import { S } from "@/lib/site";
import Image from "next/image";
import { loadLoc, T, getLoc } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, wrap, Btn, CTA, Kicker, H2 } from "@/components/ui";
import { ai } from "@/lib/art";
import { SITE } from "@/lib/i18n";
import { BuyButton } from "@/components/Buy";
import { ViewContent } from "@/components/Track";
import RelatedGuides from "@/components/RelatedGuides";
const faq: [string, string][] = [
  ["What is Stag Prime Sentinel?", "Stag Prime Sentinel is an infrastructure monitoring platform by Stag Prime LLC. It gives approved teams one secure view of every server and every client workspace, with role-based access."],
  ["Who is Sentinel for?", "Teams that operate server fleets for several clients or brands — for example VPN businesses, hosting resellers and agencies managing client infrastructure."],
  ["Which user roles are supported?", "Sentinel accounts can be administrator, staff, view-only or client accounts, so each person sees exactly what they should."],
  ["How do I get access?", "Sentinel is available to approved teams. Request access and our team will contact you to set up your workspace and plan."],
  ["How are logins secured?", "Sessions are kept in a secure cookie and passwords are never stored in the browser."],
];
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); return await seoMeta("/stag-sentinel", "Stag Prime Sentinel — Multi-Client Server Monitoring", "Role-based infrastructure monitoring for VPN businesses and multi-client teams: every server, every client, one secure view. Request access.", "/img/real/sentinel-login.webp"); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); const { products } = S(); const p = products.find(x => x.slug === "stag-sentinel") ?? products.find(x => x.kind === "saas")!; 
  const l = getLoc();
  const ld = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Stag Prime Sentinel", applicationCategory: "BusinessApplication", applicationSubCategory: "Infrastructure monitoring", operatingSystem: "Web", url: "https://sentinel.stagprime.com/", image: `${SITE}/img/real/sentinel-login.webp`, description: T(p.d), featureList: p.feats, publisher: { "@id": `${SITE}/#org` }, offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Plans configured per team on request", availability: "https://schema.org/InStock" } };
  return (<>
    <JsonLd data={breadcrumb([["Store", "/store"], ["SaaS & Software", "/store/software"], ["Stag Prime Sentinel", "/stag-sentinel"]])} /><JsonLd data={ld} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: T(q), acceptedAnswer: { "@type": "Answer", text: T(a) } })) }} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "WebPage", url: `${SITE}/${l}/stag-sentinel`, speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "[data-speakable]"] } }} />
    <ViewContent name="Stag Prime Sentinel" type="saas" id="stag-sentinel" />
    <PageHero img={ai("svc-saas")} color="#3FB7D3" kicker="Stag Prime Sentinel · Infrastructure Intelligence" title="Every server. Every client. One secure view." sub="Role-based infrastructure monitoring for approved teams and client workspaces — built by the team that ran 50+ global VPN servers." crumbs={[["Store", "/store"], ["SaaS & Software", "/store/software"], ["Stag Prime Sentinel", "/stag-sentinel"]]}>
      <div className="mt-9 flex flex-wrap gap-4 items-start"><BuyButton id="sub:stag-sentinel" locale={l} label={T("Request access")} busy={T("Opening…")} className="rounded-full bg-gradient-to-r from-sky-brand to-blue-brand px-7 py-3.5 font-semibold text-white" /><Btn href="https://sentinel.stagprime.com/" ghost ext>{T("Sign in to Sentinel")} ↗</Btn></div>
    </PageHero>
    <section className={`${wrap} pb-20 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center`}>
      <a href="https://sentinel.stagprime.com/" target="_blank" rel="noopener" data-cursor={T("Open")} className="block overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50"><Image src="/img/real/sentinel-login.webp" alt={T("Stag Prime Sentinel secure sign-in screen")} width={1024} height={640} sizes="(max-width:1024px) 100vw, 55vw" priority fetchPriority="high" className="w-full h-auto" /></a>
      <div><Kicker>{T("Features")}</Kicker><ul className="space-y-4">{p.feats!.map(f => <li key={f} className="flex gap-3 text-lg text-slate-200"><span className="text-sky-brand">✓</span>{T(f)}</li>)}</ul></div>
    </section>
    <section className="bg-slate-50 text-navy-900"><div className={`${wrap} py-20 grid md:grid-cols-3 gap-6`}>
      {[["For VPN businesses", "Watch every node across every location and client brand from one dashboard."], ["For resellers & white-label partners", "Give each client a separate workspace that shows only their servers."], ["For operations teams", "Admins, staff and view-only support users each get the right level of access."]].map(([h, d]) => <div key={h} className="rounded-3xl bg-white border border-slate-200 p-7"><h2 className="font-display text-lg font-bold">{T(h)}</h2><p data-speakable className="mt-2 text-slate-700">{T(d)}</p></div>)}
    </div></section>
    <section className={`${wrap} py-20 grid lg:grid-cols-2 gap-12`}>
      <div><Kicker>{T("Learn more")}</Kicker><H2>Read the VPN server monitoring guide.</H2><p className="mt-4 text-slate-300">{T("Metrics, alerting, access control and a rollout plan for multi-location VPN fleets.")}</p><div className="mt-6"><Btn href="/blog/vpn-server-monitoring">{T("Read the guide")} →</Btn></div></div>
      <div>{faq.map(([q, a]) => <details key={q} className="mb-3 rounded-2xl border border-white/10 p-5"><summary className="cursor-pointer font-semibold text-white">{T(q)}</summary><p className="mt-3 text-slate-300">{T(a)}</p></details>)}</div>
    </section>
    <RelatedGuides match={/monitor|uptime|server/i} title="Server monitoring guides" />
    <CTA title="Want Sentinel for your servers?" sub="Tell us about your infrastructure and we'll set up a workspace for your team." />
  </>);
}
