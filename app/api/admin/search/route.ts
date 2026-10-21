import { db } from "@/lib/db";
import { route, ok } from "@/lib/api";
import { can } from "@/lib/rbac";
export const runtime = "nodejs";
export const GET = route("dashboard.view", async ({ url, who }) => {
  const q = (url.searchParams.get("q") || "").trim().slice(0, 80); if (q.length < 2) return ok({ hits: [] });
  const c = { contains: q }; const hits: { label: string; sub?: string; href: string; kind: string }[] = [];
  const jobs: Promise<void>[] = [];
  if (can(who.role, "orders.view")) jobs.push(db.order.findMany({ where: { OR: [{ id: { startsWith: q } }, { email: c }, { title: c }] }, take: 6, orderBy: { createdAt: "desc" } }).then(r => { r.forEach(o => hits.push({ kind: "Order", label: o.title, sub: `${o.email} · ${o.status}`, href: `/admin/orders/${o.id}` })); }));
  if (can(who.role, "customers.view")) jobs.push(db.user.findMany({ where: { OR: [{ email: c }, { name: c }] }, take: 6 }).then(r => { r.forEach(u => hits.push({ kind: "Customer", label: u.name || u.email, sub: u.email, href: `/admin/customers/${u.id}` })); }));
  if (can(who.role, "content.edit")) {
    jobs.push(db.blogPost.findMany({ where: { OR: [{ title: c }, { slug: c }] }, take: 6 }).then(r => { r.forEach(p => hits.push({ kind: "Post", label: p.title, sub: `${p.locale} · ${p.status}`, href: `/admin/blog/edit?id=${p.id}` })); }));
    jobs.push(db.page.findMany({ where: { OR: [{ title: c }, { key: c }] }, take: 6 }).then(r => { r.forEach(p => hits.push({ kind: "Page", label: p.title, sub: p.key, href: `/admin/pages/edit?key=${encodeURIComponent(p.key)}` })); }));
    jobs.push(db.media.findMany({ where: { name: c }, take: 4 }).then(r => { r.forEach(m => hits.push({ kind: "Media", label: m.name, sub: m.mime, href: `/admin/media?q=${encodeURIComponent(m.name)}` })); }));
  }
  await Promise.all(jobs.map(j => j.catch(() => {})));
  return ok({ hits });
});
