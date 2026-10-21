import { S } from "@/lib/site";
import { useParamsLoc, L, T, TT } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, H2, wrap, Btn, CTA, TrustStrip } from "@/components/ui";
import { ai } from "@/lib/art";
import Icon from "@/components/Icon";
import { formT } from "@/lib/formt";
import { ApplyForm } from "@/components/Forms";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); const { jobAreas } = S();  return await seoMeta("/job-apply", "Job Application", "Apply to work with Stag Prime in digital marketing, SEO, development, design, Amazon KDP & Merch, YouTube, AI video, animation, writing and consulting."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); const { jobAreas } = S(); 
  return (<>
    <JsonLd data={breadcrumb([["Careers", "/careers"], ["Job Apply", "/job-apply"]])} />
    <PageHero kicker="Job Apply" title="Stag Prime Job Application" sub="Tell us about yourself and the services you'd like to work on. We review every application." img={ai("page-careers")} crumbs={[["Careers", "/careers"], ["Job Apply", "/job-apply"]]} />
    <section className={`${wrap} pb-24 max-w-4xl`}><ApplyForm areas={jobAreas} t={formT()} /></section>
  </>);
}
