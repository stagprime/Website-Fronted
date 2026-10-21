import { notFound, redirect, permanentRedirect } from "next/navigation";
import { db, dbReady } from "@/lib/db";
export const dynamic = "force-dynamic";
/** Unmatched URL → check the redirect manager (/admin/seo → Redirects), else branded 404. Gone (410) entries render the 404 page. */
export default async function Rest({ params }: { params: Promise<{ locale: string; rest: string[] }> }) {
  const { locale, rest } = await params; const p = "/" + rest.join("/");
  if (dbReady()) {
    const r = await db.redirect.findFirst({ where: { from: { in: [`/${locale}${p}`, p] } } }).catch(() => null);
    if (r && r.code !== 410) { db.redirect.update({ where: { id: r.id }, data: { hits: { increment: 1 } } }).catch(() => {}); const to = r.to.startsWith("/") && !/^\/[a-z]{2}(\/|$)/.test(r.to) ? `/${locale}${r.to}` : r.to; if (r.code === 302) redirect(to); permanentRedirect(to); }
  }
  notFound();
}
