import { db } from "@/lib/db";
import { route, ok, fail, str } from "@/lib/api";
import { newSecret, otpauth, verifyTotp } from "@/lib/totp";
import { audit } from "@/lib/audit";
export const runtime = "nodejs";
/** Optional TOTP 2FA for the signed-in staff member. GET status · POST {action:"setup"} → secret · {action:"enable", code} · {action:"disable", code}. */
export const GET = route("dashboard.view", async ({ who }) => { const u = await db.user.findUnique({ where: { id: who.id }, select: { totpEnabled: true, lastLoginAt: true, email: true } }); return ok({ enabled: !!u?.totpEnabled, lastLoginAt: u?.lastLoginAt }); });
const pending = new Map<string, string>();
export const POST = route("dashboard.view", async ({ body, who, ip }) => {
  const u = await db.user.findUnique({ where: { id: who.id } }); if (!u) return fail("Not found", 404);
  const action = str(body.action, 10); const code = str(body.code, 10);
  if (action === "setup") { const s = newSecret(); pending.set(who.id, s); return ok({ secret: s, uri: otpauth(s, u.email) }); }
  if (action === "enable") { const s = pending.get(who.id); if (!s) return fail("Start setup first"); if (!verifyTotp(s, code)) return fail("Code is not valid — check your phone's time and try again"); await db.user.update({ where: { id: who.id }, data: { totpSecret: s, totpEnabled: true } }); pending.delete(who.id); await audit(who, "security.2fa_on", "user", who.id, null, ip); return ok(); }
  if (action === "disable") { if (!u.totpSecret || !verifyTotp(u.totpSecret, code)) return fail("Enter a current code to turn 2FA off"); await db.user.update({ where: { id: who.id }, data: { totpSecret: null, totpEnabled: false } }); await audit(who, "security.2fa_off", "user", who.id, null, ip); return ok(); }
  return fail("Unknown action");
});
