import { useParamsLoc, T } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, wrap, CTA } from "@/components/ui";
import { CONTACT } from "@/lib/i18n";
const S: [string, string][] = [
  ["Who writes our content", "Articles are written and reviewed by the Stag Prime team under the direction of founder Md Tariq Hossain. Authors write about work we do every day: SEO, app and web development, Amazon KDP, YouTube, print-on-demand, AI video, writing and SaaS."],
  ["Experience first", "We publish what we have practised ourselves — from building and selling our own VPN app to running six print-on-demand storefronts and our own monitoring platform. When we describe a process, it is the process we use."],
  ["Accuracy and sources", "Facts about platforms (Google, Amazon, YouTube, Stripe and others) are checked against official documentation at the time of writing. Prices quoted are our own published starting prices. We do not invent statistics, clients or reviews."],
  ["Updates", "Each article shows its publication or last-updated date. We review important guides when platform rules change and correct errors promptly."],
  ["Independence and disclosure", "We recommend tools and approaches on merit. Where an article mentions a Stag Prime service or product, it is clearly linked as ours."],
  ["AI assistance", "Our writers may use AI tools for research or drafting support. Every published piece is edited, fact-checked and approved by a person."],
  ["Corrections", "Spotted something wrong? Email us and we will review it within a few business days."],
];
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); return await seoMeta("/editorial-policy", "Editorial Policy", "How Stag Prime writes, fact-checks and updates its guides and articles."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params);
  return (<>
    <JsonLd data={breadcrumb([["Editorial Policy", "/editorial-policy"]])} />
    <PageHero kicker="Editorial Policy" title="How we write and check our content." sub="Our guides are written by practitioners and held to clear standards." crumbs={[["Editorial Policy", "/editorial-policy"]]} />
    <section className={`${wrap} pb-24 max-w-3xl prose-sp`}>{S.map(([h, d]) => <div key={h}><h2>{T(h)}</h2><p>{T(d)}</p></div>)}
      <p className="mt-8"><a className="text-sky-brand" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p></section>
    <CTA />
  </>);
}
