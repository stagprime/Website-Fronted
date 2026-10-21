import path from "path"; import { getFile, ordersDir, downloadsDir } from "@/lib/files";
import { can } from "@/lib/rbac";
import { db } from "@/lib/db";
import { auth } from "@/auth";
export const runtime = "nodejs";
// Streams an order file (delivery / digital download / attachment) to its owner or staff only.
export async function GET(req: Request) {
  const s = await auth(); if (!s?.user) return new Response("Unauthorized", { status: 401 });
  const id = new URL(req.url).searchParams.get("f") || ""; const file = await db.orderFile.findUnique({ where: { id }, include: { order: true } });
  if (!file || (file.order.userId !== s.user.id && !can(s.user.role, "orders.view"))) return new Response("Not found", { status: 404 });
  const dl = file.kind === "download"; const base = dl ? downloadsDir() : ordersDir();
  if (path.resolve(base, file.path).startsWith(path.resolve(base) + path.sep) === false) return new Response("Bad path", { status: 400 });
  try { const buf = await getFile(dl ? "downloads" : "orders", base, file.path); if (!buf) throw new Error("missing"); return new Response(new Uint8Array(buf), { headers: { "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename="${file.name.replace(/"/g, "")}"`, "Cache-Control": "private, no-store" } }); }
  catch { return new Response("File missing", { status: 404 }); }
}
