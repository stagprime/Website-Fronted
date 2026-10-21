import { getSettings } from "./settings";
import { posts } from "@/content/posts";
// Every indexable route (without locale prefix). Used by sitemaps, the crawler test and the SEO admin.
export const pageRoutes = ["", "/services", "/ventures", "/portfolio", "/portfolio/stag-vpn", "/case-studies", "/store", "/stag-sentinel", "/pricing", "/about", "/team", "/partners", "/careers", "/job-apply", "/reviews", "/investors", "/faq", "/contact", "/editorial-policy", "/privacy", "/terms"];
export async function routeGroups() {
  const s = await getSettings(); let custom: string[] = []; let dbPosts: string[] = [];
  try { const { db, dbReady } = await import("./db"); if (dbReady()) {
    custom = (await db.page.findMany({ where: { kind: "custom", status: "published" }, select: { key: true } })).map(p => p.key);
    dbPosts = (await db.blogPost.findMany({ where: { status: "published", locale: "en" }, select: { slug: true } })).map(p => `/blog/${p.slug}`);
  } } catch { /* DB unavailable → code routes only */ }
  return {
    pageRoutes: [...pageRoutes, ...custom], serviceRoutes: s.services.map(x => `/services/${x.slug}`), ventureRoutes: s.ventures.map(v => `/ventures/${v.slug}`),
    storeRoutes: s.storeCats.map(c => `/store/${c.slug}`), blogRoutes: [...new Set(["/blog", ...posts.map(p => `/blog/${p.slug}`), ...dbPosts])], exclude: s.sitemap.exclude, images: s.sitemap.includeImages,
  };
}
export async function allRoutes() { const g = await routeGroups(); return [...g.pageRoutes, ...g.serviceRoutes, ...g.ventureRoutes, ...g.storeRoutes, ...g.blogRoutes]; }
