import { LegalBody } from "@/components/LegalBody";
import { privacy } from "@/content/legal";
import { useParamsLoc, L, T, TT } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, H2, wrap, Btn, CTA, TrustStrip } from "@/components/ui";
import { ai } from "@/lib/art";
import Icon from "@/components/Icon";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); return await seoMeta("/privacy", "Privacy Policy", "Privacy Policy for Stag Prime LLC and stagprime.com."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params);
  return (<>
    <JsonLd data={breadcrumb([["Privacy Policy", "/privacy"]])} />
    <PageHero img={ai("venture-stag-vpn")} kicker="Legal" title="Privacy Policy" sub="Last updated: 2026. Template — pending legal review before launch." crumbs={[["Privacy Policy", "/privacy"]]} />
    <article className={`${wrap} pb-24 max-w-3xl prose-sp`}><p className="rounded-2xl border border-area-red/40 bg-area-red/10 p-4 text-sm">{T("⚠ Draft template for legal review. Not final legal advice.")}</p>
      <LegalBody pageKey="/privacy" items={privacy} /></article>
  </>);
}
