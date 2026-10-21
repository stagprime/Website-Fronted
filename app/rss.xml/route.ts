import { SITE } from "@/lib/i18n";
import { posts } from "@/content/posts";
export const dynamic = "force-static";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export function GET() {
  const items = posts.map(p => `<item><title>${esc(p.t)}</title><link>${SITE}/en/blog/${p.slug}</link><guid>${SITE}/en/blog/${p.slug}</guid><pubDate>${new Date(p.date!).toUTCString()}</pubDate><category>${esc(p.cat)}</category><description>${esc(p.d)}</description></item>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Stag Prime Blog</title><link>${SITE}/en/blog</link><atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/><description>Guides on SEO, app development, Amazon KDP, YouTube, POD, AI video, SaaS and VPN server monitoring.</description><language>en</language>${items}</channel></rss>`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
