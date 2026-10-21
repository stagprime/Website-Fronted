import type { Metadata } from "next";
import { locales, SITE, ogLocale } from "./i18n";
import { getLoc, T } from "./loc";
export function pageMeta(path: string, title: string, description: string, image = "/og.jpg"): Metadata {
  const p = path === "/" ? "" : path; const l = getLoc(); const t = T(title), d = T(description);
  return {
    title: t, description: d,
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
