import { loadLoc, T } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, wrap, Btn, CTA } from "@/components/ui";
import { ai } from "@/lib/art";
import Icon from "@/components/Icon";
import Blocks from "@/components/Blocks";
import { coded } from "@/lib/cms/page";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); return await seoMeta("/careers", "Careers & Internship Program", "Join Stag Prime: open roles across marketing, development, design, Amazon, YouTube and content, plus an internship program and student alumni network."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); const c = coded("/careers"); const apply = c.order.find(x => x.id === "apply")?.visible !== false;
  return (<>
    <JsonLd data={breadcrumb([["Careers", "/careers"]])} />
    <PageHero img={ai("page-careers")} kicker="Careers" title={<>{T("Grow with the")} <span className="grad-text">{T("Stag Squad.")}</span></>} sub="We hire full-time, part-time and freelance talent, and train the next generation through our internship and student programs." crumbs={[["Careers", "/careers"]]}>{apply && <div className="mt-9"><Btn href={c.val<string>("apply", "href")}>{c.text("apply", "label")} →</Btn></div>}</PageHero>
    <Blocks sections={c.order} filter={x => x.type === "legacy"} legacy={{ apply: null,
      cards: <section className={`${wrap} pb-24 grid md:grid-cols-3 gap-6`}>{c.items<{ title: string; text: string; icon: string }>("cards", "items").map((x, i) => <div key={i} className="reveal glass rounded-3xl p-8"><Icon name={x.icon || "briefcase"} color="#48BDED" className="w-7 h-7" /><h2 className="mt-4 font-display text-xl font-bold text-white">{x.title}</h2><p className="mt-2 text-slate-400">{x.text}</p></div>)}</section> }} />
    <CTA title="Ready to apply?" sub="Fill out the application — or message us on WhatsApp or Telegram." />
  </>);
}
