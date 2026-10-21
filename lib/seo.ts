import type { Metadata } from "next";
import { locales, SITE, ogLocale } from "./i18n";
import { getLoc, T } from "./loc";
export function pageMeta(path: string, title: string, description: string, image = "/og.jpg"): Metadata {
  const p = path === "/" ? "" : path; const l = getLoc(); const t = T(title), d = fitDesc(T(description));
  return {
    title: fitTitle(t), description: d,
    alternates: { canonical: `/${l}${p}`, languages: { ...Object.fromEntries(locales.map(x => [x, `/${x}${p}`])), "x-default": `/en${p}` } },
    openGraph: { title: t, description: d, url: `/${l}${p}`, siteName: "Stag Prime", type: "website", locale: ogLocale[l], images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", site: "@stag_prime", title: t, description: d, images: [image] },
  };
}
export function breadcrumb(items: [string, string][]) {
  const l = getLoc();
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [["Home", "/"], ...items].map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name: T(name), item: `${SITE}/${l}${path === "/" ? "" : path}` })) };
}

/**
 * pageMeta + admin overrides from the SeoRecord table (edited at /admin/seo).
 * Pages are static; saving in /admin/seo calls revalidatePath() so the override goes live without a rebuild.
 */
export async function seoMeta(path: string, title: string, description: string, image?: string): Promise<Metadata> {
  const m = pageMeta(path, title, description, image);
  const { dbReady, db } = await import("./db"); if (!dbReady()) return m;
  try {
    const r = await db.seoRecord.findUnique({ where: { path_locale: { path, locale: getLoc() } } }); if (!r) return m;
    return { ...m, ...(r.title && { title: r.title }), ...(r.description && { description: r.description }), ...(r.focusKw && { keywords: [r.focusKw, ...(r.secondaryKws || "").split(",").map(s => s.trim()).filter(Boolean)] }),
      alternates: { ...m.alternates, ...(r.canonical && { canonical: r.canonical }) }, robots: { index: r.robotsIndex, follow: r.robotsFollow },
      openGraph: { ...m.openGraph, ...(r.ogTitle && { title: r.ogTitle }), ...(r.ogDesc && { description: r.ogDesc }), ...(r.ogImage && { images: [{ url: r.ogImage, width: 1200, height: 630 }] }) } };
  } catch { return m; }
}

/** SERP length rules: full title (incl. " | Stag Prime" template suffix) ≤ 60 chars, description 70–160 chars. */
const SUFFIX = " | Stag Prime".length;
const cutWords = (x: string, n: number) => { const c = x.slice(0, n + 1); const i = c.lastIndexOf(" "); return (i > n * 0.6 ? c.slice(0, i) : c.slice(0, n)).replace(/[\s,;:–—-]+$/, ""); };
export function fitTitle(t: string): string | { absolute: string } {
  if (t.length + SUFFIX <= 60) return t;
  if (t.length <= 60) return { absolute: t };
  const head = t.split(/\s*[:|–—(]\s*/)[0];
  if (head.length >= 20 && head.length <= 60) return { absolute: head };
  return { absolute: cutWords(t, 58) + "…" };
}
export function fitDesc(d: string): string {
  if (d.length > 160) { const c = d.slice(0, 160); const i = Math.max(c.lastIndexOf(". "), c.lastIndexOf("। "), c.lastIndexOf("。")); return i >= 90 ? c.slice(0, i + 1) : cutWords(d, 155) + "…"; }
  if (d.length < 70) { const x = `${d.replace(/[.\s]*$/, ".")} ${T("Stag Prime — Your Ultimate Growth Partner.")}`; return x.length <= 160 ? x : d; }
  return d;
}
