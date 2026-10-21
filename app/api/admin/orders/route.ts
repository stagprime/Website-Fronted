import { putFile, ordersDir } from "@/lib/files";
import { db } from "@/lib/db";
import { route, ok, fail, str, need } from "@/lib/api";
import { can } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { setOrderStatus, autoComplete, STATUSES, orderUrl, type OrderStatus } from "@/lib/orders";
import { sendEmail } from "@/lib/email";
import { stripe, stripeOn } from "@/lib/stripe";
export const runtime = "nodejs";
let lastAuto = 0;
/** GET list (?status=&q=&kind=) or detail (?id=). Opportunistically runs the 3-day auto-complete (hourly). */
export const GET = route("orders.view", async ({ url }) => {
  if (Date.now() - lastAuto > 3600_000) { lastAuto = Date.now(); await autoComplete().catch(e => console.error("[autoComplete]", e)); }
  const id = url.searchParams.get("id");
  if (id) {
    const o = await db.order.findUnique({ where: { id }, include: { events: { orderBy: { createdAt: "asc" } }, files: { orderBy: { createdAt: "asc" } }, messages: { orderBy: { createdAt: "asc" } }, user: { select: { id: true, name: true, email: true, createdAt: true } } } });
    if (!o) return fail("Order not found", 404);
    const staffIds = [...new Set([...o.events.map(e => e.actorId), o.assigneeId].filter(Boolean) as string[])];
    const people = await db.user.findMany({ where: { id: { in: staffIds } }, select: { id: true, name: true, email: true } });
    const team = await db.user.findMany({ where: { role: { in: ["owner", "admin", "editor", "support", "staff"] as never[] }, disabled: false }, select: { id: true, name: true, email: true } });
    const other = o.userId ? await db.order.count({ where: { userId: o.userId } }) : await db.order.count({ where: { email: o.email } });
    return ok({ order: { ...o, requirements: typeof o.requirements === "string" ? safe(o.requirements) : o.requirements }, people, team, customerOrders: other, stripe: stripeOn() && !!o.stripePaymentId, url: orderUrl(o) });
  }
  const status = url.searchParams.get("status") || ""; const q = url.searchParams.get("q") || ""; const kind = url.searchParams.get("kind") || "";
  const rows = await db.order.findMany({ where: { ...(status && status !== "active" && { status: status as never }), ...(status === "active" && { status: { in: ["pending", "in_progress", "revision", "delivered"] as never[] } }), ...(kind && { kind: kind as never }), ...(q && { OR: [{ email: { contains: q } }, { title: { contains: q } }, { id: { contains: q } }, { item: { contains: q } }] }) }, orderBy: { createdAt: "desc" }, take: 1000, select: { id: true, email: true, title: true, item: true, kind: true, amount: true, currency: true, status: true, progress: true, dueAt: true, deliveredAt: true, createdAt: true, refundedAmount: true, assigneeId: true, couponCode: true } });
  const counts = await db.order.groupBy({ by: ["status"], _count: true });
  return ok({ orders: rows, counts: Object.fromEntries(counts.map(c => [c.status, c._count])) });
});
const safe = (s: string) => { try { return JSON.parse(s); } catch { return s; } };
/** PUT {id, action: status|progress|note|milestone|assign|due|message, ...} */
export const PUT = route("orders.update", async ({ body, who, ip }) => {
  const id = str(body.id, 40); const action = str(body.action, 20); const o = await db.order.findUnique({ where: { id } }); if (!o) return fail("Order not found", 404);
  const note = str(body.note, 4000);
  switch (action) {
    case "status": { const st = str(body.status, 20) as OrderStatus; need(STATUSES.includes(st) && st !== "refunded", "Invalid status (use Refund for refunds)"); await setOrderStatus(id, st, { note: note || undefined, actorId: who.id, silent: body.notify === false }); break; }
    case "progress": { const p = Math.max(0, Math.min(100, Math.round(Number(body.progress) || 0))); await db.order.update({ where: { id }, data: { progress: p } }); await db.orderEvent.create({ data: { orderId: id, status: o.status, kind: "milestone", note: note || `Progress ${p}%`, actorId: who.id } }); break; }
    case "milestone": need(note, "Describe the milestone"); await db.orderEvent.create({ data: { orderId: id, status: o.status, kind: "milestone", note, actorId: who.id } }); if (body.notify) await sendEmail("order.status", o.email, { title: o.title, status: o.status.replace("_", " "), note, url: orderUrl(o) }, o.locale); break;
    case "note": need(note, "Note is empty"); await db.orderEvent.create({ data: { orderId: id, status: o.status, kind: "note", internal: true, note, actorId: who.id } }); break;
    case "assign": await db.order.update({ where: { id }, data: { assigneeId: str(body.assigneeId, 40) || null } }); break;
    case "due": await db.order.update({ where: { id }, data: { dueAt: body.dueAt ? new Date(String(body.dueAt)) : null } }); break;
    case "message": need(note, "Message is empty"); await db.message.create({ data: { orderId: id, userId: who.id, fromStaff: true, body: note } }); await sendEmail("order.message", o.email, { title: o.title, body: note, url: orderUrl(o) }, o.locale); break;
    default: return fail("Unknown action");
  }
  await audit(who, `order.${action}`, "order", id, { status: body.status, progress: body.progress, note: note.slice(0, 200) }, ip);
  return ok();
});
/** POST multipart {id, file(s), note?, deliver?} — upload delivery files (optionally marking the order delivered). Or JSON {id, action:"refund", amount, reason}. */
export const POST = route("orders.update", async ({ req, who, ip, body }) => {
  if ((req.headers.get("content-type") || "").includes("application/json")) {
    if (body.action !== "refund") return fail("Unknown action");
    const { requirePerm } = await import("@/lib/rbac"); if (!(await requirePerm("orders.refund"))) return fail("Only admins can refund.", 403);
    const id = str(body.id, 40); const o = await db.order.findUnique({ where: { id } }); if (!o) return fail("Order not found", 404);
    const left = o.amount - o.refundedAmount; const amount = Math.round(Number(body.amount) || left); need(amount > 0 && amount <= left, `Amount must be between 1 and ${left} cents`);
    let refundId = "manual";
    if (o.stripePaymentId && stripeOn()) { const r = await stripe<{ id: string }>("refunds", { payment_intent: o.stripePaymentId, amount, reason: "requested_by_customer", metadata: { orderId: id, by: who.email } }, "POST", `refund-${id}-${o.refundedAmount}-${amount}`); refundId = r.id; }
    else if (!body.manual) return fail("This order has no Stripe payment. Tick “record manual refund” if you refunded outside Stripe.", 409);
    const total = o.refundedAmount + amount; const full = total >= o.amount;
    await db.order.update({ where: { id }, data: { refundedAmount: total, ...(full && { status: "refunded" as never }) } });
    await db.orderEvent.create({ data: { orderId: id, status: (full ? "refunded" : o.status) as never, kind: "refund", note: `Refunded ${(amount / 100).toFixed(2)} ${o.currency.toUpperCase()}${str(body.reason, 300) ? ` — ${str(body.reason, 300)}` : ""} (${refundId})`, actorId: who.id, internal: false } });
    await sendEmail("order.refunded", o.email, { title: o.title, amount: `${(amount / 100).toFixed(2)} ${o.currency.toUpperCase()}` }, o.locale).catch(() => {});
    await audit(who, "order.refund", "order", id, { amount, refundId, full }, ip);
    return ok({ refundId, full });
  }
  if (!can(who.role, "orders.update")) return fail("Forbidden", 403);
  const fd = await req.formData(); const id = str(fd.get("id"), 40); const o = await db.order.findUnique({ where: { id } }); if (!o) return fail("Order not found", 404);
  
  const names: string[] = [];
  for (const f of fd.getAll("file")) { if (typeof f === "string" || !f.size) continue;
    if (f.size > 200 * 1024 * 1024) return fail(`${f.name}: deliveries must be under 200 MB.`);
    if (/\.(exe|bat|cmd|sh|msi|js|html?)$/i.test(f.name)) return fail(`${f.name}: file type not allowed.`);
    const name = `${Date.now()}-${f.name.replace(/[^\w.-]/g, "_")}`; await putFile("orders", ordersDir(), `${o.id}/${name}`, Buffer.from(await f.arrayBuffer()));
    await db.orderFile.create({ data: { orderId: id, name: f.name.slice(0, 200), path: `${o.id}/${name}`, kind: "delivery" } }); names.push(f.name); }
  need(names.length, "Attach at least one file");
  const note = str(fd.get("note"), 4000);
  await db.orderEvent.create({ data: { orderId: id, status: o.status, kind: "delivery", note: `Delivery files: ${names.join(", ")}${note ? `\n${note}` : ""}`, actorId: who.id } });
  if (fd.get("deliver") === "1") await setOrderStatus(id, "delivered", { note: note || undefined, actorId: who.id });
  await audit(who, "order.delivery", "order", id, names, ip);
  return ok({ files: names });
});
