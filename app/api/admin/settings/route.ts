import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin, requireStaff, deny } from "@/lib/admin";
import { sameOrigin } from "@/lib/guard";
import { DEFAULTS, SETTING_KEYS, getSettings, invalidateSettings } from "@/lib/settings";
export const runtime = "nodejs";
/** GET: effective settings + defaults + which keys are overridden. PUT {key, value}: save override. PUT {key, reset:true}: back to default. */
export async function GET() {
  if (!(await requireStaff())) return deny();
  const rows = await db.setting.findMany({ select: { key: true } });
  return NextResponse.json({ ok: true, settings: await getSettings(), defaults: DEFAULTS, overridden: rows.map((r) => r.key) });
}
export async function PUT(req: Request) {
  if (!(await requireAdmin()) || !sameOrigin(req)) return deny();
  const b = await req.json().catch(() => ({}));
  const key = String(b.key || "");
  if (!SETTING_KEYS.includes(key as never)) return NextResponse.json({ ok: false, error: `Unknown key. Allowed: ${SETTING_KEYS.join(", ")}` }, { status: 422 });
  if (b.reset) await db.setting.delete({ where: { key } }).catch(() => null);
  else {
    const def = DEFAULTS[key as keyof typeof DEFAULTS];
    if (Array.isArray(def) !== Array.isArray(b.value) || typeof b.value !== "object" || b.value === null) return NextResponse.json({ ok: false, error: "Value shape must match the default (array vs object)." }, { status: 422 });
    const value = JSON.stringify(b.value);
    await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
  }
  invalidateSettings(key); revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
