import { db } from "@/lib/db";
import { route, ok, fail, str } from "@/lib/api";
import { driver, ALLOWED, MAX_BYTES, mimeOf, imageSize } from "@/lib/storage";
import { audit } from "@/lib/audit";
export const runtime = "nodejs";
const out = <M extends { path: string; alt: string | null }>(m: M) => ({ ...m, url: `/media/${m.path}`, alt: m.alt ? JSON.parse(m.alt) : {} });
export const GET = route("content.edit", async ({ url }) => {
  const q = url.searchParams.get("q") || ""; const missingAlt = url.searchParams.get("missingAlt") === "1";
  const rows = await db.media.findMany({ where: { ...(q && { name: { contains: q } }), ...(missingAlt && { OR: [{ alt: null }, { alt: "{}" }] }) }, orderBy: { createdAt: "desc" }, take: 500 });
  return ok({ items: rows.map(out) });
});
/** POST multipart: file(s) [+ folder]. */
export const POST = route("content.edit", async ({ req, who, ip }) => {
  const fd = await req.formData(); const folder = str(fd.get("folder"), 60); const done = [];
  for (const f of fd.getAll("file")) {
    if (typeof f === "string" || !f.size) continue;
    if (f.size > MAX_BYTES) return fail(`${f.name}: files must be under 25 MB.`);
    if (!ALLOWED.test(f.name)) return fail(`${f.name}: file type not allowed.`);
    const buf = Buffer.from(await f.arrayBuffer()); const dim = imageSize(buf);
    if (/\.svg$/i.test(f.name) && /<script|on\w+\s*=|javascript:/i.test(buf.toString("utf8"))) return fail(`${f.name}: SVG contains scripts.`);
    const key = await driver.put(f.name, buf, folder);
    const m = await db.media.create({ data: { path: key, name: f.name.slice(0, 200), mime: f.type || mimeOf(f.name), size: f.size, width: dim?.width, height: dim?.height, folder: folder || "/", uploadedBy: who.email, alt: JSON.stringify({}) } });
    done.push(out(m));
  }
  if (!done.length) return fail("No file received.");
  await audit(who, "media.upload", "media", done.map(d => d.id).join(","), done.map(d => d.name), ip);
  return ok({ items: done });
});
/** PUT {id, alt:{locale:text}, name?, folder?} */
export const PUT = route("content.edit", async ({ body, who, ip }) => {
  const id = str(body.id, 40); const alt = body.alt && typeof body.alt === "object" ? Object.fromEntries(Object.entries(body.alt as Record<string, unknown>).map(([k, v]) => [k.slice(0, 5), String(v).slice(0, 300)])) : undefined;
  const m = await db.media.update({ where: { id }, data: { ...(alt && { alt: JSON.stringify(alt) }), ...(body.name ? { name: str(body.name, 200) } : {}), ...(body.folder ? { folder: str(body.folder, 60) } : {}) } });
  await audit(who, "media.update", "media", id, { alt }, ip); return ok({ item: out(m) });
});
export const DELETE = route("content.edit", async ({ url, who, ip }) => {
  const id = url.searchParams.get("id") || ""; const m = await db.media.findUnique({ where: { id } }); if (!m) return fail("Not found", 404);
  await db.media.delete({ where: { id } }); await driver.del(m.path).catch(() => {}); await audit(who, "media.delete", "media", id, m.name, ip); return ok();
});
