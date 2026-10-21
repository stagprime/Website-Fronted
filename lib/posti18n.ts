/** Translated blog posts live in content/posts/i18n/<locale>.json ({ slug: { t, d, body, faq, machine? } }). */
import fs from "fs"; import path from "path";
import { locales } from "./i18n";
type TP = { t: string; d: string; body: string; faq?: string[][]; machine?: boolean };
const cache: Record<string, Record<string, TP>> = {};
export function postTr(locale: string, slug: string): TP | undefined {
  if (locale === "en") return undefined;
  if (!cache[locale]) { try { cache[locale] = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/posts/i18n", `${locale}.json`), "utf8")); } catch { cache[locale] = {}; } }
  return cache[locale][slug];
}
/** Locales that have a full translation of this post (always includes en). Used for hreflang, canonical and sitemaps. */
export const postLocales = (slug: string) => locales.filter(l => l === "en" || !!postTr(l, slug));
