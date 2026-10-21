import { SITE, CONTACT } from "./i18n";
import { services, ventures, products, faqs, pricing } from "@/content/site";
import { gigs } from "@/content/gigs";
import { posts } from "@/content/posts";
export function llms(full: boolean) {
  const L: string[] = [`# Stag Prime`, "", `> Stag Prime (Stag Prime LLC, Wyoming, USA; operations office in Rajshahi, Bangladesh) is a full-service digital agency and product company: digital marketing (SEO, ASO, paid ads), web & app development, Amazon KDP & YouTube automation, AI video & animation, writing & consulting, and SaaS. It also builds and sells its own products, including Stag Prime Sentinel (infrastructure monitoring) and a print-on-demand merch network.`, "",
    `Contact: ${CONTACT.phone} (WhatsApp/call) · Telegram @stagprime · ${CONTACT.email} · ${SITE}`, "", "## Services"];
  for (const s of services) { L.push(`- [${s.title}](${SITE}/en/services/${s.slug}): ${s.intro}`); if (full) { const g = gigs.find(x => x.svc === s.slug); g?.pkgs.forEach(p => L.push(`  - ${p.name}: $${p.price}, ${p.days} days delivery — ${p.desc}`)); } }
  L.push("", "## Products & ventures"); ventures.forEach(v => L.push(`- [${v.title}](${SITE}/en/ventures/${v.slug}): ${v.body}`)); products.forEach(p => L.push(`- ${p.n} (${p.p}): ${p.d}`)); L.push(`- [Stag Prime Sentinel](${SITE}/en/stag-sentinel): role-based infrastructure monitoring for approved teams and client workspaces.`);
  if (full) { L.push("", "## Starting prices"); pricing.forEach(p => p.rows.forEach(([n, v]) => L.push(`- ${p.area} — ${n}: ${v}`))); L.push("", "## FAQ"); faqs.forEach(([q, a]) => L.push(`Q: ${q}`, `A: ${a}`, "")); }
  L.push("", "## Guides"); posts.forEach(p => L.push(`- [${p.t}](${SITE}/en/blog/${p.slug}): ${p.d}`));
  L.push("", "## Optional", `- [About](${SITE}/en/about)`, `- [Pricing](${SITE}/en/pricing)`, `- [Contact](${SITE}/en/contact)`);
  return L.join("\n");
}
