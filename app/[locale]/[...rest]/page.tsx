import { notFound } from "next/navigation";
import { db, dbReady } from "@/lib/db";
import { loadLoc } from "@/lib/loc";
import { pageDoc, pageTitle, txt } from "@/lib/cms/page";
import { seoMeta } from "@/lib/seo";
import Blocks from "@/components/Blocks";
export const dynamic = "force-dynamic";
/**
 * Unmatched URL → a custom page built in Admin → Pages (key "/<slug>"), else the branded 404 (logged for Admin → SEO → 404 log).
 * Redirects and 410 Gone are handled earlier in middleware.ts.
 */
type P = { params: Promise<{ locale: string; rest: string[] }> };
export async function generateMetadata({ params }: P) {
  await loadLoc(params); const { rest } = await params; const key = "/" + rest.join("/");
  const doc = pageDoc(key); if (!doc) return { robots: { index: false } };
  const hero = doc.find(s => s.type === "hero"); return seoMeta(key, pageTitle(key) || key, hero ? txt(hero, "sub", "") : "");
}
export default async function Rest({ params }: P) {
  await loadLoc(params); const { locale, rest } = await params; const key = "/" + rest.join("/");
  const doc = pageDoc(key); if (doc) return <Blocks sections={doc} />;
  if (dbReady()) { const path = `/${locale}${key}`.slice(0, 300); await db.notFoundLog.upsert({ where: { path }, create: { path }, update: { hits: { increment: 1 } } }).catch(() => null); }
  notFound();
}
