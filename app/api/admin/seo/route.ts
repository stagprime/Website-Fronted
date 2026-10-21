import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin, requireStaff, deny } from "@/lib/admin";
import { sameOrigin } from "@/lib/guard";
import { analyze } from "@/lib/seo-analyze";
import { allRoutes } from "@/lib/routes";
import { locales } from "@/lib/i18n";
export const runtime = "nodejs";
/** GET ?locale= → all routes with their saved SeoRecord. */
export async function GET(req: Request) {
  if (!(await requireStaff())) return deny(); const locale = new URL(req.url).searchParams.get("locale") || "en";
  const recs = await db.seoRecord.findMany({ where: { locale } }); const m = new Map(recs.map(r => [r.path, r]));
  return NextResponse.json({ ok: true, pages: allRoutes.map(p => ({ path: p || "/", record: m.get(p || "/") || null })) });
}
/** POST {action:"analyze", path, locale, focusKw?} | {action:"save", path, locale, ...fields} | {action:"reset", path, locale} */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return deny(); const b = await req.json().catch(() => ({}));
  const path = String(b.path || "/"), locale = (locales as readonly string[]).includes(b.locale) ? b.locale : "en";
  const url = `${process.env.INTERNAL_URL || `http://127.0.0.1:${process.env.PORT || 3000}`}/${locale}${path === "/" ? "" : path}`;
  if (b.action === "analyze") {
    if (!(await requireStaff())) return deny(); const res = await analyze(url, b.focusKw);
    await db.seoRecord.upsert({ where: { path_locale: { path, locale } }, create: { path, locale, score: res.score }, update: { score: res.score } }); return NextResponse.json({ ok: true, ...res });
  }
  if (!(await requireAdmin())) return deny();
  if (b.action === "reset") { await db.seoRecord.deleteMany({ where: { path, locale } }); revalidatePath(`/${locale}${path === "/" ? "" : path}`); return NextResponse.json({ ok: true }); }
  if (b.action === "save") {
    const s = (k: string, max: number) => (typeof b[k] === "string" && b[k].trim() ? b[k].trim().slice(0, max) : null);
    const data = { title: s("title", 70), description: s("description", 170), focusKw: s("focusKw", 120), secondaryKws: s("secondaryKws", 400), canonical: s("canonical", 300), ogTitle: s("ogTitle", 100), ogDesc: s("ogDesc", 200), ogImage: s("ogImage", 300), robotsIndex: b.robotsIndex !== false, robotsFollow: b.robotsFollow !== false };
    await db.seoRecord.upsert({ where: { path_locale: { path, locale } }, create: { path, locale, ...data }, update: data });
    revalidatePath(`/${locale}${path === "/" ? "" : path}`); return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
