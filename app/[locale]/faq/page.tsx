import { S } from "@/lib/site";
import { useParamsLoc, L, T, TT } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, H2, wrap, Btn, CTA, TrustStrip } from "@/components/ui";
import { ai } from "@/lib/art";
import Icon from "@/components/Icon";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); const { faqs } = S();  return await seoMeta("/faq", "FAQ — Frequently Asked Questions", "Answers about Stag Prime's services, location, pricing, project process, contact options and internships."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); const { faqs } = S(); 
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  return (<>
    <JsonLd data={breadcrumb([["FAQ", "/faq"]])} /><JsonLd data={ld} />
    <PageHero img={ai("page-blog")} kicker="FAQ" title="Frequently asked questions" crumbs={[["FAQ", "/faq"]]} />
    <section className={`${wrap} pb-24 max-w-3xl space-y-3`}>{faqs.map(([q, a], i) => <details key={q} open={i === 0} className="reveal group glass rounded-2xl p-6"><summary className="cursor-pointer list-none flex justify-between gap-4 font-display font-bold text-white">{TT(q)}<span className="text-sky-brand group-open:rotate-45 transition">+</span></summary><p className="mt-4 text-slate-300 leading-relaxed">{TT(a)}</p></details>)}</section>
    <CTA title="Still have questions?" />
  </>);
}
