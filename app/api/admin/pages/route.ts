import { revalidateTag, revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { route, ok, fail, str, need } from "@/lib/api";
import { can } from "@/lib/rbac";
import { pageRoutes } from "@/lib/routes";
import { getSettings } from "@/lib/settings";
import { BLOCKS, HOME_SECTIONS, PAGE_HERO_FIELDS, parseSections, cleanHtml, type Section } from "@/lib/cms/blocks";
import { audit, snapshot } from "@/lib/audit";
export const runtime = "nodejs";
const RESERVED = /^\/(api|admin|_next|media|account|login|checkout|blog|store|services|ventures|sitemap|robots|llms)(\/|$)/;
async function coded() { const s = await getSettings();
  return [{ key: "home", title: "Home", group: "Core" }, ...pageRoutes.filter(Boolean).map(p => ({ key: p, title: p.slice(1).replace(/[-/]/g, " "), group: ["/privacy", "/terms", "/editorial-policy"].includes(p) ? "Legal" : "Core" })),
    ...s.services.map(x => ({ key: `/services/${x.slug}`, title: x.title, group: "Services" })), ...s.ventures.map(v => ({ key: `/ventures/${v.slug}`, title: v.title, group: "Ventures" })), ...s.storeCats.map(c => ({ key: `/store/${c.slug}`, title: c.t, group: "Store" })), { key: "/blog", title: "Blog index", group: "Core" }]; }
/** GET list or ?key= one doc (+ block registry). */
export const GET = route("content.edit", async ({ url, who }) => {
  const key = url.searchParams.get("key");
  if (key) {
    const row = await db.page.findUnique({ where: { key } }); const c = (await coded()).find(x => x.key === key);
    if (!row && !c) return fail("Unknown page", 404);
    const revisions = row ? await db.revision.findMany({ where: { entity: "page", entityId: key }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, actor: true, createdAt: true } }) : [];
    return ok({ key, title: row?.title || c?.title || key, kind: row?.kind || (c?.group === "Legal" ? "legal" : c ? "page" : "custom"), status: row?.status || "published", coded: !!c, sections: parseSections(row?.draft || row?.sections) || [], published: parseSections(row?.sections) || [], hasDraft: !!row?.draft, updatedAt: row?.updatedAt, updatedBy: row?.updatedBy, revisions,
      registry: { blocks: BLOCKS.filter(b => !b.ownerOnly || can(who.role, "html.edit")), legacy: key === "home" ? HOME_SECTIONS : [], pageHero: c && key !== "home" ? PAGE_HERO_FIELDS : null } });
  }
  const rows = await db.page.findMany({ select: { key: true, title: true, kind: true, status: true, updatedAt: true, updatedBy: true, draft: true } });
  const m = new Map(rows.map(r => [r.key, r])); const list = (await coded()).map(c => ({ ...c, id: c.key, managed: m.has(c.key), status: m.get(c.key)?.status || "published", updatedAt: m.get(c.key)?.updatedAt || null, hasDraft: !!m.get(c.key)?.draft, kind: c.group === "Legal" ? "legal" : "page" }));
  for (const r of rows) if (!list.find(x => x.key === r.key)) list.push({ key: r.key, id: r.key, title: r.title, group: "Custom pages", managed: true, status: r.status, updatedAt: r.updatedAt, hasDraft: !!r.draft, kind: r.kind });
  return ok({ pages: list });
});
function clean(sections: unknown, allowHtml: boolean): Section[] | string {
  if (!Array.isArray(sections)) return "sections must be an array"; if (sections.length > 80) return "Too many sections (max 80)";
  const out: Section[] = [];
  for (const s of sections as Section[]) {
    if (!s || typeof s !== "object" || typeof s.type !== "string" || typeof s.id !== "string") return "Invalid section";
    if (s.type === "html" && !allowHtml) return "Your role cannot add Custom HTML blocks";
    const content = s.content && typeof s.content === "object" ? s.content : {};
    if (s.type === "html") for (const l of Object.keys(content)) if (typeof content[l]?.html === "string") content[l].html = cleanHtml(String(content[l].html));
    if (s.settings && typeof s.settings.html === "string") s.settings.html = cleanHtml(s.settings.html);
    out.push({ id: s.id.slice(0, 40), type: s.type.slice(0, 30), visible: s.visible !== false, settings: s.settings && typeof s.settings === "object" ? s.settings : {}, content, ...(s.label && { label: String(s.label).slice(0, 80) }), ...(s.schedule && { schedule: s.schedule }), ...(Array.isArray(s.locales) && s.locales.length && { locales: s.locales.map(String) }) });
  }
  return out;
}
/** PUT {key, title?, sections, mode:"draft"|"publish", status?} | {key, discard:true} | {key, revision} */
export const PUT = route("content.edit", async ({ body, who, ip }) => {
  const key = str(body.key, 200); need(key, "key required");
  const row = await db.page.findUnique({ where: { key } }); const isCoded = (await coded()).some(c => c.key === key);
  if (!row && !isCoded) return fail("Create the page first", 404);
  const done = async (action: string, d?: unknown) => { revalidateTag("pages"); revalidatePath("/", "layout"); await audit(who, action, "page", key, d, ip); };
  if (body.discard) { if (row) await db.page.update({ where: { key }, data: { draft: null } }); await done("page.discard"); return ok(); }
  if (body.revision) { const r = await db.revision.findUnique({ where: { id: String(body.revision) } }); if (!r || r.entityId !== key) return fail("Revision not found", 404);
    if (row) await snapshot("page", key, row.sections, who.email); await db.page.upsert({ where: { key }, create: { key, title: key, sections: r.data, updatedBy: who.email }, update: { sections: r.data, draft: null, updatedBy: who.email } }); await done("page.restore", r.id); return ok(); }
  if (body.unmanage && isCoded) { if (row) { await snapshot("page", key, row.sections, who.email); await db.page.delete({ where: { key } }); } await done("page.reset"); return ok(); }
  const secs = clean(body.sections, can(who.role, "html.edit")); if (typeof secs === "string") return fail(secs);
  const json = JSON.stringify(secs); if (json.length > 1_500_000) return fail("Page is too large");
  const title = str(body.title, 200) || row?.title || key; const status = body.status === "draft" ? "draft" : body.status === "published" ? "published" : row?.status || "published";
  const kind = row?.kind || (["/privacy", "/terms", "/editorial-policy"].includes(key) ? "legal" : "page");
  if (body.mode === "draft") { await db.page.upsert({ where: { key }, create: { key, title, kind, status: row ? status : "published", sections: row?.sections || "[]", draft: json, updatedBy: who.email }, update: { draft: json, title, updatedBy: who.email } }); await audit(who, "page.draft", "page", key, { sections: secs.length }, ip); return ok({ draft: true }); }
  if (row) await snapshot("page", key, row.sections, who.email);
  await db.page.upsert({ where: { key }, create: { key, title, kind, status, sections: json, updatedBy: who.email }, update: { sections: json, draft: null, title, status, updatedBy: who.email } });
  await done("page.publish", { sections: secs.length, status }); return ok();
});
/** POST {key:"/landing", title, template?} — new custom page. */
export const POST = route("content.edit", async ({ body, who, ip }) => {
  let key = str(body.key, 120).toLowerCase(); if (!key.startsWith("/")) key = "/" + key; key = key.replace(/\/+$/, "");
  need(/^\/[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(key), "Path must look like /my-landing-page (lowercase, dashes)");
  if (RESERVED.test(key) || pageRoutes.includes(key)) return fail("That path is used by the site already", 409);
  if (await db.page.findUnique({ where: { key } })) return fail("A page with that path exists", 409);
  const title = str(body.title, 200) || key.slice(1);
  const starter: Section[] = [{ id: "h1", type: "hero", visible: true, settings: {}, content: { en: { title, sub: "", cta1: "Get started", cta1Href: "/contact" } } }, { id: "t1", type: "richText", visible: true, settings: {}, content: { en: { heading: "", body: "" } } }, { id: "c1", type: "cta", visible: true, settings: {}, content: {} }];
  await db.page.create({ data: { key, title, kind: "custom", status: "draft", sections: JSON.stringify(starter), updatedBy: who.email } });
  revalidateTag("pages"); await audit(who, "page.create", "page", key, { title }, ip); return ok({ key });
});
export const DELETE = route("content.edit", async ({ url, who, ip }) => {
  const key = url.searchParams.get("key") || ""; const row = await db.page.findUnique({ where: { key } }); if (!row) return fail("Not found", 404);
  if (row.kind !== "custom") return fail("Built-in pages can't be deleted — use “Reset to code” instead", 409);
  await snapshot("page", key, row.sections, who.email); await db.page.delete({ where: { key } }); revalidateTag("pages"); await audit(who, "page.delete", "page", key, row.title, ip); return ok();
});
