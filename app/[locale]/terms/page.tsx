import { useParamsLoc, L, T, TT } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, H2, wrap, Btn, CTA, TrustStrip } from "@/components/ui";
import { ai } from "@/lib/art";
import Icon from "@/components/Icon";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); return await seoMeta("/terms", "Terms of Service", "Terms of Service for Stag Prime LLC and stagprime.com."); }
const S: [string, string][] = [["Agreement","By using stagprime.com you agree to these terms. If you do not agree, please do not use the site."],["Services","Service scope, deliverables, timelines and fees are defined in each proposal or order. Starting prices on the website are indicative."],["Payments","Payments are processed securely by Stripe. Digital products are delivered electronically after payment."],["Intellectual property","Site content, brand assets and digital products are owned by Stag Prime LLC and licensed for the purchaser’s use only."],["Limitation of liability","To the extent permitted by law, Stag Prime LLC is not liable for indirect or consequential damages."],["Governing law","These terms are governed by the laws of the State of Wyoming, USA."]];
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params);
  return (<>
    <JsonLd data={breadcrumb([["Terms of Service", "/terms"]])} />
    <PageHero img={ai("svc-writing-consulting")} kicker="Legal" title="Terms of Service" sub="Last updated: 2026. Template — pending legal review before launch." crumbs={[["Terms of Service", "/terms"]]} />
    <article className={`${wrap} pb-24 max-w-3xl prose-sp`}><p className="rounded-2xl border border-area-red/40 bg-area-red/10 p-4 text-sm">{T("⚠ Draft template for legal review. Not final legal advice.")}</p>
      {S.map(([h, p]) => <section key={h}><h2>{TT(h)}</h2><p>{TT(p)}</p></section>)}</article>
  </>);
}
