import type { Metadata } from "next";
import { useParamsLoc, L, T, getLoc } from "@/lib/loc";
import { PageHero, wrap } from "@/components/ui";
import { allPosts } from "@/lib/blog";
import { S } from "@/lib/site";
// Site search — target of the WebSite SearchAction (sitelinks search box). Results pages are noindex,follow.
export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };
export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> }) {
  await useParamsLoc(params); const q = ((await searchParams).q || "").trim().slice(0, 100); const n = q.toLowerCase();
  const hit = (...s: (string | undefined)[]) => !!n && s.some(x => x && (x.toLowerCase().includes(n) || T(x).toLowerCase().includes(n)));
  const { services, products } = S();
  const posts = n ? (await allPosts(getLoc())).filter(p => hit(p.t, p.d, p.cat)) : [];
  const res: [string, string, string][] = [
    ...services.filter(s => hit(s.title, s.short, s.intro)).map(s => [s.title, s.short, `/services/${s.slug}`] as [string, string, string]),
    ...products.filter(p => hit(p.n, p.d)).map(p => [p.n, p.d, "/store"] as [string, string, string]),
    ...posts.map(p => [p.t, p.d, `/blog/${p.slug}`] as [string, string, string]),
  ];
  return (<>
    <PageHero kicker="Search" title={q ? `${T("Results for")} “${q}”` : T("Search Stag Prime")} sub="Services, store products and guides." crumbs={[["Search", "/search"]]} />
    <section className={`${wrap} pb-24`}>
      <form action={L("/search")} role="search" className="flex gap-3"><label htmlFor="q" className="sr-only">{T("Search")}</label><input id="q" name="q" defaultValue={q} className="flex-1 rounded-xl bg-white/5 px-4 py-3 text-white" /><button className="rounded-xl bg-sky-brand px-5 font-semibold text-navy-950">{T("Search")}</button></form>
      {q && <p className="mt-6 text-slate-300">{res.length} {T("results")}</p>}
      <ul className="mt-6 space-y-4">{res.map(([t, d, h]) => <li key={h + t} className="glass rounded-2xl p-5"><h2 className="font-display text-lg font-bold text-white"><a href={L(h)}>{T(t)}</a></h2><p className="mt-1 text-sm text-slate-300">{T(d)}</p></li>)}</ul>
    </section>
  </>);
}
