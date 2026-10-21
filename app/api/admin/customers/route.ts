import { db } from "@/lib/db";
import { route, ok, fail, str } from "@/lib/api";
import { audit } from "@/lib/audit";
export const runtime = "nodejs";
/** GET list (?q=) or 360° view (?id=): profile, orders, LTV, chats, form submissions, notes. */
export const GET = route("customers.view", async ({ url }) => {
  const id = url.searchParams.get("id");
  if (id) {
    const u = await db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, locale: true, emailVerified: true, disabled: true, notes: true, createdAt: true, lastLoginAt: true, totpEnabled: true } });
    if (!u) return fail("Not found", 404);
    const [orders, chats, forms] = await Promise.all([
      db.order.findMany({ where: { OR: [{ userId: id }, { email: u.email }] }, orderBy: { createdAt: "desc" }, select: { id: true, title: true, amount: true, currency: true, status: true, createdAt: true, refundedAmount: true } }),
      db.chatConversation.findMany({ where: { OR: [{ userId: id }, { email: u.email }] }, orderBy: { updatedAt: "desc" }, take: 20, select: { id: true, status: true, updatedAt: true, page: true } }),
      db.formSubmission.findMany({ where: { data: { contains: u.email } }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, formKey: true, createdAt: true, status: true } }),
    ]);
    const paid = orders.filter(o => !["pending", "cancelled"].includes(o.status));
    return ok({ customer: u, orders, chats, forms, ltv: paid.reduce((a, o) => a + o.amount - o.refundedAmount, 0) });
  }
  const q = url.searchParams.get("q") || "";
  const users = await db.user.findMany({ where: { role: "customer" as never, ...(q && { OR: [{ email: { contains: q } }, { name: { contains: q } }] }) }, orderBy: { createdAt: "desc" }, take: 1000, select: { id: true, name: true, email: true, createdAt: true, lastLoginAt: true, disabled: true, emailVerified: true, _count: { select: { orders: true } } } });
  const sums = await db.order.groupBy({ by: ["userId"], where: { userId: { in: users.map(u => u.id) }, status: { notIn: ["pending", "cancelled"] as never[] } }, _sum: { amount: true, refundedAmount: true } });
  const m = new Map(sums.map(s => [s.userId, (s._sum.amount || 0) - (s._sum.refundedAmount || 0)]));
  return ok({ customers: users.map(u => ({ ...u, orders: u._count.orders, ltv: m.get(u.id) || 0 })) });
});
/** PUT {id, notes?, disabled?, name?} */
export const PUT = route("customers.edit", async ({ body, who, ip }) => {
  const id = str(body.id, 40); const u = await db.user.findUnique({ where: { id } }); if (!u) return fail("Not found", 404);
  if (u.role !== "customer") return fail("Staff accounts are managed in Team & roles", 409);
  const data: Record<string, unknown> = {}; if (typeof body.notes === "string") data.notes = body.notes.slice(0, 10000); if (typeof body.disabled === "boolean") data.disabled = body.disabled; if (typeof body.name === "string") data.name = str(body.name, 120) || null;
  await db.user.update({ where: { id }, data }); await audit(who, "customer.update", "user", id, data, ip); return ok();
});
