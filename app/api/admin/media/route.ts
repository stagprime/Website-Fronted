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
    if (!contentMatches(f.name, buf)) return fail(`${f.name}: file content does not match its extension.`);
    if (/\.svg$/i.test(f.name) && /<script|<foreignobject|on\w+\s*=|javascript:|<!entity/i.test(buf.toString("utf8"))) return fail(`${f.name}: SVG contains scripts.`);
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

/** Magic-byte check so e.g. an HTML file renamed to .png is rejected (served type comes from the extension). */
function contentMatches(name: string, b: Buffer): boolean {
  const ext = (name.split(".").pop() || "").toLowerCase(), hex = b.subarray(0, 12).toString("hex"), head = b.subarray(0, 512).toString("utf8").trimStart().toLowerCase();
  const sig: Record<string, () => boolean> = {
    png: () => hex.startsWith("89504e47"), jpg: () => hex.startsWith("ffd8ff"), jpeg: () => hex.startsWith("ffd8ff"), gif: () => hex.startsWith("47494638"),
    webp: () => hex.startsWith("52494646") && b.subarray(8, 12).toString() === "WEBP", avif: () => b.subarray(4, 12).toString().startsWith("ftypavi"),
    ico: () => hex.startsWith("00000100"), pdf: () => hex.startsWith("25504446"), zip: () => hex.startsWith("504b"), docx: () => hex.startsWith("504b"), xlsx: () => hex.startsWith("504b"),
    doc: () => hex.startsWith("d0cf11e0"), xls: () => hex.startsWith("d0cf11e0"), mp4: () => b.subarray(4, 8).toString() === "ftyp", webm: () => hex.startsWith("1a45dfa3"),
    woff: () => hex.startsWith("774f4646"), woff2: () => hex.startsWith("774f4632"), ttf: () => hex.startsWith("00010000") || hex.startsWith("74727565"), otf: () => hex.startsWith("4f54544f"),
    svg: () => /^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!doctype svg[^>]*>\s*)?<svg[\s>]/.test(head),
    txt: () => !/<(html|script|body|iframe)/.test(head), csv: () => !/<(html|script|body|iframe)/.test(head),
  };
  return (sig[ext] || (() => false))();
}
