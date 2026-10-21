import { LegalBody } from "@/components/LegalBody";
import { terms } from "@/content/legal";
import { loadLoc, T } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, wrap } from "@/components/ui";
import { ai } from "@/lib/art";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); return await seoMeta("/terms", "Terms of Service", "Terms of Service for Stag Prime LLC and stagprime.com."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params);
  return (<>
    <JsonLd data={breadcrumb([["Terms of Service", "/terms"]])} />
    <PageHero img={ai("svc-writing-consulting")} kicker="Legal" title="Terms of Service" sub="Last updated: 2026. Template — pending legal review before launch." crumbs={[["Terms of Service", "/terms"]]} />
    <article className={`${wrap} pb-24 max-w-3xl prose-sp`}><p className="rounded-2xl border border-area-red/40 bg-area-red/10 p-4 text-sm">{T("⚠ Draft template for legal review. Not final legal advice.")}</p>
      <LegalBody pageKey="/terms" items={terms} /></article>
  </>);
}
