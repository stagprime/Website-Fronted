/**
 * Byte storage used by media, order/chat uploads, downloads and submission attachments.
 * BLOB_READ_WRITE_TOKEN set (Vercel) → private Vercel Blob store, always served through our own authorised routes.
 * Otherwise → local disk (VPS). On Vercel without Blob the disk falls back to /tmp (ephemeral).
 */
import fs from "fs/promises"; import path from "path";
export const blobOn = () => !!process.env.BLOB_READ_WRITE_TOKEN;
/** Writable data root: ./data on a normal server, /tmp on read-only serverless. */
export const dataRoot = () => (process.env.VERCEL ? "/tmp/stagprime-data" : path.join(process.cwd(), "data"));
const clean = (p: string) => p.replace(/\\/g, "/").split("/").filter(s => s && s !== "." && s !== "..").join("/");
/** area = logical bucket (e.g. "media", "orders", "downloads", "submissions"); base = local dir for that area. */
export async function putFile(area: string, base: string, rel: string, buf: Buffer) {
  rel = clean(rel);
  if (blobOn()) { const { put } = await import("@vercel/blob"); await put(`${area}/${rel}`, buf, { access: "private", addRandomSuffix: false, allowOverwrite: true }); return rel; }
  const p = path.join(base, rel); await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, buf); return rel;
}
export async function getFile(area: string, base: string, rel: string): Promise<Buffer | null> {
  rel = clean(rel);
  if (blobOn()) {
    const { get } = await import("@vercel/blob"); const r = await get(`${area}/${rel}`, { access: "private" }).catch(() => null);
    if (!r || !r.stream) return null; return Buffer.from(await new Response(r.stream as ReadableStream).arrayBuffer());
  }
  const full = path.resolve(base, rel); if (!full.startsWith(path.resolve(base) + path.sep)) return null;
  return fs.readFile(full).catch(() => null);
}
export async function delFile(area: string, base: string, rel: string) {
  rel = clean(rel);
  if (blobOn()) { const { del, head } = await import("@vercel/blob"); const h = await head(`${area}/${rel}`).catch(() => null); if (h) await del(h.url); return; }
  const full = path.resolve(base, rel); if (full.startsWith(path.resolve(base) + path.sep)) await fs.rm(full, { force: true });
}
export const ordersDir = () => process.env.UPLOADS_DIR || path.join(dataRoot(), "orders");
export const downloadsDir = () => process.env.DOWNLOADS_DIR || path.join(dataRoot(), "downloads");
