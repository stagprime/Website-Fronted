import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { route, ok, fail } from "@/lib/api";
import { can } from "@/lib/rbac";
import { DEFAULTS, SETTING_KEYS, getSettings, invalidateSettings, type SettingKey } from "@/lib/settings";
import { SETTING_META } from "@/lib/settings-meta";
import { audit, snapshot, diffOf } from "@/lib/audit";
export const runtime = "nodejs";
/** GET ?key= : effective value, default, overridden flag, revisions. GET (no key): all effective settings. */
export const GET = route("dashboard.view", async ({ url, who }) => {
  const key = url.searchParams.get("key") as SettingKey | null; const all = await getSettings();
  if (!key) { const rows = await db.setting.findMany({ select: { key: true } }); return ok({ settings: all, overridden: rows.map(r => r.key) }); }
  if (!SETTING_KEYS.includes(key)) return fail("Unknown key", 404);
  const row = await db.setting.findUnique({ where: { key } });
  const revisions = await db.revision.findMany({ where: { entity: "setting", entityId: key }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, actor: true, createdAt: true } });
  return ok({ key, value: all[key], default: DEFAULTS[key], overridden: !!row, canEdit: can(who.role, SETTING_META[key].perm), meta: SETTING_META[key], revisions });
});
/** PUT {key, value} save · {key, reset:true} back to code default · {key, revision} restore a revision. */
export const PUT = route("dashboard.view", async ({ body, who, ip }) => {
  const key = String(body.key || "") as SettingKey;
  if (!SETTING_KEYS.includes(key)) return fail(`Unknown key. Allowed: ${SETTING_KEYS.join(", ")}`);
  if (!can(who.role, SETTING_META[key].perm)) return fail("Your role cannot edit this setting.", 403);
  const before = (await getSettings())[key];
  const prev = await db.setting.findUnique({ where: { key } });
  let value: unknown;
  if (body.reset) { await db.setting.delete({ where: { key } }).catch(() => null); value = DEFAULTS[key]; }
  else {
    if (body.revision) { const r = await db.revision.findUnique({ where: { id: String(body.revision) } }); if (!r || r.entity !== "setting" || r.entityId !== key) return fail("Revision not found", 404); value = JSON.parse(r.data); }
    else value = body.value;
    const def = DEFAULTS[key];
    if (Array.isArray(def) !== Array.isArray(value) || typeof value !== "object" || value === null) return fail("Value shape must match the default (array vs object).");
    if (key === "theme" && (value as Record<string, unknown>).customCss && (value as Record<string, unknown>).customCss !== (before as Record<string, unknown>).customCss && !can(who.role, "html.edit")) return fail("Only admins can change custom CSS.", 403);
    if (key === "orgSchema") { const ex = String((value as Record<string, unknown>).extra || "").trim(); if (ex) { try { const j = JSON.parse(ex); if (typeof j !== "object" || Array.isArray(j)) throw 0; } catch { return fail("Extra JSON-LD must be a JSON object."); } } }
    const json = JSON.stringify(value); if (json.length > 2_000_000) return fail("Value too large");
    await db.setting.upsert({ where: { key }, create: { key, value: json }, update: { value: json } });
  }
  if (prev) await snapshot("setting", key, JSON.parse(prev.value), who.email);
  await audit(who, body.reset ? "setting.reset" : body.revision ? "setting.restore" : "setting.update", "setting", key, diffOf(before, value), ip);
  invalidateSettings(key); revalidatePath("/", "layout");
  return ok({ value });
});
