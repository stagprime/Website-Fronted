import { services, ventures, storeCats } from "@/content/site";
import { posts } from "@/content/posts";
// Every indexable route (without locale prefix). Used by sitemaps, the crawler test and the SEO admin.
export const pageRoutes = ["", "/services", "/ventures", "/portfolio", "/portfolio/stag-vpn", "/case-studies", "/store", "/stag-sentinel", "/pricing", "/about", "/team", "/partners", "/careers", "/job-apply", "/reviews", "/investors", "/faq", "/contact", "/editorial-policy", "/privacy", "/terms"];
export const serviceRoutes = services.map(s => `/services/${s.slug}`);
export const ventureRoutes = ventures.map(v => `/ventures/${v.slug}`);
export const storeRoutes = storeCats.map(c => `/store/${c.slug}`);
export const blogRoutes = ["/blog", ...posts.map(p => `/blog/${p.slug}`)];
export const allRoutes = [...pageRoutes, ...serviceRoutes, ...ventureRoutes, ...storeRoutes, ...blogRoutes];
