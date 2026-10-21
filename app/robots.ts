import type { MetadataRoute } from "next";
import { SITE, locales } from "@/lib/i18n";
import { getSetting } from "@/lib/settings";
export const revalidate = 3600;
// Admin → SEO → Robots: block AI crawlers, extra disallow paths, extra rules. AI_CRAWLERS=block (env) still forces blocking.
const AI = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "Google-Extended", "PerplexityBot", "ClaudeBot", "anthropic-ai", "Applebot-Extended", "CCBot"];
export default async function robots(): Promise<MetadataRoute.Robots> {
  const cfg = await getSetting("robots");
  const private_ = ["/api/", "/admin", "/media/private/", ...locales.flatMap(l => [`/${l}/login`, `/${l}/account`, `/${l}/checkout/`]), ...cfg.extraDisallow.filter(Boolean)];
  const block = process.env.AI_CRAWLERS === "block" || cfg.blockAiCrawlers;
  const extra = String(cfg.extraRules || "").split("\n").map(l => l.trim()).filter(Boolean).reduce<{ userAgent: string; disallow: string[]; allow: string[] }[]>((acc, line) => {
    const [k, ...v] = line.split(":"); const val = v.join(":").trim(); const key = k.trim().toLowerCase();
    if (key === "user-agent") acc.push({ userAgent: val, disallow: [], allow: [] }); else if (acc.length && key === "disallow") acc.at(-1)!.disallow.push(val); else if (acc.length && key === "allow") acc.at(-1)!.allow.push(val);
    return acc; }, []);
  return { rules: [{ userAgent: "*", allow: "/", disallow: private_ }, { userAgent: AI, ...(block ? { disallow: "/" } : { allow: "/", disallow: private_ }) }, ...extra], sitemap: `${SITE}/sitemap.xml`, host: SITE };
}
