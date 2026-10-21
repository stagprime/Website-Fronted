import { db } from "@/lib/db";
import { route, ok, fail, str } from "@/lib/api";
import { autoComplete } from "@/lib/orders";
export const runtime = "nodejs";
/** Test-only helpers for scripts/e2e-admin.mjs (owner only). Disabled in production unless SP_E2E=1. */
export const POST = route("users.manage", async ({ body, who }) => {
  if (process.env.NODE_ENV === "production" && process.env.SP_E2E !== "1") return fail("Not available", 404);
  const a = str(body.action, 20);
  if (a === "order") { const o = await db.order.create({ data: { email: "e2e@example.com", userId: who.id, kind: "service" as never, item: "gig:saas:basic", title: "E2E test order", amount: 4900, status: "in_progress" as never } }); return ok({ id: o.id }); }
  if (a === "age") { const d = new Date(Date.now() - Number(body.days || 4) * 86400_000); await db.order.update({ where: { id: str(body.id, 40) }, data: { deliveredAt: d } }); return ok(); }
  if (a === "autocomplete") return ok({ completed: await autoComplete() });
  if (a === "cleanup") { await db.order.deleteMany({ where: { id: str(body.id, 40), email: "e2e@example.com" } }); return ok(); }
  return fail("Unknown");
});
