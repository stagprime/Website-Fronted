import { allPosts } from "@/lib/blog";
import { L, T, getLoc } from "@/lib/loc";
import { wrap } from "@/components/ui";
/** Internal links service/product → blog: guides whose `svc` matches (or whose keyword/title matches `match`). */
export default async function RelatedGuides({ svc, match, title = "Guides from our team" }: { svc?: string; match?: RegExp; title?: string }) {
  const posts = (await allPosts(getLoc())).filter(p => (svc && p.svc === svc) || (match && (match.test(p.kw) || match.test(p.t)))).slice(0, 3);
  if (!posts.length) return null;
  return (
    <section className={`${wrap} py-16`} aria-labelledby="related-guides">
      <h2 id="related-guides" className="font-display text-2xl sm:text-3xl font-bold text-white">{T(title)}</h2>
      <ul className="mt-8 grid md:grid-cols-3 gap-6">{posts.map(p => (
        <li key={p.slug} className="glass rounded-3xl p-6"><p className="text-xs uppercase tracking-widest text-sky-brand">{T(p.cat)}</p>
          <h3 className="mt-3 font-display text-lg font-bold text-white"><a href={L(`/blog/${p.slug}`)} className="hover:text-sky-brand">{T(p.t)}</a></h3>
          <p className="mt-2 text-sm text-slate-300">{T(p.d)}</p></li>))}</ul>
      <p className="mt-6"><a href={L("/blog")} className="font-semibold text-sky-brand">{T("Browse all guides on the Stag Prime blog")} →</a></p>
    </section>);
}
