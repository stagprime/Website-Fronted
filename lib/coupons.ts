import { db, dbReady } from "@/lib/db";
/** Validate a coupon for a catalog item; returns the discounted amount in cents. */
export async function checkCoupon(code: string, itemId: string, amount: number): Promise<{ ok: true; amount: number; code: string } | { ok: false; error: string }> {
  if (!dbReady()) return { ok: false, error: "Coupons are unavailable." };
  const c = await db.coupon.findUnique({ where: { code: code.trim().toUpperCase() } }).catch(() => null);
  const now = new Date();
  if (!c || !c.active) return { ok: false, error: "This coupon code is not valid." };
  if ((c.startsAt && c.startsAt > now) || (c.endsAt && c.endsAt < now)) return { ok: false, error: "This coupon has expired." };
  if (c.maxRedemptions != null && c.redeemed >= c.maxRedemptions) return { ok: false, error: "This coupon has been fully used." };
  const rules = c.appliesTo.split(",").map(x => x.trim()).filter(Boolean);
  if (!(rules.includes("*") || rules.some(r => itemId === r || (r.endsWith(":") || r.endsWith("*")) && itemId.startsWith(r.replace(/\*$/, ""))))) return { ok: false, error: "This coupon does not apply to this item." };
  const off = c.kind === "percent" ? Math.round(amount * Math.min(100, Math.max(0, c.value)) / 100) : c.value;
  return { ok: true, amount: Math.max(50, amount - off), code: c.code }; // Stripe minimum charge is $0.50
}
export async function redeemCoupon(code: string) { await db.coupon.update({ where: { code }, data: { redeemed: { increment: 1 } } }).catch(() => null); }
