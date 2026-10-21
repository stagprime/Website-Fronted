import { NextResponse } from "next/server";
import fs from "fs/promises"; import path from "path";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { sameOrigin } from "@/lib/guard";
import { limit } from "@/lib/ratelimit";
import { deliverMail } from "@/lib/mailer";
export const runtime = "nodejs";
const STAFF = ["admin", "staff"];
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false, error: "Invalid origin" }, { status: 403 });
  const s = await auth(); if (!s?.user) return NextResponse.json({ ok: false, error: "Please log in." }, { status: 401 });
  if (!limit(`ord:${s.user.id}`, 30, 600_000)) return NextResponse.json({ ok: false, error: "Slow down a little." }, { status: 429 });
  const fd = await req.formData(); const id = String(fd.get("orderId") || ""); const action = String(fd.get("action") || "");
  const o = await db.order.findUnique({ where: { id } }); const staff = STAFF.includes(s.user.role);
  if (!o || (!staff && o.userId !== s.user.id)) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
  let file: string | undefined;
  const f = fd.get("file");
  if (f && typeof f !== "string" && f.size) {
    if (f.size > 10 * 1024 * 1024) return NextResponse.json({ ok: false, error: "Files must be under 10 MB." }, { status: 422 });
    if (!/\.(pdf|docx?|xlsx?|png|jpe?g|webp|zip|txt|csv|mp4|mov|ai|psd|fig)$/i.test(f.name)) return NextResponse.json({ ok: false, error: "File type not allowed." }, { status: 422 });
    const dir = path.join(process.env.UPLOADS_DIR || path.join(process.cwd(), "data", "orders"), o.id); await fs.mkdir(dir, { recursive: true });
    const name = `${Date.now()}-${f.name.replace(/[^\w.-]/g, "_")}`; await fs.writeFile(path.join(dir, name), Buffer.from(await f.arrayBuffer())); file = `${o.id}/${name}`;
  }
  if (action === "requirements") {
    const req: Record<string, string> = {}; fd.forEach((v, k) => { if (typeof v === "string" && k.startsWith("q_")) req[k.slice(2)] = v.slice(0, 3000); });
    await db.order.update({ where: { id }, data: { requirements: JSON.stringify(req) as never, status: "in_progress" as never } });
    await db.orderEvent.create({ data: { orderId: id, status: "in_progress" as never, note: "Requirements received — work has started." } });
    if (file) await db.orderFile.create({ data: { orderId: id, name: file.split("/").pop()!, path: file, kind: "attachment" } });
    await deliverMail(process.env.MAIL_TO || "brand@stagprime.com", `[order ${id}] requirements submitted`, JSON.stringify(req, null, 2));
    return NextResponse.json({ ok: true });
  }
  if (action === "message") {
    const body = String(fd.get("body") || "").trim().slice(0, 5000); if (!body && !file) return NextResponse.json({ ok: false, error: "Write a message or attach a file." }, { status: 422 });
    await db.message.create({ data: { orderId: id, userId: s.user.id, fromStaff: staff, body, file } });
    if (file) await db.orderFile.create({ data: { orderId: id, name: file.split("/").pop()!, path: file, kind: staff ? "delivery" : "attachment" } });
    await deliverMail(staff ? o.email : process.env.MAIL_TO || "brand@stagprime.com", `New message on order: ${o.title}`, body || "(file attached)");
    return NextResponse.json({ ok: true });
  }
  if (action === "status" && staff) {
    const st = String(fd.get("status")); if (!["pending", "in_progress", "delivered", "revision", "completed", "cancelled"].includes(st)) return NextResponse.json({ ok: false }, { status: 422 });
    await db.order.update({ where: { id }, data: { status: st as never } }); await db.orderEvent.create({ data: { orderId: id, status: st as never, note: String(fd.get("note") || "") || null } });
    await deliverMail(o.email, `Order update: ${o.title}`, `Your order status is now: ${st.replace("_", " ")}.`); return NextResponse.json({ ok: true });
  }
  if (action === "revision" && !staff && o.status === "delivered") { await db.order.update({ where: { id }, data: { status: "revision" as never } }); await db.orderEvent.create({ data: { orderId: id, status: "revision" as never, note: String(fd.get("note") || "").slice(0, 2000) || "Revision requested." } }); return NextResponse.json({ ok: true }); }
  if (action === "accept" && !staff && o.status === "delivered") { await db.order.update({ where: { id }, data: { status: "completed" as never } }); await db.orderEvent.create({ data: { orderId: id, status: "completed" as never, note: "Delivery accepted by client." } }); return NextResponse.json({ ok: true }); }
  return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
}
