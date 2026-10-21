import { db } from "@/lib/db";
import { route, ok, fail, str } from "@/lib/api";
import { autoComplete } from "@/lib/orders";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { forgetRole } from "@/lib/rbac";
export const runtime = "nodejs";
/** Test-only helpers for scripts/e2e-admin.mjs (owner only). Disabled in production unless SP_E2E=1. */
export const POST = route("users.manage", async ({ body, who }) => {
  if (process.env.NODE_ENV === "production" && process.env.SP_E2E !== "1") return fail("Not available", 404);
  const a = str(body.action, 20);
  if (a === "order") { const o = await db.order.create({ data: { email: "e2e@example.com", userId: who.id, kind: "service" as never, item: "gig:saas:basic", title: "E2E test order", amount: 4900, status: "in_progress" as never } }); return ok({ id: o.id }); }
  if (a === "age") { const d = new Date(Date.now() - Number(body.days || 4) * 86400_000); await db.order.update({ where: { id: str(body.id, 40) }, data: { deliveredAt: d } }); return ok(); }
  if (a === "autocomplete") return ok({ completed: await autoComplete() });
  if (a === "cleanup") { await db.order.deleteMany({ where: { id: str(body.id, 40), email: "e2e@example.com" } }); return ok(); }
  // Throwaway staff account for RBAC tests: e2e-<role>@example.com with a fresh random password (returned once).
  if (a === "staff") { const role = str(body.role, 10); if (!["editor", "support"].includes(role)) return fail("role"); const email = `e2e-${role}@example.com`; const password = randomBytes(12).toString("hex");
    const u = await db.user.upsert({ where: { email }, update: { role: role as never, passwordHash: await bcrypt.hash(password, 10), disabled: false, emailVerified: new Date() } as never, create: { email, name: `E2E ${role}`, role: role as never, passwordHash: await bcrypt.hash(password, 10), emailVerified: new Date() } as never }); forgetRole(u.id); return ok({ email, password }); }
  if (a === "unstaff") { await db.user.deleteMany({ where: { email: { in: ["e2e-editor@example.com", "e2e-support@example.com"] } } }); return ok(); }
  return fail("Unknown");
});
