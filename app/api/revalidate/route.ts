import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { sameSecret } from "@/lib/hook-sig";
import { invalidateSettings } from "@/lib/settings";
import { bumpRedirects } from "@/lib/redirects";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/**
 * Revalidate webhook for the separate CMS app. POST with `Authorization: Bearer <REVALIDATE_SECRET>` and
 * {tags?: string[], paths?: [path, "page"|"layout"?][]}. Unauthenticated or malformed calls get 401/400 and change nothing.
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || ""; if (!auth.startsWith("Bearer ") || !sameSecret(auth.slice(7))) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json().catch(() => null) as { tags?: unknown; paths?: unknown } | null; if (!b) return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  const tags = (Array.isArray(b.tags) ? b.tags : []).filter((t): t is string => typeof t === "string" && /^[\w:./-]{1,80}$/.test(t)).slice(0, 50);
  const paths = (Array.isArray(b.paths) ? b.paths : []).map(p => Array.isArray(p) ? p : [p]).filter(p => typeof p[0] === "string" && p[0].startsWith("/") && p[0].length < 300).slice(0, 100) as [string, string?][];
  for (const t of tags) { if (t === "settings" || t.startsWith("content:")) invalidateSettings(t.startsWith("content:") ? t.slice(8) : undefined); else if (t === "redirects") bumpRedirects(); else revalidateTag(t); }
  // A path without a type is a literal URL (/en/blog/x). Passing "page" would make Next read it as a route pattern (/[locale]/blog/[slug]) and match nothing.
  for (const [p, type] of paths) { if (type === "layout" || type === "page") revalidatePath(p, type); else revalidatePath(p); }
  return NextResponse.json({ ok: true, tags: tags.length, paths: paths.length });
}
export function GET() { return new NextResponse("Method Not Allowed", { status: 405 }); }
