import { SITE } from "./i18n";
import { getSettings } from "./settings";
import { posts } from "@/content/posts";
/** llms.txt — built from the live settings (Admin → SEO → llms.txt adds intro/extra text). */
export async function llms(full: boolean) {
  const { services, ventures, products, faqs, pricing, gigs, contact: CONTACT, llms: cfg, brand } = await getSettings();
  const L: string[] = [`# ${brand.name}`, "", `> ${cfg.intro}`, "",
    `Contact: ${CONTACT.phone} (WhatsApp/call) · Telegram ${CONTACT.telegramHandle} · ${CONTACT.email} · ${SITE}`, "", "## Services"];
  for (const s of services) { L.push(`- [${s.title}](${SITE}/en/services/${s.slug}): ${s.intro}`); if (full) { const g = gigs.find(x => x.svc === s.slug); g?.pkgs.forEach(p => L.push(`  - ${p.name}: $${p.price}, ${p.days} days delivery — ${p.desc}`)); } }
  L.push("", "## Products & ventures"); ventures.forEach(v => L.push(`- [${v.title}](${SITE}/en/ventures/${v.slug}): ${v.body}`)); products.forEach(p => L.push(`- ${p.n} (${p.p}): ${p.d}`)); L.push(`- [Stag Prime Sentinel](${SITE}/en/stag-sentinel): role-based infrastructure monitoring for approved teams and client workspaces.`);
  if (full) { L.push("", "## Starting prices"); pricing.forEach(p => p.rows.forEach(([n, v]) => L.push(`- ${p.area} — ${n}: ${v}`))); L.push("", "## FAQ"); faqs.forEach(([q, a]) => L.push(`Q: ${q}`, `A: ${a}`, "")); }
  L.push("", "## Guides"); posts.forEach(p => L.push(`- [${p.t}](${SITE}/en/blog/${p.slug}): ${p.d}`));
  if (cfg.extra) L.push("", cfg.extra);
  L.push("", "## Optional", `- [About](${SITE}/en/about)`, `- [Pricing](${SITE}/en/pricing)`, `- [Contact](${SITE}/en/contact)`);
  return L.join("\n");
}
