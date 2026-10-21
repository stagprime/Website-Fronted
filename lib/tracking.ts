import type { Settings } from "@/lib/settings";
/** Effective tracking IDs: Admin → Tracking (DB) first, env vars as fallback. Only public IDs — tokens (CAPI) stay in env. */
export function trackingConfig(t: Settings["tracking"]) {
  const e = process.env; const pick = (a: string, b?: string) => (a || "").trim() || (b || "").trim() || undefined;
  const labels = { purchase: pick(t.adsLabelPurchase, e.NEXT_PUBLIC_GOOGLE_ADS_LABEL_PURCHASE), lead: pick(t.adsLabelLead, e.NEXT_PUBLIC_GOOGLE_ADS_LABEL_LEAD), signup: pick(t.adsLabelSignup, e.NEXT_PUBLIC_GOOGLE_ADS_LABEL_SIGNUP) };
  return {
    gtm: pick(t.gtm, e.NEXT_PUBLIC_GTM_ID), ga4: pick(t.ga4, e.NEXT_PUBLIC_GA4_ID), pixel: pick(t.metaPixel, e.META_PIXEL_ID || e.NEXT_PUBLIC_META_PIXEL_ID),
    ads: pick(t.googleAds, e.NEXT_PUBLIC_GOOGLE_ADS_ID), adsLabels: Object.fromEntries(Object.entries(labels).filter(([, v]) => v)) as Record<string, string>,
    tiktok: pick(t.tiktok, e.NEXT_PUBLIC_TIKTOK_PIXEL_ID), linkedin: pick(t.linkedin, e.NEXT_PUBLIC_LINKEDIN_PARTNER_ID),
  };
}
/** Same values for server code (CAPI uses the Meta Pixel id). */
export async function pixelId() { const { getSetting } = await import("@/lib/settings"); return trackingConfig(await getSetting("tracking")).pixel; }
