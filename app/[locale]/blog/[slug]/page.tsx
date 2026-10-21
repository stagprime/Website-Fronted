import { useParamsLoc, L, T, getLoc } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, wrap, Btn, CTA } from "@/components/ui";
import { ai } from "@/lib/art";
import { notFound } from "next/navigation";
import { posts, postImg, words } from "@/content/posts";
import { services } from "@/content/site";
import { SITE } from "@/lib/i18n";
import Md, { toc, slugify } from "@/components/Md";
import { getPost } from "@/lib/blog";
import { postLocales } from "@/lib/posti18n";
import { founder } from "@/lib/people";
import { ViewContent } from "@/components/Track";
export const revalidate = 300;
export function generateStaticParams() { return posts.map(p => ({ slug: p.slug })); }
type P = { params: Promise<{ slug: string; locale: string }> };
export async function generateMetadata({ params }: P) { await useParamsLoc(params); const { slug } = await params; const p = await getPost(slug, getLoc()); if (!p) return {}; const m = await seoMeta(`/blog/${p.slug}`, p.t, p.d, `/img/ai/${postImg(p.cat)}.webp`); const l = getLoc(), langs = postLocales(p.slug);
  // Untranslated locale → canonical points to the English original; hreflang lists only real translations.
  return { ...m, alternates: { canonical: p.translated ? `/${l}/blog/${p.slug}` : `/en/blog/${p.slug}`, languages: { ...Object.fromEntries(langs.map(x => [x, `/${x}/blog/${p.slug}`])), "x-default": `/en/blog/${p.slug}` } }, openGraph: { ...m.openGraph, type: "article", publishedTime: p.date } }; }
export default async function Page({ params }: P) { await useParamsLoc(params);
  const { slug } = await params; const p = await getPost(slug, getLoc()); if (!p) notFound();
  const l = getLoc(); const svc = services.find(s => s.slug === p.svc); const related = posts.filter(x => x.slug !== p.slug && x.svc === p.svc).slice(0, 2);
  const ld = { "@context": "https://schema.org", "@type": "BlogPosting", headline: T(p.t), description: T(p.d), image: `${SITE}/img/ai/${postImg(p.cat)}.webp`, datePublished: p.date, dateModified: p.date, wordCount: words(p.body), inLanguage: p.translated ? l : "en", keywords: p.kw,
    author: { "@type": "Person", "@id": `${SITE}/#founder`, name: founder.name, jobTitle: "CEO / Founder", url: `${SITE}/${l}/about` }, publisher: { "@id": `${SITE}/#org` }, mainEntityOfPage: `${SITE}/${l}/blog/${p.slug}` };
  return (<>
    <JsonLd data={breadcrumb([["Blog", "/blog"], [p.t, `/blog/${p.slug}`]])} /><JsonLd data={ld} />
    {p.faq && <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: p.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }} />}
    <ViewContent name={p.t} type="article" />
    <PageHero img={ai(postImg(p.cat))} kicker={p.cat} title={p.t} sub={p.d} crumbs={[["Blog", "/blog"], [p.t, `/blog/${p.slug}`]]}>
      <p className="mt-6 text-sm text-slate-400"><time dateTime={p.date}>{p.date}</time> · {Math.max(3, Math.round(words(p.body) / 230))} {T("min read")} · Stag Prime</p>
    </PageHero>
    <div className={`${wrap} pb-20 grid lg:grid-cols-[1fr_17rem] gap-12`}>
      <article lang="en" dir="ltr" className="prose-sp max-w-3xl">
        {!p.translated && <p className="rounded-2xl border border-sky-brand/30 bg-sky-brand/5 p-4 text-sm not-prose" lang={l} dir={l === "ar" ? "rtl" : "ltr"}>{T("This guide is published in English. Our team can answer your questions in your language — contact us any time.")}</p>}
        <Md src={p.body} />
        {p.faq && <section aria-labelledby="faq"><h2 id="faq">Frequently asked questions</h2>{p.faq.map(([q, a]) => <details key={q} className="mt-3 rounded-2xl border border-white/10 p-5"><summary className="cursor-pointer font-semibold text-white">{q}</summary><p className="mt-3">{a}</p></details>)}</section>}
      </article>
      <aside className="lg:sticky lg:top-28 self-start space-y-6">
        <nav aria-label={T("On this page")} className="glass rounded-3xl p-6"><p className="font-display text-sm font-bold text-white">{T("On this page")}</p><ol className="mt-3 space-y-2 text-sm text-slate-300" lang="en">{toc(p.body).map(h => <li key={h}><a href={`#${slugify(h)}`} className="hover:text-white">{h}</a></li>)}</ol></nav>
        {svc && <div className="rounded-3xl bg-gradient-to-br from-blue-brand to-navy-800 p-6"><p className="text-xs uppercase tracking-widest text-sky-brand">{T("Related service")}</p><p className="mt-2 font-display font-bold text-white">{T(svc.title)}</p><p className="mt-2 text-sm text-slate-200">{T(svc.short)}</p><div className="mt-4"><Btn href={`/services/${svc.slug}`}>{T("Explore")} →</Btn></div></div>}
      </aside>
    </div>
    {related.length > 0 && <section className={`${wrap} pb-16`}><p className="font-display text-[11px] tracking-[.3em] uppercase mb-4 text-sky-brand">{T("Keep reading")}</p><div className="grid md:grid-cols-2 gap-5">{related.map(r => <a key={r.slug} href={L(`/blog/${r.slug}`)} className="glass glow-card rounded-3xl p-6"><h2 className="font-display font-bold text-white">{T(r.t)}</h2><p className="mt-2 text-sm text-slate-300">{T(r.d)}</p></a>)}</div></section>}
    <CTA />
  </>);
}
