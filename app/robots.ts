import type { MetadataRoute } from "next";
import { SITE, locales } from "@/lib/i18n";
// AI crawlers are allowed by default; set AI_CRAWLERS=block to disallow them.
const AI = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "Google-Extended", "PerplexityBot", "ClaudeBot", "anthropic-ai", "Applebot-Extended", "CCBot"];
export default function robots(): MetadataRoute.Robots {
  const private_ = ["/api/", "/admin", ...locales.flatMap(l => [`/${l}/login`, `/${l}/account`, `/${l}/checkout/`])];
  const block = process.env.AI_CRAWLERS === "block";
  return { rules: [{ userAgent: "*", allow: "/", disallow: private_ }, { userAgent: AI, ...(block ? { disallow: "/" } : { allow: "/", disallow: private_ }) }], sitemap: `${SITE}/sitemap.xml`, host: SITE };
}
