import { notFound } from "next/navigation";
import { useParamsLoc, L, T } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, wrap, CTA, Btn } from "@/components/ui";
import { ai } from "@/lib/art";
import { storeCats, services } from "@/content/site";
import { CatNav, CatSection } from "@/components/Store";
const img: Record<string, string> = { marketing: "svc-digital-marketing", "design-dev": "svc-design-development", "amazon-youtube": "svc-amazon-youtube-automation", "ai-animation": "svc-ai-animation", "writing-consulting": "svc-writing-consulting", software: "svc-saas", merch: "venture-pod-merch", "ready-made-businesses": "store-digital" };
export function generateStaticParams() { return storeCats.map(c => ({ cat: c.slug })); }
type P = { params: Promise<{ locale: string; cat: string }> };
export async function generateMetadata({ params }: P) { await useParamsLoc(params); const { cat } = await params; const c = storeCats.find(x => x.slug === cat); return c ? await seoMeta(`/store/${c.slug}`, `${c.t} — Stag Prime Store`, c.d) : {}; }
export default async function Page({ params }: P) { await useParamsLoc(params);
  const { cat } = await params; const c = storeCats.find(x => x.slug === cat); if (!c) notFound(); const svc = services.find(s => s.slug === c.svc);
  return (<>
    <JsonLd data={breadcrumb([["Store", "/store"], [c.t, `/store/${c.slug}`]])} />
    <PageHero img={ai(img[c.slug])} color={c.color} kicker="Store category" title={c.t} sub={c.d} crumbs={[["Store", "/store"], [c.t, `/store/${c.slug}`]]}>
      {svc && <div className="mt-9 flex flex-wrap gap-4"><Btn href={`/services/${svc.slug}`}>{T("Related service")}: {T(svc.title)} →</Btn></div>}
    </PageHero>
    <section className={`${wrap} pb-24`}><CatNav active={c.slug} /><CatSection slug={c.slug} heading={false} />
      <p className="mt-10 text-sm text-slate-300"><a href={L("/store")} className="font-semibold text-sky-brand">← {T("All products")}</a></p></section>
    <CTA />
  </>);
}
