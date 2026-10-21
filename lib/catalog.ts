// Server-side price catalog: the client only sends an id, prices are never trusted from the browser.
// Built from the effective settings (Admin → Store: products, gigs, deposits) with the code files as fallback.
import { getSettings, type Settings } from "@/lib/settings";
export type Item = { name: string; amount: number; desc: string }; // amount in USD cents
export type GigItem = Item & { svc: string; tier: string; days: number };
const usd = (p: string) => Math.round(Number(String(p).replace(/[^0-9.]/g, "")) * 100);
export function buildCatalog(s: Pick<Settings, "products" | "gigs" | "deposits">) {
  const catalog: Record<string, Item> = {};
  for (const p of s.products) if (p.kind === "digital" && usd(p.p) > 0) catalog[`product:${p.slug}`] = { name: p.n, amount: usd(p.p), desc: p.d };
  for (const d of s.deposits) catalog[`deposit:${d.svc}`] = { name: d.name, amount: Math.round(d.usd * 100), desc: d.desc };
  const gigItems: Record<string, GigItem> = Object.fromEntries(s.gigs.flatMap(g => g.pkgs.map(p => [`gig:${g.svc}:${p.tier}`, { name: `${p.name} — ${g.svc}`, amount: Math.round(p.price * 100), desc: p.desc, svc: g.svc, tier: p.tier, days: p.days }])));
  Object.assign(catalog, gigItems);
  return { catalog, gigItems };
}
/** Fresh catalog for checkout/webhooks (settings cache is invalidated on every admin save). */
export async function getCatalog() { const s = await getSettings(); return { ...buildCatalog(s), donationTiers: s.donationTiers, sentinelPlans: s.sentinelPlans }; }
