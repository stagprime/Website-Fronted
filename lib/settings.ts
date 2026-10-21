/**
 * Single settings/content layer for admin-editable data.
 *
 * Defaults live in code (lib/i18n.ts CONTACT, content/site.ts). Any row in the Prisma `Setting` table
 * (key = one of SETTING_KEYS, value = JSON) overrides the default. Pages read through `getSetting()` /
 * `getSettings()`; after an admin PUT to /api/admin/settings the whole site is revalidated.
 * To make more content editable: add a key here with its default, then read it via getSetting() in the page.
 */
import { unstable_cache, revalidateTag } from "next/cache";
import { CONTACT } from "@/lib/i18n";
import * as site from "@/content/site";
import { nav } from "@/lib/nav";
import { gigs } from "@/content/gigs";
import { team } from "@/content/team";

export const DEFAULTS = {
  brand: { name: "Stag Prime", legal: "Stag Prime LLC", tagline: "Digital marketing, development & growth studio", logo: "/logo.svg" },
  contact: CONTACT,
  socials: site.socials,
  profiles: site.profiles,
  services: site.services,
  products: site.products,
  storeCats: site.storeCats,
  pricing: site.pricing,
  faqs: site.faqs,
  process: site.process,
  ventures: site.ventures,
  portfolio: site.portfolio,
  partners: site.partners,
  jobAreas: site.jobAreas,
  nav,
  gigs,
  team,
  tracking: { ga4: "", gtm: "", metaPixel: "", tiktok: "", clarity: "" }, // empty → fall back to env vars
};
export type Settings = typeof DEFAULTS;
export type SettingKey = keyof Settings;
export const SETTING_KEYS = Object.keys(DEFAULTS) as SettingKey[];

const load = unstable_cache(async (): Promise<Partial<Record<string, unknown>>> => {
  if (!process.env.DATABASE_URL) return {};
  try {
    const { db } = await import("@/lib/db");
    const rows = await db.setting.findMany();
    const out: Record<string, unknown> = {};
    for (const r of rows) { try { out[r.key] = JSON.parse(r.value); } catch { /* ignore bad JSON */ } }
    return out;
  } catch { return {}; } // DB unreachable at build time → defaults
}, ["site-settings"], { tags: ["settings"], revalidate: 300 });

/** Object overrides merge shallowly over the default; arrays/scalars replace it. */
function merge<T>(def: T, v: unknown): T {
  if (v === undefined || v === null) return def;
  if (def && typeof def === "object" && !Array.isArray(def) && typeof v === "object" && !Array.isArray(v)) return { ...def, ...(v as object) } as T;
  return v as T;
}
export async function getSetting<K extends SettingKey>(key: K): Promise<Settings[K]> { return merge(DEFAULTS[key], (await load())[key]); }
export async function getSettings(): Promise<Settings> {
  const o = await load(); const s = {} as Settings;
  for (const k of SETTING_KEYS) (s as Record<string, unknown>)[k] = merge(DEFAULTS[k], o[k]);
  return s;
}
export function invalidateSettings(key?: string) { revalidateTag("settings"); if (key) revalidateTag(`content:${key}`); }
