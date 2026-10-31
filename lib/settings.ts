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
  brand: { name: "Stag Prime", legal: "Stag Prime LLC", tagline: "Your Ultimate Growth Partner.", slogan: "Your Ultimate Growth Partner", logo: "/logo.svg", logoWide: "/logo-wide.svg", emblem: "/emblem.svg", favicon: "/favicon.ico", ogImage: "/og.jpg", twitter: "@stag_prime", titleSuffix: "Stag Prime" },
  theme: { navy950: "#061733", navy900: "#0B1631", navy800: "#0E2346", sky: "#48BDED", blue: "#1071B2", red: "#D33F49", green: "#1A936F", lime: "#20BF55", purple: "#9649CB", teal: "#3FB7D3", displayFont: "", displayFontUrl: "", bodyFont: "", bodyFontUrl: "", customCss: "" },
  contact: { ...CONTACT, telegramHandle: "@stagprime", phoneE164: "+13073964184",
    offices: [
      { label: "USA — Stag Prime LLC", street: "30 N Gould St #23907", city: "Sheridan", region: "WY", postal: "82801", country: "US", line: "30 N Gould St #23907, Sheridan, WY 82801" },
      { label: "Bangladesh Office", street: "268/C Kadirganj, Boalia", city: "Rajshahi", region: "", postal: "6000", country: "BD", line: "268/C Kadirganj, Boalia, Rajshahi-6000" },
    ] },
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
  stores: site.stores,
  extended: site.extended,
  founder: { name: "Md Tariq Hossain", role: "CEO / Founder, Stag Prime LLC", jobTitle: "CEO / Founder", linkedin: "", image: "" },
  nav,
  homeStats: [{"value": "5+", "label": "Years experience", "tilt": "-4deg"}, {"value": "150+", "label": "Projects done", "tilt": "3deg"}, {"value": "10,000+", "label": "Designs live", "tilt": "-2deg"}, {"value": "~4.8★", "label": "Stag VPN on Google Play", "tilt": "4deg"}, {"value": "6", "label": "Marketplace storefronts", "tilt": "-3deg"}, {"value": "100%", "label": "In-house tech", "tilt": "2deg"}],
  gigs,
  team,
  tracking: { ga4: "", gtm: "", metaPixel: "", googleAds: "", adsLabelPurchase: "", adsLabelLead: "", adsLabelSignup: "", tiktok: "", linkedin: "" }, // empty → fall back to env vars
  footer: {
    columns: [
      { title: "Services", source: "services", links: [] as { label: string; href: string }[] },
      { title: "Ventures", source: "ventures", links: [{ label: "Portfolio", href: "/portfolio" }, { label: "Store", href: "/store" }] },
      { title: "Company", source: "", links: [["About", "/about"], ["Team", "/team"], ["Partners", "/partners"], ["Careers", "/careers"], ["Reviews", "/reviews"], ["Blog", "/blog"], ["FAQ", "/faq"], ["Pricing", "/pricing"], ["Contact", "/contact"]].map(([label, href]) => ({ label, href })) },
    ],
    showSocials: true,
    legal: [["Privacy", "/privacy"], ["Terms", "/terms"], ["Editorial policy", "/editorial-policy"]].map(([label, href]) => ({ label, href })),
  },
  deposits: [
    ["digital-marketing", "Digital Marketing — project deposit", 100, "Refundable-against-invoice deposit to book a Digital Marketing project kickoff."],
    ["design-development", "Design & Development — project deposit", 250, "Deposit to reserve a development slot; credited to your final invoice."],
    ["amazon-youtube-automation", "Amazon & YouTube Automation — project deposit", 100, "Deposit to start KDP / Merch / YouTube work; credited to your final invoice."],
    ["ai-animation", "AI & Animation — project deposit", 100, "Deposit to book video or animation production; credited to your final invoice."],
    ["writing-consulting", "Writing & Consulting — project deposit", 50, "Deposit to start writing or a consulting engagement; credited to your final invoice."],
    ["saas", "Software (SaaS) — discovery deposit", 250, "Deposit for a SaaS discovery & scoping sprint; credited to your final invoice."],
  ].map(([svc, name, usd, desc]) => ({ svc: svc as string, name: name as string, usd: usd as number, desc: desc as string })),
  donationTiers: [10, 25, 50, 100, 250],
  sentinelPlans: [
    { key: "starter", name: "Starter", usdMonth: 0, note: "Plans configured per team on request", features: ["Up to 10 servers", "Admin + staff roles", "Email alerts"], highlighted: false },
    { key: "agency", name: "Agency", usdMonth: 0, note: "Multi-client workspaces", features: ["Unlimited client workspaces", "Client view-only accounts", "Priority support"], highlighted: true },
  ],
  orgSchema: {
    alternateName: "Stag Prime Digital Agency", types: ["Organization", "ProfessionalService"],
    sameAs: ["https://www.facebook.com/stagprime","https://www.instagram.com/stagprimes/","https://x.com/stag_prime","https://www.linkedin.com/company/StagPrime","https://youtube.com/@stagprime","https://www.pinterest.com/Stagprime/","https://medium.com/@stagprime","https://www.quora.com/profile/Stag-Prime","https://linktr.ee/stagprime","https://www.tumblr.com/stagprime","https://clutch.co/profile/stag-prime-digital-agency","https://www.crunchbase.com/organization/stag-prime-digital-agency","https://www.trustpilot.com/review/stagprime.com","https://www.yelp.com/biz/stag-prime-digital-agency-sheridan"],
    extra: "",
  },
  llms: { intro: "Stag Prime (Stag Prime LLC, Wyoming, USA; operations office in Rajshahi, Bangladesh) is a full-service digital agency and product company: digital marketing (SEO, ASO, paid ads), web & app development, Amazon KDP & YouTube automation, AI video & animation, writing & consulting, and SaaS. It also builds and sells its own products, including Stag Prime Sentinel (infrastructure monitoring) and a print-on-demand merch network.", extra: "" },
  robots: { blockAiCrawlers: false, extraDisallow: [] as string[], extraRules: "" },
  sitemap: { exclude: [] as string[], includeImages: true },
  consent: { enabled: true, version: 1, defaultAnalytics: false, defaultAds: false },
  chat: { enabled: true, aiEnabled: true, aiModel: "", systemPrompt: "", greeting: "", hours: "Sun–Thu 10:00–19:00 (Asia/Dhaka)", showWhatsapp: true, showTelegram: true, showCall: true, canned: ["Thanks for reaching out! A team member will reply shortly.", "Could you share your email so we can send the details?", "You can see all packages and prices at /pricing."] as string[] },
  orders: { autoCompleteDays: 3, notifyEmail: "" },
  stripePrices: {} as Record<string, { product: string; price: string; amount: number; syncedAt: string }>,
  seoDefaults: { titleTemplate: "%s | Stag Prime", defaultDescription: "", indexNow: true },
};
export type Settings = typeof DEFAULTS;
export type SettingKey = keyof Settings;
export const SETTING_KEYS = Object.keys(DEFAULTS) as SettingKey[];

