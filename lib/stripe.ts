/** Minimal Stripe REST client (no SDK). All calls are server-side with STRIPE_SECRET_KEY; returns null when Stripe is not configured. */
export const stripeOn = () => !!process.env.STRIPE_SECRET_KEY;
function form(o: Record<string, unknown>, pre = "", out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(o)) { if (v === undefined || v === null) continue; const key = pre ? `${pre}[${k}]` : k;
    if (typeof v === "object") form(v as Record<string, unknown>, key, out); else out.append(key, String(v)); }
  return out;
}
export async function stripe<T = Record<string, unknown>>(path: string, params?: Record<string, unknown>, method?: "GET" | "POST" | "DELETE", idem?: string): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY; if (!key) throw new Error("Stripe is not configured (STRIPE_SECRET_KEY).");
  const m = method || (params ? "POST" : "GET"); const qs = m === "GET" && params ? `?${form(params)}` : "";
  const r = await fetch(`https://api.stripe.com/v1/${path}${qs}`, { method: m, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded", ...(idem && { "Idempotency-Key": idem }) }, body: m !== "GET" && params ? form(params) : undefined, cache: "no-store", signal: AbortSignal.timeout(30000) });
  const j = await r.json(); if (!r.ok) throw new Error(j?.error?.message || `Stripe HTTP ${r.status}`); return j as T;
}
