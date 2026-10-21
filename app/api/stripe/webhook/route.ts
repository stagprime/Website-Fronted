import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { catalog, gigItems } from "@/lib/catalog";
import { capi } from "@/lib/capi";
import { deliverMail } from "@/lib/mailer";
export const runtime = "nodejs";
// Verifies Stripe-Signature (v1 HMAC-SHA256) without the SDK, then records the order.
function verify(payload: string, header: string, secret: string) {
  const parts = Object.fromEntries(header.split(",").map(p => p.split("=") as [string, string])); const t = parts.t, sig = header.split(",").filter(p => p.startsWith("v1=")).map(p => p.slice(3));
  if (!t || !sig.length || Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const exp = crypto.createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  return sig.some(s => s.length === exp.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(exp)));
}
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET; if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  const payload = await req.text();
  if (!verify(payload, req.headers.get("stripe-signature") || "", secret)) return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  const ev = JSON.parse(payload);
  if (ev.type === "checkout.session.completed" || ev.type === "checkout.session.async_payment_succeeded") {
    const s = ev.data.object; if (s.payment_status !== "paid" && s.mode !== "subscription") return NextResponse.json({ ok: true });
    const item = String(s.metadata?.item || ""); const email = String(s.customer_details?.email || s.customer_email || "").toLowerCase();
    const kind = item.startsWith("gig:") ? "service" : item.startsWith("sub:") ? "subscription" : item === "donation" ? "donation" : "product";
    const g = gigItems[item]; const user = email ? await db.user.findUnique({ where: { email } }) : null;
    const exists = await db.order.findUnique({ where: { stripeSessionId: s.id } });
    if (!exists) {
      const o = await db.order.create({ data: { email, userId: user?.id, kind: kind as never, item, title: catalog[item]?.name || item, amount: s.amount_total || 0, currency: s.currency || "usd", stripeSessionId: s.id, stripePaymentId: s.payment_intent || s.subscription,
        status: (kind === "service" ? "pending" : "completed") as never, dueAt: g ? new Date(Date.now() + g.days * 86400_000) : null } });
      await db.orderEvent.create({ data: { orderId: o.id, status: o.status, note: kind === "service" ? "Payment received — please submit your requirements." : "Payment received." } });
      if (kind === "product") { const dl = await db.download.findUnique({ where: { sku: item.replace("product:", "") } }); if (dl) await db.orderFile.create({ data: { orderId: o.id, name: dl.name, path: dl.path, kind: "download" } }); }
      if (email) await deliverMail(email, `Your Stag Prime order: ${o.title}`, `Thank you for your order!\n\n${o.title}\nAmount: $${(o.amount / 100).toFixed(2)}\n\nTrack it, download files and message our team in your account: ${process.env.NEXT_PUBLIC_SITE_URL || "https://www.stagprime.com"}/en/account\n(Create an account with ${email} to see this order.)`);
      await deliverMail(process.env.MAIL_TO || "brand@stagprime.com", `[order] ${o.title} — ${email}`, `New ${kind} order ${o.id}\n${o.title}\n$${(o.amount / 100).toFixed(2)}\n${email}`);
      // Purchase via CAPI with event_id = session id (dedups with the browser Pixel event on the success page).
      await capi("Purchase", s.id, { email, value: (s.amount_total || 0) / 100, currency: (s.currency || "usd").toUpperCase(), url: s.success_url, custom: { content_ids: [item] } });
    }
  }
  return NextResponse.json({ received: true });
}
