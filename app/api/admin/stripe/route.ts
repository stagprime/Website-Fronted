import { db } from "@/lib/db";
import { route, ok, fail } from "@/lib/api";
import { getCatalog } from "@/lib/catalog";
import { getSettings, invalidateSettings } from "@/lib/settings";
import { stripe, stripeOn } from "@/lib/stripe";
import { audit } from "@/lib/audit";
export const runtime = "nodejs";
type Map_ = Record<string, { product: string; price: string; amount: number; syncedAt: string }>;
async function plan() {
  const { catalog } = await getCatalog(); const map = (await getSettings()).stripePrices as Map_;
  return Object.entries(catalog).map(([id, it]) => { const m = map[id]; return { id, name: it.name, amount: it.amount, product: m?.product || null, price: m?.price || null, syncedAmount: m?.amount ?? null, syncedAt: m?.syncedAt || null, state: !m ? "new" : m.amount !== it.amount ? "changed" : "synced" }; });
}
/** GET → catalog vs Stripe map (state new | changed | synced). */
export const GET = route("catalog.edit", async () => ok({ items: await plan(), enabled: stripeOn(), mode: (process.env.STRIPE_SECRET_KEY || "").startsWith("sk_live") ? "live" : "test" }));
/** POST {ids?: string[]} → create missing products, new prices for changed amounts (old price archived). Idempotent per amount. */
export const POST = route("catalog.edit", async ({ body, who, ip }) => {
  if (!stripeOn()) return fail("Stripe is not configured — set STRIPE_SECRET_KEY.", 409);
  const items = (await plan()).filter(i => i.state !== "synced" && (!Array.isArray(body.ids) || (body.ids as string[]).includes(i.id)));
  const map = { ...((await getSettings()).stripePrices as Map_) }; const done: string[] = []; const errors: string[] = [];
  for (const it of items) {
    try {
      let product = it.product;
      if (!product) { const p = await stripe<{ id: string }>("products", { name: it.name.slice(0, 250), metadata: { catalog_id: it.id } }, "POST", `prod-${it.id}`); product = p.id; }
      const price = await stripe<{ id: string }>("prices", { product, currency: "usd", unit_amount: it.amount, metadata: { catalog_id: it.id } }, "POST", `price-${it.id}-${it.amount}`);
      if (it.price && it.price !== price.id) await stripe(`prices/${it.price}`, { active: false }).catch(() => null);
      map[it.id] = { product, price: price.id, amount: it.amount, syncedAt: new Date().toISOString() }; done.push(it.id);
    } catch (e) { errors.push(`${it.id}: ${(e as Error).message}`); }
  }
  await db.setting.upsert({ where: { key: "stripePrices" }, create: { key: "stripePrices", value: JSON.stringify(map) }, update: { value: JSON.stringify(map) } });
  invalidateSettings("stripePrices"); await audit(who, "stripe.sync", "setting", "stripePrices", { done, errors }, ip);
  return ok({ synced: done.length, errors });
});
