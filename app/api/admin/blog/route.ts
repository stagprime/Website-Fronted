import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { route, ok, fail, str, need } from "@/lib/api";
import { posts } from "@/content/posts";
import { locales } from "@/lib/i18n";
import { audit, snapshot } from "@/lib/audit";
import { aiComplete, aiKey, langName } from "@/lib/ai";
export const runtime = "nodejs";
/** GET list (code posts + DB posts/overrides) or ?slug=&locale= one editable post. */
export const GET = route("content.edit", async ({ url }) => {
  const slug = url.searchParams.get("slug"); const locale = url.searchParams.get("locale") || "en";
  if (slug) {
    const row = await db.blogPost.findUnique({ where: { slug_locale: { slug, locale } } });
    const code = posts.find(p => p.slug === slug);
    const langs = (await db.blogPost.findMany({ where: { slug }, select: { locale: true, status: true } }));
    if (row) return ok({ post: { ...row, faq: typeof row.faq === "string" ? JSON.parse(row.faq) : row.faq ?? [] }, source: "db", langs, ai: aiKey() });
    if (code) return ok({ post: { slug, locale, title: code.t, description: code.d, category: code.cat, service: code.svc, keyword: code.kw, body: code.body, faq: code.faq || [], image: "", status: "published", publishAt: null }, source: "code", langs, ai: aiKey() });
    return ok({ post: { slug, locale, title: "", description: "", category: "", service: "", keyword: "", body: "", faq: [], image: "", status: "draft", publishAt: null }, source: "new", langs, ai: aiKey() });
  }
  const db_ = await db.blogPost.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, slug: true, locale: true, title: true, status: true, publishAt: true, updatedAt: true, category: true } });
  const bySlug = new Map<string, typeof db_>(); for (const r of db_) bySlug.set(r.slug, [...(bySlug.get(r.slug) || []), r]);
  const list = [...new Set([...db_.map(r => r.slug), ...posts.map(p => p.slug)])].map(s => { const c = posts.find(p => p.slug === s); const rows = bySlug.get(s) || []; const en = rows.find(r => r.locale === "en");
    return { id: s, slug: s, title: en?.title || c?.t || rows[0]?.title || s, category: en?.category || c?.cat || rows[0]?.category || "", status: en?.status || (c ? "published" : rows[0]?.status || "draft"), source: rows.length ? (c ? "override" : "db") : "code", locales: rows.map(r => r.locale), publishAt: en?.publishAt || null, updatedAt: rows[0]?.updatedAt || null }; });
  return ok({ posts: list });
});
/** PUT {slug, locale, title, description, category, service, keyword, body, faq, image, status, publishAt} */
export const PUT = route("content.edit", async ({ body: b, who, ip }) => {
  const slug = str(b.slug, 120); need(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug), "Slug must be lowercase-kebab-case");
  const locale = str(b.locale, 5) || "en"; need((locales as readonly string[]).includes(locale), "Unknown locale");
  const status = str(b.status, 12) || "draft"; need(["draft", "scheduled", "published"].includes(status), "Invalid status");
  const publishAt = b.publishAt ? new Date(String(b.publishAt)) : status === "published" ? new Date() : null; need(!publishAt || !isNaN(+publishAt), "Invalid publish date");
  need(status !== "scheduled" || publishAt, "Scheduled posts need a publish date");
  const title = str(b.title, 120), description = str(b.description, 300), body = typeof b.body === "string" ? b.body.slice(0, 80000) : "";
  need(title && description && body, "Title, description and body are required");
  const faq = Array.isArray(b.faq) ? (b.faq as unknown[]).filter((x): x is string[] => Array.isArray(x) && x.length === 2 && !!x[0]).slice(0, 20) : [];
  const data = { title, description, category: str(b.category, 60) || "Guides", service: str(b.service, 60) || null, keyword: str(b.keyword, 120) || null, body, image: str(b.image, 300) || null, faq: JSON.stringify(faq) as never, status, publishAt };
  const prev = await db.blogPost.findUnique({ where: { slug_locale: { slug, locale } } }); if (prev) await snapshot("blog", `${slug}:${locale}`, prev, who.email);
  const p = await db.blogPost.upsert({ where: { slug_locale: { slug, locale } }, create: { slug, locale, ...data }, update: data });
  revalidatePath(`/${locale}/blog`); revalidatePath(`/${locale}/blog/${slug}`); revalidatePath("/sitemap.xml");
  await audit(who, prev ? "blog.update" : "blog.create", "blog", `${slug}:${locale}`, { title, status }, ip);
  const kw = (data.keyword || "").toLowerCase(); const words = body.split(/\s+/).length;
  const warnings = [title.length > 60 && "Title is over 60 characters", description.length > 155 && "Description is over 155 characters", description.length < 70 && "Description is short (<70)", !kw && "No focus keyword", kw && !title.toLowerCase().includes(kw) && "Focus keyword not in title", kw && !body.slice(0, 600).toLowerCase().includes(kw) && "Focus keyword not in the first paragraph", words < 600 && `Only ${words} words`, !/\]\(\//.test(body) && "No internal links", !data.image && "No featured image"].filter(Boolean);
  return ok({ id: p.id, warnings });
});
export const DELETE = route("content.edit", async ({ url, who, ip }) => {
  const slug = url.searchParams.get("slug") || "", locale = url.searchParams.get("locale") || "en";
  const p = await db.blogPost.findUnique({ where: { slug_locale: { slug, locale } } }); if (!p) return fail("Not found (code-defined posts can only be overridden)", 404);
  await snapshot("blog", `${slug}:${locale}`, p, who.email); await db.blogPost.delete({ where: { id: p.id } });
  revalidatePath(`/${locale}/blog`); revalidatePath(`/${locale}/blog/${slug}`); await audit(who, "blog.delete", "blog", `${slug}:${locale}`, null, ip); return ok();
});
/** POST {action:"translate", slug, from, to} AI draft translation (saved as draft) — off without OPENAI_API_KEY. */
export const POST = route("content.edit", async ({ body: b, who, ip }) => {
  if (!aiKey()) return fail("AI is off — set OPENAI_API_KEY.", 409);
  const slug = str(b.slug, 120), to = str(b.to, 5); need((locales as readonly string[]).includes(to) && to !== "en", "Pick a target locale");
  const src = await db.blogPost.findUnique({ where: { slug_locale: { slug, locale: "en" } } }); const code = posts.find(p => p.slug === slug);
  const en = src ? { t: src.title, d: src.description, body: src.body } : code ? { t: code.t, d: code.d, body: code.body } : null; need(en, "English post not found");
  const tr = await aiComplete([{ role: "system", content: `Translate this blog post from English to ${langName(to)}. Output JSON {"t":title,"d":description,"body":markdown}. Keep markdown, links, numbers and brand names.` }, { role: "user", content: JSON.stringify(en) }], { max: 6000 });
  if (!tr) return fail("AI did not return a translation", 502);
  let j: { t: string; d: string; body: string }; try { j = JSON.parse(tr.replace(/^```(json)?|```$/g, "")); } catch { return fail("AI output was not valid JSON — try again", 502); }
  await db.blogPost.upsert({ where: { slug_locale: { slug, locale: to } }, create: { slug, locale: to, title: j.t.slice(0, 120), description: j.d.slice(0, 300), body: j.body, category: src?.category || code?.cat || "Guides", status: "draft" }, update: { title: j.t.slice(0, 120), description: j.d.slice(0, 300), body: j.body, status: "draft" } });
  await audit(who, "blog.ai_translate", "blog", `${slug}:${to}`, null, ip); return ok();
});
