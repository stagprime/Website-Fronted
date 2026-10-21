import bcrypt from "bcryptjs"; import crypto from "crypto";
import { db } from "@/lib/db";
import { route, ok, fail, str, need } from "@/lib/api";
import { forgetRole, normRole, PERMS } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { sendToken } from "@/lib/tokens";
export const runtime = "nodejs";
const ROLES = ["owner", "admin", "editor", "support", "customer"];
export const GET = route("users.manage", async () => {
  const team = await db.user.findMany({ where: { role: { in: ["owner", "admin", "editor", "support", "staff"] as never[] } }, orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true, disabled: true, totpEnabled: true, lastLoginAt: true, createdAt: true } });
  return ok({ team: team.map(t => ({ ...t, role: normRole(t.role) })), roles: ROLES, perms: PERMS });
});
/** POST {email, name, role} invite/promote: existing user → role change; new → account + password-reset link. */
export const POST = route("users.manage", async ({ body, who, ip }) => {
  const email = str(body.email, 200).toLowerCase(); need(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email), "Valid email required");
  const role = str(body.role, 20); need(ROLES.includes(role) && role !== "customer", "Pick a staff role");
  const ex = await db.user.findUnique({ where: { email } });
  if (ex) { await db.user.update({ where: { id: ex.id }, data: { role: role as never, disabled: false } }); forgetRole(ex.id); }
  else { await db.user.create({ data: { email, name: str(body.name, 120) || null, role: role as never, emailVerified: new Date(), passwordHash: await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10) } }); await sendToken(email, "reset").catch(() => null); }
  await audit(who, "team.invite", "user", email, { role, existing: !!ex }, ip); return ok({ invited: !ex });
});
/** PUT {id, role?, disabled?} — the last active owner can't be demoted or disabled. */
export const PUT = route("users.manage", async ({ body, who, ip }) => {
  const id = str(body.id, 40); const u = await db.user.findUnique({ where: { id } }); if (!u) return fail("Not found", 404);
  const role = body.role ? str(body.role, 20) : undefined; if (role) need(ROLES.includes(role), "Invalid role");
  const leavingOwner = normRole(u.role) === "owner" && ((role && role !== "owner") || body.disabled === true);
  if (leavingOwner && (await db.user.count({ where: { role: "owner" as never, disabled: false } })) <= 1) return fail("There must always be at least one active owner.", 409);
  if (id === who.id && body.disabled === true) return fail("You can't disable yourself.", 409);
  const data: Record<string, unknown> = {}; if (role) data.role = role; if (typeof body.disabled === "boolean") data.disabled = body.disabled; if (body.reset2fa) { data.totpEnabled = false; data.totpSecret = null; }
  await db.user.update({ where: { id }, data }); forgetRole(id); await audit(who, "team.update", "user", id, { from: u.role, ...data, totpSecret: undefined }, ip); return ok();
});
