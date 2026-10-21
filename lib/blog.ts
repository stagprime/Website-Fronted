import { posts, type Post } from "@/content/posts";
import { db, dbReady } from "./db";
// Published DB posts (from /api/blog) override/extend code-defined posts. Scheduled posts go live at publishAt.
export async function dbPosts(locale = "en"): Promise<Post[]> {
  if (!dbReady()) return [];
  try {
    const rows = await db.blogPost.findMany({ where: { locale: { in: [locale, "en"] }, OR: [{ status: "published" }, { status: "scheduled", publishAt: { lte: new Date() } }] }, orderBy: { publishAt: "desc" } });
    const m = new Map<string, Post>();
    for (const r of rows) if (!m.has(r.slug) || r.locale === locale) m.set(r.slug, { slug: r.slug, cat: r.category, svc: r.service || "", kw: r.keyword || "", t: r.title, d: r.description, body: r.body, faq: (typeof r.faq === "string" ? JSON.parse(r.faq) : r.faq) as string[][] | undefined, date: (r.publishAt || r.createdAt).toISOString().slice(0, 10) });
    return [...m.values()];
  } catch { return []; }
}
export async function allPosts(locale = "en") { const d = await dbPosts(locale); const s = new Set(d.map(p => p.slug)); return [...d, ...posts.filter(p => !s.has(p.slug))]; }
import { postTr } from "./posti18n";
/** Returns the post in `locale` when a translation exists (translated: true), else the English post (translated: false). */
export async function getPost(slug: string, locale = "en"): Promise<(Post & { translated: boolean; machine?: boolean }) | undefined> {
  const p = (await dbPosts(locale)).find(x => x.slug === slug) || posts.find(x => x.slug === slug); if (!p) return undefined;
  const tr = postTr(locale, slug); return tr ? { ...p, t: tr.t, d: tr.d, body: tr.body, faq: tr.faq || p.faq, translated: true, machine: tr.machine } : { ...p, translated: locale === "en" };
}
