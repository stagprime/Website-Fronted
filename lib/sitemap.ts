import fs from "fs"; import path from "path";
import { SITE, locales } from "./i18n";
import { pageRoutes, serviceRoutes, ventureRoutes, storeRoutes, blogRoutes } from "./routes";
import { posts, postImg } from "@/content/posts";
import { services } from "@/content/site";
import { postLocales } from "./posti18n";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
function urls(paths: string[], prio = 0.7, imgs: Record<string, string[]> = {}, locs: (p: string) => readonly string[] = () => locales) {
  const day = new Date().toISOString().slice(0, 10);
  return paths.flatMap(p => locs(p).map(l => `<url><loc>${SITE}/${l}${p}</loc><lastmod>${day}</lastmod><changefreq>${p === "" ? "weekly" : "monthly"}</changefreq><priority>${p === "" ? "1.0" : prio}</priority>${locs(p).map(x => `<xhtml:link rel="alternate" hreflang="${x}" href="${SITE}/${x}${p}"/>`).join("")}<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/en${p}"/>${(imgs[p] || []).map(i => `<image:image><image:loc>${SITE}${esc(i)}</image:loc></image:image>`).join("")}</url>`)).join("");
}
export function sitemapXml(type: string) {
  let body = "";
  if (type === "pages") body = urls(pageRoutes, 0.8);
  if (type === "services") body = urls([...serviceRoutes, ...ventureRoutes], 0.9, Object.fromEntries(services.map(s => [`/services/${s.slug}`, [`/img/ai/svc-${s.slug}.webp`]])));
  if (type === "store") body = urls(storeRoutes, 0.7);
  if (type === "blog") body = urls(blogRoutes, 0.6, Object.fromEntries(posts.map(p => [`/blog/${p.slug}`, [`/img/ai/${postImg(p.cat)}.webp`]])), p => p.startsWith("/blog/") ? postLocales(p.slice(6)) : locales);
  if (type === "images") { const dir = path.join(process.cwd(), "public/img"); const files: string[] = []; for (const d of ["ai", "real"]) try { fs.readdirSync(path.join(dir, d)).forEach(f => files.push(`/img/${d}/${f}`)); } catch { /* none */ } body = `<url><loc>${SITE}/en</loc>${files.map(f => `<image:image><image:loc>${SITE}${f}</image:loc></image:image>`).join("")}</url>`; }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${body}</urlset>`;
}
