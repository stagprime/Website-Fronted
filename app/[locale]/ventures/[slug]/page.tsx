import { S } from "@/lib/site";
import { loadLoc, T, TT } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, wrap, Btn, CTA } from "@/components/ui";
import { ai } from "@/lib/art";
import { notFound } from "next/navigation";
import { MerchGrid, VpnShots } from "@/components/Galleries";
export async function generateStaticParams() { const { getSettings } = await import("@/lib/settings"); return (await getSettings()).ventures.map(v => ({ slug: v.slug })); }
type P = { params: Promise<{ slug: string; locale: string }> };
export async function generateMetadata({ params }: P) { await loadLoc(params); const { ventures } = S();  const { slug } = await params; const v = ventures.find(x => x.slug === slug); return v ? await seoMeta(`/ventures/${v.slug}`, v.title, v.body) : {}; }
const ventImg: Record<string, string> = { "stag-vpn": "venture-stag-vpn", "print-on-demand": "venture-pod-merch", media: "svc-amazon-youtube-automation", software: "svc-saas" };
export default async function Page({ params }: P) { await loadLoc(params); const { ventures } = S(); 
  const { slug } = await params; const v = ventures.find(x => x.slug === slug); if (!v) notFound();
  return (<>
    <JsonLd data={breadcrumb([["Ventures", "/ventures"], [v.title, `/ventures/${v.slug}`]])} />
    <PageHero img={ai(ventImg[v.slug])} kicker={T(v.tag)} title={T(v.title)} sub={T(v.body)} color={v.color} crumbs={[["Ventures", "/ventures"], [v.title, `/ventures/${v.slug}`]]}>
      {v.slug === "stag-vpn" && <div className="mt-9"><Btn href="/portfolio/stag-vpn">{T("Read the full case study")} →</Btn></div>}
    </PageHero>
    <section className={`${wrap} pb-20 grid lg:grid-cols-2 gap-10`}>
      <div><Kicker>{T("Highlights")}</Kicker><ul className="grid gap-3">{v.points.map(p => <li key={p} className="reveal glass rounded-2xl p-5 flex gap-3 text-white"><span style={{ color: v.color }}>✓</span>{TT(p)}</li>)}</ul></div>
      {v.links && <div><Kicker>{v.slug === "print-on-demand" ? "Shop our stores" : "Links"}</Kicker><div className="grid sm:grid-cols-2 gap-3">{v.links.map(l => <a key={l.n} href={l.u} target="_blank" rel="noopener" className="reveal glow-card rounded-2xl border border-white/10 bg-navy-800/60 p-5 font-display text-white flex justify-between">{l.n}<span className="text-sky-brand">↗</span></a>)}</div></div>}
    </section>
    {v.slug === "print-on-demand" && <section className={`${wrap} pb-20`}><Kicker>{T("Real designs from our stores")}</Kicker><MerchGrid /></section>}
    {v.slug === "stag-vpn" && <section className={`${wrap} pb-20`}><Kicker>{T("From the Google Play listing")}</Kicker><VpnShots /></section>}
    <CTA />
  </>);
}
