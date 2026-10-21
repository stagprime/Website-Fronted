import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePerm, deny } from "@/lib/admin";
import { sameOrigin } from "@/lib/guard";
import { bumpRedirects } from "@/lib/redirects";
export const runtime = "nodejs";
/** Redirect manager. Applied by app/[locale]/[...rest] for any URL that doesn't match a real page. */
export async function GET() { if (!(await requirePerm("seo.edit"))) return deny(); return NextResponse.json({ ok: true, redirects: await db.redirect.findMany({ orderBy: { createdAt: "desc" } }) }); }
export async function POST(req: Request) {
  if (!(await requirePerm("seo.edit")) || !sameOrigin(req)) return deny(); const b = await req.json().catch(() => ({}));
  if (b.action === "delete") { await db.redirect.delete({ where: { id: String(b.id) } }).catch(() => null); bumpRedirects(); return NextResponse.json({ ok: true }); }
  const from = String(b.from || "").trim(), to = String(b.to || "").trim(), code = [301, 302, 410].includes(Number(b.code)) ? Number(b.code) : 301;
  if (!from.startsWith("/") || /^\/(api|_next|admin)\b/.test(from)) return NextResponse.json({ ok: false, error: "“From” must be a site path like /old-page (not /api, /_next or /admin)." }, { status: 422 });
  if (code !== 410 && !(to.startsWith("/") || /^https?:\/\//.test(to))) return NextResponse.json({ ok: false, error: "“To” must be a path or full URL." }, { status: 422 });
  if (from === to) return NextResponse.json({ ok: false, error: "From and To are the same." }, { status: 422 });
  const r = await db.redirect.upsert({ where: { from }, create: { from, to, code }, update: { to, code } }); bumpRedirects(); return NextResponse.json({ ok: true, redirect: r });
}
