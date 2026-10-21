import { NextResponse } from "next/server";
import { capi } from "@/lib/capi";
const ALLOWED = ["ViewContent", "AddToCart", "InitiateCheckout", "Lead", "CompleteRegistration", "Contact"]; // Purchase is sent from the Stripe webhook only
export async function POST(req: Request) {
  if (!(req.headers.get("cookie") || "").includes("ads")) return NextResponse.json({ ok: true, skipped: "consent" });
  let b: { event?: string; eventId?: string; params?: Record<string, unknown>; url?: string } = {}; try { b = JSON.parse(await req.text()); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  if (!b.event || !ALLOWED.includes(b.event) || !b.eventId) return NextResponse.json({ ok: false }, { status: 400 });
  const p = b.params || {};
  const r = await capi(b.event, String(b.eventId).slice(0, 64), { url: b.url, ip: (req.headers.get("x-forwarded-for") || "").split(",")[0] || undefined, ua: req.headers.get("user-agent") || undefined, value: typeof p.value === "number" ? p.value : undefined, currency: p.currency as string, custom: { content_name: p.content_name } });
  return NextResponse.json({ ok: true, ...r });
}
