import { loadLoc, L, T } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, wrap, CTA } from "@/components/ui";
import { ai } from "@/lib/art";
import Art from "@/components/Art";
import { postImg } from "@/content/posts";
import { allPosts } from "@/lib/blog";
import { getLoc } from "@/lib/loc";
export const revalidate = 300;
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); return await seoMeta("/blog", "Digital Marketing, SaaS & Amazon KDP Blog", "Practical guides on SEO, ASO, app development, Amazon KDP, YouTube automation, print-on-demand, AI video, privacy policies, SaaS MVPs and VPN server monitoring."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params);
  const posts = await allPosts(getLoc()); const [lead, ...rest] = posts;
  return (<>
    <JsonLd data={breadcrumb([["Blog", "/blog"]])} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "Blog", name: "Stag Prime Blog", url: `https://www.stagprime.com${L("/blog")}`, blogPost: posts.map(p => ({ "@type": "BlogPosting", headline: p.t, url: `https://www.stagprime.com${L(`/blog/${p.slug}`)}`, datePublished: p.date })) }} />
    <PageHero img={ai("page-blog")} kicker="Industry Insights" title="Guides from operators who do the work." sub="Practical, no-fluff guides from the team that runs its own SaaS, apps, print-on-demand stores and media channels." crumbs={[["Blog", "/blog"]]} />
    <section className={`${wrap} pb-24`}>
      <a href={L(`/blog/${lead.slug}`)} data-cursor={T("Read")} className="reveal group grid lg:grid-cols-2 gap-8 items-center glass rounded-[2rem] overflow-hidden">
        <Art src={ai(postImg(lead.cat))} alt={T(lead.t)} w={1152} h={864} className="h-full w-full aspect-[4/3] group-hover:scale-[1.03] transition duration-700" />
        <div className="p-8"><p className="text-xs uppercase tracking-widest text-sky-brand">{T("Cornerstone guide")} · {T(lead.cat)}</p><h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-white">{T(lead.t)}</h2><p className="mt-3 text-slate-300">{T(lead.d)}</p><span className="mt-6 inline-block font-semibold text-sky-brand">{T("Read the guide")} →</span></div>
      </a>
      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">{rest.map(p => (
        <a key={p.slug} href={L(`/blog/${p.slug}`)} data-cursor={T("Read")} className="reveal group glass glow-card rounded-3xl overflow-hidden flex flex-col">
          <Art src={ai(postImg(p.cat))} alt={T(p.t)} w={1152} h={864} sizes="(max-width:768px) 100vw, 33vw" className="aspect-[16/10] w-full group-hover:scale-105 transition duration-700" />
          <div className="p-6 flex-1 flex flex-col"><p className="text-xs uppercase tracking-widest text-sky-brand">{T(p.cat)}</p><h2 className="mt-3 font-display text-lg font-bold text-white">{T(p.t)}</h2><p className="mt-2 text-sm text-slate-300 flex-1">{T(p.d)}</p></div>
        </a>))}</div>
    </section>
    <CTA />
  </>);
}
