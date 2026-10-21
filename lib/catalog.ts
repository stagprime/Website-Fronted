// Server-side price catalog: the client only sends an id, prices are never trusted from the browser.
import { products } from "@/content/site";
import { gigs } from "@/content/gigs";
export type Item = { name: string; amount: number; desc: string }; // amount in USD cents
export const catalog: Record<string, Item> = {
  ...Object.fromEntries(products.filter(p => p.kind === "digital").map(p => [`product:${p.slug}`, { name: p.n, amount: Math.round(Number(p.p.replace(/[^0-9.]/g, "")) * 100), desc: p.d }])),
  "deposit:digital-marketing": { name: "Digital Marketing — project deposit", amount: 10000, desc: "Refundable-against-invoice deposit to book a Digital Marketing project kickoff." },
  "deposit:design-development": { name: "Design & Development — project deposit", amount: 25000, desc: "Deposit to reserve a development slot; credited to your final invoice." },
  "deposit:amazon-youtube-automation": { name: "Amazon & YouTube Automation — project deposit", amount: 10000, desc: "Deposit to start KDP / Merch / YouTube work; credited to your final invoice." },
  "deposit:ai-animation": { name: "AI & Animation — project deposit", amount: 10000, desc: "Deposit to book video or animation production; credited to your final invoice." },
  "deposit:writing-consulting": { name: "Writing & Consulting — project deposit", amount: 5000, desc: "Deposit to start writing or a consulting engagement; credited to your final invoice." },
  "deposit:saas": { name: "Software (SaaS) — discovery deposit", amount: 25000, desc: "Deposit for a SaaS discovery & scoping sprint; credited to your final invoice." },
};
export const gigItems: Record<string, Item & { svc: string; tier: string; days: number }> = Object.fromEntries(gigs.flatMap(g => g.pkgs.map(p => [`gig:${g.svc}:${p.tier}`, { name: `${p.name} — ${g.svc}`, amount: p.price * 100, desc: p.desc, svc: g.svc, tier: p.tier, days: p.days }])));
Object.assign(catalog, gigItems);
export const donationTiers = [10, 25, 50, 100, 250];
