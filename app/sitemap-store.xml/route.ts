import { sitemapXml } from "@/lib/sitemap";
export const dynamic = "force-static";
export function GET() { return new Response(sitemapXml("store"), { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } }); }
