import fs from "fs/promises"; import path from "path";
import { db } from "@/lib/db";
import { auth } from "@/auth";
export const runtime = "nodejs";
// Streams an order file (delivery / digital download / attachment) to its owner or staff only.
export async function GET(req: Request) {
  const s = await auth(); if (!s?.user) return new Response("Unauthorized", { status: 401 });
  const id = new URL(req.url).searchParams.get("f") || ""; const file = await db.orderFile.findUnique({ where: { id }, include: { order: true } });
  if (!file || (file.order.userId !== s.user.id && !["admin", "staff"].includes(s.user.role))) return new Response("Not found", { status: 404 });
  const base = file.kind === "download" ? process.env.DOWNLOADS_DIR || path.join(process.cwd(), "data", "downloads") : process.env.UPLOADS_DIR || path.join(process.cwd(), "data", "orders");
  const full = path.resolve(base, file.path); if (!full.startsWith(path.resolve(base))) return new Response("Bad path", { status: 400 });
  try { const buf = await fs.readFile(full); return new Response(buf, { headers: { "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename="${file.name.replace(/"/g, "")}"`, "Cache-Control": "private, no-store" } }); }
  catch { return new Response("File missing", { status: 404 }); }
}
