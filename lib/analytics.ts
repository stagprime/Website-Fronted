"use client";
// Central analytics: one call fans out to GTM dataLayer, GA4, Meta Pixel (+ server CAPI with shared event_id), Google Ads, TikTok, LinkedIn.
// Every vendor is optional (env-gated) and nothing fires before consent.
type Params = Record<string, unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const w = () => (typeof window === "undefined" ? null : (window as any));
export const consented = () => { const c = w()?.document.cookie.match(/sp_consent=([^;]+)/)?.[1]; return c ? decodeURIComponent(c) : ""; };
export const hasMarketing = () => consented().includes("ads");
export const hasAnalytics = () => consented().includes("analytics");
const GA4 = { PageView: "page_view", ViewContent: "view_item", AddToCart: "add_to_cart", InitiateCheckout: "begin_checkout", Purchase: "purchase", Lead: "generate_lead", CompleteRegistration: "sign_up", Contact: "contact" } as Record<string, string>;
const TT = { PageView: "Pageview", ViewContent: "ViewContent", AddToCart: "AddToCart", InitiateCheckout: "InitiateCheckout", Purchase: "CompletePayment", Lead: "SubmitForm", CompleteRegistration: "CompleteRegistration", Contact: "Contact" } as Record<string, string>;
export function track(event: string, params: Params = {}, eventId = crypto.randomUUID()) {
  const W = w(); if (!W) return eventId;
  W.dataLayer = W.dataLayer || []; W.dataLayer.push({ event: `sp_${event}`, event_id: eventId, ...params });
  if (hasAnalytics() && W.gtag) W.gtag("event", GA4[event] || event, { ...params, event_id: eventId });
  if (hasMarketing()) {
    if (W.fbq) W.fbq(["PageView", "ViewContent", "AddToCart", "InitiateCheckout", "Purchase", "Lead", "CompleteRegistration", "Contact"].includes(event) ? "track" : "trackCustom", event, params, { eventID: eventId });
    if (W.ttq && TT[event]) W.ttq.track(TT[event], params, { event_id: eventId });
    const ads = W.__spAds as Record<string, string> | undefined; if (W.gtag && ads?.[event]) W.gtag("event", "conversion", { send_to: ads[event], value: params.value, currency: params.currency, transaction_id: params.transaction_id || eventId });
    if (event !== "PageView") navigator.sendBeacon?.("/api/track", JSON.stringify({ event, eventId, params, url: location.href }));
  }
  return eventId;
}
