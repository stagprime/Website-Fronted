import { driver, mimeOf } from "@/lib/storage";
import { db, dbReady } from "@/lib/db";
export const runtime = "nodejs";
/** Public media from Admin → Media library (private items are never served here). */
export async function GET(_: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.map(decodeURIComponent).join("/");
  if (dbReady()) { const m = await db.media.findUnique({ where: { path: key } }).catch(() => null); if (!m || m.private) return new Response("Not found", { status: 404 }); }
  const buf = await driver.get(key).catch(() => null); if (!buf) return new Response("Not found", { status: 404 });
  const type = mimeOf(key);
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff", ...(type === "image/svg+xml" && { "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" }) } });
}
