import { sitemapXml } from "@/lib/sitemap";
export const revalidate = 3600;
export async function GET() { return new Response(await sitemapXml("images"), { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } }); }
