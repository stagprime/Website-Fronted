import { NextResponse } from "next/server";
import { catalog, donationTiers } from "@/lib/catalog";
import { locales } from "@/lib/i18n";
import { auth } from "@/auth";
import { sameOrigin } from "@/lib/guard";
// Creates a Stripe Checkout Session via the REST API (no SDK needed). Key comes only from env.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false, error: "Invalid origin" }, { status: 403 });
  let body: { id?: string; amount?: number; locale?: string } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 }); }
  const locale = (locales as readonly string[]).includes(body.locale || "") ? body.locale! : "en";
  const id = String(body.id || "");
  let item = catalog[id];
  if (id === "donation") {
    const a = Math.round(Number(body.amount));
    if (!donationTiers.includes(a) && !(a >= 5 && a <= 10000)) return NextResponse.json({ ok: false, error: "Choose a donation between $5 and $10,000." }, { status: 422 });
    item = { name: "Donation — Stag Prime internship & training program", amount: a * 100, desc: "Supports internships and digital-skills training. Stag Prime LLC is a for-profit company; donations are not tax-deductible." };
  }
  // Subscriptions (e.g. Stag Prime Sentinel) use Stripe Price IDs from env: STRIPE_PRICE_<SLUG> (uppercase, dashes → underscores).
  let priceId: string | undefined;
  if (id.startsWith("sub:")) { priceId = process.env[`STRIPE_PRICE_${id.slice(4).toUpperCase().replace(/-/g, "_")}`]; if (!priceId) return NextResponse.json({ ok: false, fallback: `/${locale}/contact?topic=${encodeURIComponent(id.slice(4).replace(/-/g, " "))}`, error: "Plans are set up with each team — we'll contact you to activate access." }, { status: 503 }); item = { name: id, amount: 0, desc: "" }; }
  if (!item) return NextResponse.json({ ok: false, error: "Unknown item" }, { status: 404 });
  const key = process.env.STRIPE_SECRET_KEY;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  if (!key) return NextResponse.json({ ok: false, fallback: `/${locale}/contact?topic=${encodeURIComponent(item.name)}`, error: "Online checkout is temporarily unavailable — we'll take your order by message instead." }, { status: 503 });
  const f = new URLSearchParams({
    mode: "payment", "line_items[0][quantity]": "1", "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(item.amount), "line_items[0][price_data][product_data][name]": item.name,
    "line_items[0][price_data][product_data][description]": item.desc, "metadata[item]": id, locale: ["en", "es", "fr", "de"].includes(locale) ? locale : "auto",
    success_url: `${origin}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${origin}/${locale}/checkout/cancel`,
    billing_address_collection: "auto", "automatic_tax[enabled]": "false", allow_promotion_codes: "true",
  });
  if (priceId) { for (const k of [...f.keys()]) if (k.startsWith("line_items[0][price_data]")) f.delete(k); f.set("mode", "subscription"); f.set("line_items[0][price]", priceId); f.delete("billing_address_collection"); }
  const sess = await auth().catch(() => null); if (sess?.user?.email) f.set("customer_email", sess.user.email);
  if (id === "donation") f.set("submit_type", "donate"); else if (id.startsWith("product:")) f.set("submit_type", "pay");
  try {
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" }, body: f });
    const j = await r.json();
    if (!r.ok || !j.url) { console.error("[stripe]", j?.error?.message); return NextResponse.json({ ok: false, fallback: `/${locale}/contact`, error: "Payment could not be started. Please try again or contact us." }, { status: 502 }); }
    return NextResponse.json({ ok: true, url: j.url });
  } catch { return NextResponse.json({ ok: false, fallback: `/${locale}/contact`, error: "Payment service unreachable." }, { status: 502 }); }
}
