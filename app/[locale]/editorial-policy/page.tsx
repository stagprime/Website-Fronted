import { LegalBody } from "@/components/LegalBody";
import { editorial } from "@/content/legal";
import { useParamsLoc, T } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, wrap, CTA } from "@/components/ui";
import { S } from "@/lib/site";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); const CONTACT = S().contact; return await seoMeta("/editorial-policy", "Editorial Policy", "How Stag Prime writes, fact-checks and updates its guides and articles."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); const CONTACT = S().contact;
  return (<>
    <JsonLd data={breadcrumb([["Editorial Policy", "/editorial-policy"]])} />
    <PageHero kicker="Editorial Policy" title="How we write and check our content." sub="Our guides are written by practitioners and held to clear standards." crumbs={[["Editorial Policy", "/editorial-policy"]]} />
    <section className={`${wrap} pb-24 max-w-3xl prose-sp`}><LegalBody pageKey="/editorial-policy" items={editorial} />
      <p className="mt-8"><a className="text-sky-brand" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p></section>
    <CTA />
  </>);
}