// In-process write version: bumped on every settings write so the next read misses the data cache and reads the DB
// (revalidateTag alone is stale-while-revalidate, which could serve or even re-store a pre-write value after rapid edits).
const V = globalThis as unknown as { __spSettingsV?: number }; V.__spSettingsV ??= Date.now(); // per boot, so a restart never reuses an old persisted entry
const load = () => loadV(String(V.__spSettingsV));
const loadV = (v: string) => unstable_cache(async (): Promise<Partial<Record<string, unknown>>> => {
  if (!process.env.DATABASE_URL) return {};
  try {
    const { db } = await import("@/lib/db");
    const rows = await db.setting.findMany();
    const out: Record<string, unknown> = {};
    for (const r of rows) { try { out[r.key] = JSON.parse(r.value); } catch { /* ignore bad JSON */ } }
    return out;
  } catch { return {}; } // DB unreachable at build time → defaults
}, ["site-settings", v], { tags: ["settings"], revalidate: 300 })();

/** Object overrides merge shallowly over the default; arrays/scalars replace it. */
function merge<T>(def: T, v: unknown): T {
  if (v === undefined || v === null) return def;
  if (def && typeof def === "object" && !Array.isArray(def) && typeof v === "object" && !Array.isArray(v)) return { ...def, ...(v as object) } as T;
  return v as T;
}
/**
 * A stored `products` row replaces the whole array, so a new default `img` would never reach production.
 * Keep the CMS product, and fill `img` from the code default for that slug when the stored entry has none.
 * An explicit CMS `img` still wins. Re-copy every setting with `SEED_FORCE=settings` only when a full overwrite is intended.
 */
const LEGACY_STORE_NAMES = new Set(["Stag Prime Store Panel", "Stag Prime Store"]);
const LEGACY_STORE_DESC = "Multi-tenant store admin for your own shop: your own products, your own delivery — no dropshipping.";
/** Fill a blank image from code, and replace the retired Store Panel name so a stored CMS row still shows OwnStore by Stag Prime. */
function fillProductImages(products: Settings["products"]): Settings["products"] {
  const bySlug = new Map(DEFAULTS.products.map(p => [p.slug, p]));
  return products.map(p => {
    const base = bySlug.get(p.slug);
    if (!base) return p;
    const img = typeof p.img === "string" && p.img.trim() ? p.img : base.img;
    if (p.slug !== "store-panel") return img && img !== p.img ? { ...p, img } : p;
    const n = !p.n || LEGACY_STORE_NAMES.has(p.n) ? base.n : p.n;
    const d = !p.d || p.d === LEGACY_STORE_DESC ? base.d : p.d;
    return { ...p, n, d, ...(img ? { img } : {}) };
  });
}
/** The old default favicon was the full wordmark SVG, which browser tabs do not show. Treat that legacy value as the shield icon. */
function normalizeBrand(brand: Settings["brand"]): Settings["brand"] {
  if (brand.favicon && brand.favicon !== "/logo.svg") return brand;
  return { ...brand, favicon: "/favicon.ico" };
}
function applyRuntimeDefaults<K extends SettingKey>(key: K, value: Settings[K]): Settings[K] {
  if (key === "products") return fillProductImages(value as Settings["products"]) as Settings[K];
  if (key === "brand") return normalizeBrand(value as Settings["brand"]) as Settings[K];
  return value;
}
export async function getSetting<K extends SettingKey>(key: K): Promise<Settings[K]> { return applyRuntimeDefaults(key, merge(DEFAULTS[key], (await load())[key])); }
export async function getSettings(): Promise<Settings> {
  const o = await load(); const s = {} as Settings;
  for (const k of SETTING_KEYS) (s as Record<string, unknown>)[k] = applyRuntimeDefaults(k, merge(DEFAULTS[k], o[k]));
  return s;
}
export function invalidateSettings(key?: string) { V.__spSettingsV = (V.__spSettingsV || 0) + 1; revalidateTag("settings"); if (key) revalidateTag(`content:${key}`); }
