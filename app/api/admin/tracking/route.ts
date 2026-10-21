import { route, ok } from "@/lib/api";
import { getSettings } from "@/lib/settings";
import { trackingConfig } from "@/lib/tracking";
export const runtime = "nodejs";
const FMT: Record<string, [RegExp, string]> = { ga4: [/^G-[A-Z0-9]{6,12}$/, "G-XXXXXXXXXX"], gtm: [/^GTM-[A-Z0-9]{5,9}$/, "GTM-XXXXXXX"], pixel: [/^\d{15,16}$/, "15–16 digits"], ads: [/^AW-\d{8,12}$/, "AW-1234567890"], tiktok: [/^[A-Z0-9]{18,22}$/, "20 characters"], linkedin: [/^\d{5,9}$/, "digits"] };
const MARK: Record<string, (v: string) => string> = { ga4: v => v, gtm: v => v, pixel: v => v, ads: v => v, tiktok: v => v, linkedin: v => v };
/** Tracking health: format check of every effective ID, whether it renders in the live HTML, consent mode and server-side token presence (names only). */
export const GET = route("settings.edit", async () => {
  const s = await getSettings(); const cfg = trackingConfig(s.tracking);
  let html = ""; try { const r = await fetch(`${process.env.INTERNAL_URL || `http://127.0.0.1:${process.env.PORT || 3000}`}/en`, { cache: "no-store", signal: AbortSignal.timeout(15000) }); html = await r.text(); } catch { /* server not reachable from itself */ }
  const checks = Object.entries(FMT).map(([k, [re, hint]]) => { const v = (cfg as Record<string, unknown>)[k] as string | undefined; const src = v ? ((s.tracking as Record<string, string>)[{ ga4: "ga4", gtm: "gtm", pixel: "metaPixel", ads: "googleAds", tiktok: "tiktok", linkedin: "linkedin" }[k]!] ? "admin" : "env") : null;
    return { id: k, value: v || null, source: src, validFormat: v ? re.test(v) : null, hint, inHtml: v && html ? html.includes(MARK[k](v)) : null }; });
  return ok({ checks, consent: { enabled: s.consent.enabled !== false }, server: { META_CAPI_TOKEN: !!process.env.META_CAPI_TOKEN, STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET }, htmlFetched: !!html, adsLabels: cfg.adsLabels });
});
