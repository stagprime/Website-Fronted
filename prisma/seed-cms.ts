/**
 * Idempotent CMS seed: copies the code defaults (content/*.ts, lib/settings.ts) into the database so everything is editable in
 * the admin. It only CREATES missing rows — it never overwrites anything edited in the admin. The code files stay as fallback
 * (if a row is deleted or the DB is unreachable the site renders the file defaults).
 *   npm run db:seed:cms            (after `npm run db:migrate`, or `npm run db:sqlite` locally)
 *   SEED_FORCE=settings,pages npm run db:seed:cms   → re-copy those groups from code (overwrites; a revision is kept)
 * Owner: ADMIN_EMAIL (or the first admin) is promoted to role "owner". Passwords come only from ADMIN_PASSWORD (see seed.mjs).
 */
import { PrismaClient } from "@prisma/client";
import { DEFAULTS, SETTING_KEYS } from "../lib/settings";
import { HOME_SECTIONS, PAGE_SECTIONS } from "../lib/cms/blocks";
import fs from "fs";
import { privacy, terms, editorial } from "../content/legal";
import { EMAILS } from "../lib/email";
import { dicts, source, keyOf } from "../lib/tr";
import { locales } from "../lib/i18n";
const db = new PrismaClient();
const force = new Set((process.env.SEED_FORCE || "").split(",").map(s => s.trim()).filter(Boolean));
const tr = (l: string, s: string) => (l === "en" ? s : dicts[l]?.[keyOf(s)] || s);
const log: string[] = [];
async function upsertOnce<T>(group: string, exists: () => Promise<T | null>, create: () => Promise<unknown>, update?: (row: T) => Promise<unknown>) {
  const row = await exists();
  if (!row) { await create(); return "created"; }
  if (force.has(group) && update) { await update(row); return "forced"; }
  return "kept";
}
async function main() {
  const c = { created: 0, kept: 0, forced: 0 } as Record<string, number>;
  // 1. Settings: every key (brand, theme, contact, nav, footer, services, products, gigs, pricing, faqs, ventures, schema, llms, robots, …)
  for (const key of SETTING_KEYS) {
    const r = await upsertOnce("settings", () => db.setting.findUnique({ where: { key } }), () => db.setting.create({ data: { key, value: JSON.stringify(DEFAULTS[key]) } }),
      async row => { await db.revision.create({ data: { entity: "setting", entityId: key, data: row.value, actor: "seed" } }); await db.setting.update({ where: { key }, data: { value: JSON.stringify(DEFAULTS[key]) } }); });
    c[r]++;
  }
  log.push(`settings: ${SETTING_KEYS.length} keys`);
  // 2. Pages: home section order, legal bodies (all 7 locales from the built-in translations).
  const home = HOME_SECTIONS.map(h => ({ id: h.id, type: "legacy", visible: true, settings: {}, content: {} }));
  const legal = (items: [string, string][]) => [{ id: "body", type: "richText", visible: true, settings: { position: "body" }, content: Object.fromEntries(locales.map(l => [l, { body: items.map(([h, p]) => `## ${tr(l, h)}\n\n${tr(l, p)}`).join("\n\n") }])) }];
  const pages: [string, string, string, unknown][] = [["home", "Home", "page", home], ["/privacy", "Privacy Policy", "legal", legal(privacy)], ["/terms", "Terms of Service", "legal", legal(terms)], ["/editorial-policy", "Editorial Policy", "legal", legal(editorial)]];
  for (const [key, title, kind, sections] of pages) c[await upsertOnce("pages", () => db.page.findUnique({ where: { key } }), () => db.page.create({ data: { key, title, kind, status: "published", sections: JSON.stringify(sections), updatedBy: "seed" } }),
    async row => { await db.revision.create({ data: { entity: "page", entityId: key, data: row.sections, actor: "seed" } }); await db.page.update({ where: { key }, data: { sections: JSON.stringify(sections), draft: null } }); })]++;
  log.push(`pages: ${pages.length}`);
  // 2b. Coded pages (About, Contact, Careers, Blog index, Terms, Privacy): hero image + built-in sections with the current copy.
  //     Existing documents only get MISSING sections appended (never overwritten); the previous version is kept as a revision.
  const HERO_IMG: Record<string, string> = { "/about": "page-about", "/contact": "page-contact", "/careers": "page-careers", "/blog": "page-blog", "/terms": "svc-writing-consulting", "/privacy": "venture-stag-vpn" };
  const TITLES: Record<string, string> = { "/about": "About", "/contact": "Contact", "/careers": "Careers", "/blog": "Blog", "/terms": "Terms of Service", "/privacy": "Privacy Policy" };
  let codedAdded = 0;
  for (const [key, defs] of Object.entries(PAGE_SECTIONS)) {
    const img = fs.existsSync(`public/img/ai/${HERO_IMG[key]}.webp`) ? `/img/ai/${HERO_IMG[key]}.webp` : "";
    const want = [{ id: "hero", type: "pageHero", visible: true, settings: img ? { image: img } : {}, content: {} },
      ...defs.map(d => ({ id: d.id, type: "legacy", visible: true, settings: Object.fromEntries(d.fields.filter(f => !f.i18n && f.def !== undefined).map(f => [f.key, f.def])),
        content: { en: Object.fromEntries(d.fields.filter(f => f.i18n && f.def !== undefined).map(f => [f.key, f.def])) } }))];
    const row = await db.page.findUnique({ where: { key } });
    if (!row) { await db.page.create({ data: { key, title: TITLES[key], kind: key === "/terms" || key === "/privacy" ? "legal" : "page", status: "published", sections: JSON.stringify(want), updatedBy: "seed" } }); c.created++; codedAdded += want.length; continue; }
    const cur = JSON.parse(row.sections || "[]") as { id: string; type: string }[];
    const missing = want.filter(w => !cur.some(x => (w.type === "pageHero" ? x.type === "pageHero" : x.type === "legacy" && x.id === w.id)));
    if (!missing.length) { c.kept++; continue; }
    await db.revision.create({ data: { entity: "page", entityId: key, data: row.sections, actor: "seed" } });
    const hero = missing.filter(m => m.type === "pageHero"), rest = missing.filter(m => m.type !== "pageHero");
    // legal docs: body text stays where it is; the meta section goes first so the banner/date are easy to find
    await db.page.update({ where: { key }, data: { sections: JSON.stringify([...hero, ...cur, ...rest]) } }); c.forced++; codedAdded += missing.length;
  }
  log.push(`coded pages: ${Object.keys(PAGE_SECTIONS).length} (${codedAdded} sections added)`);
  // 3. Email templates (English defaults; other locales fall back to English until translated in the admin).
  for (const [key, t] of Object.entries(EMAILS)) c[await upsertOnce("emails", () => db.emailTemplate.findUnique({ where: { key_locale: { key, locale: "en" } } }), () => db.emailTemplate.create({ data: { key, locale: "en", subject: t.subject, body: t.body } }),
    () => db.emailTemplate.update({ where: { key_locale: { key, locale: "en" } }, data: { subject: t.subject, body: t.body } }))]++;
  log.push(`email templates: ${Object.keys(EMAILS).length}`);
  // 4. Starter form for the Form block.
  const fields = [{ key: "name", type: "text", label: { en: "Name", bn: tr("bn", "Name") }, required: true, width: "half" }, { key: "email", type: "email", label: { en: "Email" }, required: true, width: "half" },
    { key: "service", type: "select", label: { en: "Service" }, options: (DEFAULTS.services as { title: string }[]).map(s => s.title), width: "half" }, { key: "budget", type: "select", label: { en: "Budget" }, options: ["< $500", "$500 – $2,000", "$2,000 – $10,000", "$10,000+"], width: "half" },
    { key: "message", type: "textarea", label: { en: "Project details" }, required: true }];
  c[await upsertOnce("forms", () => db.form.findUnique({ where: { key: "quote-request" } }), () => db.form.create({ data: { key: "quote-request", title: "Quote request", fields: JSON.stringify(fields), settings: JSON.stringify({ recipients: "", submitLabel: { en: "Request a quote" }, successMsg: { en: "Thanks! We'll send a quote within one business day." } }) } }))]++;
  // 5. Knowledge base starter (AI chat; only used when OPENAI_API_KEY is set).
  c[await upsertOnce("kb", () => db.knowledgeDoc.findFirst({ where: { title: "Orders & delivery policy" } }), () => db.knowledgeDoc.create({ data: { title: "Orders & delivery policy", locale: "en", body: `Service orders start once the client submits requirements. Clients can accept a delivery or request a revision. Delivered orders complete automatically after ${DEFAULTS.orders.autoCompleteDays} days without a response. Refunds are handled by the team — the assistant must never promise one.` } }))]++;
  // 6. Owner role.
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const owner = email ? await db.user.findUnique({ where: { email } }) : await db.user.findFirst({ where: { role: "admin" as never }, orderBy: { createdAt: "asc" } });
  if (owner && owner.role !== "owner" && !(await db.user.count({ where: { role: "owner" as never } }))) { await db.user.update({ where: { id: owner.id }, data: { role: "owner" as never } }); log.push(`owner: ${owner.email}`); }
  console.log(`CMS seed — created ${c.created}, kept ${c.kept} (already in DB), forced ${c.forced}\n  ${log.join("\n  ")}\n  UI strings: ${Object.keys(source).length} keys stay in lib/tr/*.json (file fallback); admin edits go to UiString.`);
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
