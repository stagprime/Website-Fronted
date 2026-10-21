import { useParamsLoc, L, T, TT } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, H2, wrap, Btn, CTA, TrustStrip } from "@/components/ui";
import { ai } from "@/lib/art";
import Icon from "@/components/Icon";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); return await seoMeta("/careers", "Careers & Internship Program", "Join Stag Prime: open roles across marketing, development, design, Amazon, YouTube and content, plus an internship program and student alumni network."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params);
  return (<>
    <JsonLd data={breadcrumb([["Careers", "/careers"]])} />
    <PageHero img={ai("page-careers")} kicker="Careers" title={<>{T("Grow with the")} <span className="grad-text">{T("Stag Squad.")}</span></>} sub="We hire full-time, part-time and freelance talent, and train the next generation through our internship and student programs." crumbs={[["Careers", "/careers"]]}><div className="mt-9"><Btn href="/job-apply">{T("Apply now")} →</Btn></div></PageHero>
    <section className={`${wrap} pb-24 grid md:grid-cols-3 gap-6`}>{[["Team roles", "Marketing, development, design, Amazon & YouTube, writing and consulting.", "briefcase"], ["Internship program", "Hands-on internships in Web Dev, App Dev, SEO and Content.", "users"], ["Students & alumni", "Training tracks in graphic design, CPA marketing and web development.", "book"]].map(([h, d, i]) => <div key={h} className="reveal glass rounded-3xl p-8"><Icon name={i} color="#48BDED" className="w-7 h-7" /><h2 className="mt-4 font-display text-xl font-bold text-white">{TT(h)}</h2><p className="mt-2 text-slate-400">{TT(d)}</p></div>)}</section>
    <CTA title="Ready to apply?" sub="Fill out the application — or message us on WhatsApp or Telegram." />
  </>);
}
