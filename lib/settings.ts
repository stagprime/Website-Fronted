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
  brand: { name: "Stag Prime", legal: "Stag Prime LLC", tagline: "Your Ultimate Growth Partner.", slogan: "Your Ultimate Growth Partner", logo: "/logo.svg", logoWide: "/logo-wide.svg", emblem: "/emblem.svg", favicon: "/logo.svg", ogImage: "/og.jpg", twitter: "@stag_prime", titleSuffix: "Stag Prime" },
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
  chat: { enabled: true, aiEnabled: true, aiModel: "", systemPrompt: "", greeting: "", hours: "Sun–Thu 10:00–19:00 (Asia/Dhaka)", showWhatsapp: true, showTelegram: true, showCall: true },
  orders: { autoCompleteDays: 3, notifyEmail: "" },
  stripePrices: {} as Record<string, { product: string; price: string; amount: number; syncedAt: string }>,
  seoDefaults: { titleTemplate: "%s | Stag Prime", defaultDescription: "", indexNow: true },
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
