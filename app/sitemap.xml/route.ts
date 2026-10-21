import { SITE } from "@/lib/i18n";
// Sitemap index → one sitemap per content type (each URL lists all 7 locale alternates).
export const dynamic = "force-static";
export function GET() {
  const types = ["pages", "services", "store", "blog", "images"];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${types.map(t => `<sitemap><loc>${SITE}/sitemap-${t}.xml</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></sitemap>`).join("")}</sitemapindex>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
}
