import crypto from "crypto";
// Meta Conversions API (server-side). Disabled unless META_PIXEL_ID and META_CAPI_TOKEN are set.
const h = (v?: string) => (v ? crypto.createHash("sha256").update(v.trim().toLowerCase()).digest("hex") : undefined);
export async function capi(event: string, eventId: string, opts: { url?: string; ip?: string; ua?: string; email?: string; value?: number; currency?: string; custom?: Record<string, unknown> } = {}) {
  const { pixelId } = await import("./tracking"); const id = await pixelId().catch(() => process.env.META_PIXEL_ID), token = process.env.META_CAPI_TOKEN; if (!id || !token) return { skipped: true };
  const body = { data: [{ event_name: event, event_time: Math.floor(Date.now() / 1000), event_id: eventId, action_source: "website", event_source_url: opts.url,
    user_data: { client_ip_address: opts.ip, client_user_agent: opts.ua, em: opts.email ? [h(opts.email)] : undefined },
    custom_data: { value: opts.value, currency: opts.currency, ...opts.custom } }], ...(process.env.META_TEST_EVENT_CODE && { test_event_code: process.env.META_TEST_EVENT_CODE }) };
  try { const r = await fetch(`https://graph.facebook.com/v20.0/${id}/events?access_token=${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return { ok: r.ok }; }
  catch { return { ok: false }; }
}
