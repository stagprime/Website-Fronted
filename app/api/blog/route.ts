import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { locales, SITE } from "@/lib/i18n";
import { revalidatePath } from "next/cache";
export const runtime = "nodejs";
// Publishing API. Auth: "Authorization: Bearer $BLOG_API_TOKEN".
// GET  /api/blog?locale=en            → list posts
// POST /api/blog {slug,locale,title,description,category,service?,keyword?,body(markdown),faq?[[q,a]],image?,status:draft|scheduled|published,publishAt?}  → create or update (upsert on slug+locale)
// DELETE /api/blog?slug=..&locale=..  → unpublish (sets status=draft)
function authed(req: Request) { const t = process.env.BLOG_API_TOKEN; const h = req.headers.get("authorization") || ""; if (!t || t.length < 24) return false; const a = Buffer.from(h.replace(/^Bearer\s+/i, "")), b = Buffer.from(t); return a.length === b.length && crypto.timingSafeEqual(a, b); }
const E = (error: string, status = 422) => NextResponse.json({ ok: false, error }, { status });
async function indexNow(url: string) { const k = process.env.INDEXNOW_KEY; if (!k) return; try { await fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ host: new URL(SITE).host, key: k, keyLocation: `${SITE}/${k}.txt`, urlList: [url] }) }); } catch { /* ignore */ } }
export async function GET(req: Request) {
  if (!authed(req)) return E("Unauthorized", 401);
  const l = new URL(req.url).searchParams.get("locale") || undefined;
  return NextResponse.json({ ok: true, posts: await db.blogPost.findMany({ where: l ? { locale: l } : {}, orderBy: { updatedAt: "desc" }, select: { id: true, slug: true, locale: true, title: true, status: true, publishAt: true, updatedAt: true } }) });
}
export async function POST(req: Request) {
  if (!authed(req)) return E("Unauthorized", 401);
  let b: Record<string, unknown>; try { b = await req.json(); } catch { return E("Invalid JSON", 400); }
  const str = (k: string, max: number, req = false) => { const v = typeof b[k] === "string" ? (b[k] as string).trim() : ""; if (req && !v) throw new Error(`Missing ${k}`); if (v.length > max) throw new Error(`${k} too long (max ${max})`); return v || null; };
  try {
    const slug = str("slug", 120, true)!; if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return E("slug must be lowercase-kebab-case");
    const locale = (str("locale", 5) || "en"); if (!(locales as readonly string[]).includes(locale)) return E("Unknown locale");
    const status = str("status", 12) || "draft"; if (!["draft", "scheduled", "published"].includes(status)) return E("status must be draft|scheduled|published");
    const publishAt = b.publishAt ? new Date(String(b.publishAt)) : status === "published" ? new Date() : null; if (publishAt && isNaN(+publishAt)) return E("publishAt must be ISO 8601");
    if (status === "scheduled" && !publishAt) return E("scheduled posts need publishAt");
    const title = str("title", 70, true)!, description = str("description", 170, true)!;
    const faq = Array.isArray(b.faq) ? (b.faq as unknown[]).filter(x => Array.isArray(x) && x.length === 2).slice(0, 20) : null;
    const data = { title, description, category: str("category", 60, true)!, service: str("service", 60), keyword: str("keyword", 120), body: str("body", 60000, true)!, image: str("image", 300), faq: faq ? (JSON.stringify(faq) as never) : undefined, status, publishAt };
    const post = await db.blogPost.upsert({ where: { slug_locale: { slug, locale } }, create: { slug, locale, ...data }, update: data });
    revalidatePath(`/${locale}/blog`); revalidatePath(`/${locale}/blog/${slug}`);
    const url = `${SITE}/${locale}/blog/${slug}`; if (status === "published") await indexNow(url);
    return NextResponse.json({ ok: true, id: post.id, url, status: post.status, publishAt: post.publishAt, warnings: [title.length > 60 && "title over 60 chars", description.length > 155 && "description over 155 chars", !data.keyword && "no target keyword"].filter(Boolean) });
  } catch (e) { return E((e as Error).message); }
}
export async function DELETE(req: Request) {
  if (!authed(req)) return E("Unauthorized", 401);
  const u = new URL(req.url).searchParams; const slug = u.get("slug") || "", locale = u.get("locale") || "en";
  await db.blogPost.updateMany({ where: { slug, locale }, data: { status: "draft" } }); revalidatePath(`/${locale}/blog/${slug}`); return NextResponse.json({ ok: true });
}
