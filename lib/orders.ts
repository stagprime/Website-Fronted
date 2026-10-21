/** Order lifecycle shared by the customer portal, the admin and the cron. */
import { db } from "./db";
import { sendEmail } from "./email";
import { getSettings } from "./settings";
export const STATUSES = ["pending", "in_progress", "delivered", "revision", "completed", "cancelled", "refunded"] as const;
export type OrderStatus = (typeof STATUSES)[number];
const SITE = () => process.env.NEXT_PUBLIC_SITE_URL || "https://www.stagprime.com";
export const orderUrl = (o: { id: string; locale?: string | null }) => `${SITE()}/${o.locale || "en"}/account/orders/${o.id}`;
const label = (s: string) => s.replace("_", " ");
/** Change status + timeline event + customer email (unless silent). Sets deliveredAt/progress where it makes sense. */
export async function setOrderStatus(id: string, status: OrderStatus, opts: { note?: string; actorId?: string; silent?: boolean; kind?: string } = {}) {
  const o = await db.order.findUnique({ where: { id } }); if (!o) throw new Error("Order not found");
  const data: Record<string, unknown> = { status };
  if (status === "delivered") { data.deliveredAt = new Date(); data.progress = 100; }
  if (status === "completed") data.progress = 100;
  if (status === "revision") data.deliveredAt = null;
  const u = await db.order.update({ where: { id }, data: data as never });
  await db.orderEvent.create({ data: { orderId: id, status: status as never, note: opts.note || null, kind: opts.kind || "status", actorId: opts.actorId } });
  if (!opts.silent) {
    const s = await getSettings().catch(() => null); const days = s?.orders.autoCompleteDays ?? 3;
    const key = status === "delivered" ? "order.delivered" : status === "completed" ? "order.completed" : "order.status";
    await sendEmail(key, o.email, { title: o.title, status: label(status), note: opts.note || "", url: orderUrl(o), days }, o.locale).catch(() => {});
  }
  return u;
}
/** Delivered orders with no customer response complete automatically after N days (Admin → Site settings → Orders; default 3). */
export async function autoComplete(now = new Date()) {
  const s = await getSettings(); const days = Math.max(1, Number(s.orders.autoCompleteDays) || 3);
  const cutoff = new Date(now.getTime() - days * 86400_000);
  const due = await db.order.findMany({ where: { status: "delivered" as never, OR: [{ deliveredAt: { lte: cutoff } }, { deliveredAt: null, updatedAt: { lte: cutoff } }] }, select: { id: true } });
  for (const o of due) await setOrderStatus(o.id, "completed", { note: `Auto-completed ${days} days after delivery (no response).`, kind: "system" });
  return due.length;
}
