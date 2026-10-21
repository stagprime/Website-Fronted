import "../globals.css";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { staff, can } from "@/lib/rbac";
import { NAV } from "@/lib/admin-nav";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/Shell";
export const metadata = { title: { default: "Admin", template: "%s · Stag Prime Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
/** Admin shell. Every page is gated here (any staff role) AND per page/API by permission (lib/rbac.ts). See ADMIN-NOTES.md. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = (await headers()).get("x-sp-path") || "/admin";
  const who = await staff(); if (!who) redirect(`/en/login?next=${encodeURIComponent(path.startsWith("/admin") ? path : "/admin")}`);
  const item = NAV.flatMap(g => g.items).filter(i => path === i.href || path.startsWith(i.href + "/")).sort((a, b) => b.href.length - a.href.length)[0];
  const denied = item && !can(who.role, item.perm);
  const nav = NAV.map(g => ({ group: g.group, items: g.items.filter(i => can(who.role, i.perm)) })).filter(g => g.items.length);
  const [chats, orders, forms] = await Promise.all([
    can(who.role, "chat.use") ? db.chatConversation.count({ where: { status: "human" } }).catch(() => 0) : 0,
    can(who.role, "orders.view") ? db.order.count({ where: { status: { in: ["pending", "in_progress", "revision"] as never[] } } }).catch(() => 0) : 0,
    can(who.role, "forms.view") ? db.formSubmission.count({ where: { status: "new" } }).catch(() => 0) : 0,
  ]);
  return (
    <html lang="en"><body className="bg-navy-950 text-slate-200 font-body antialiased">
      <AdminShell nav={nav} who={{ email: who.email, name: who.name, role: who.role }} badges={{ "/admin/chat": chats, "/admin/orders": orders, "/admin/forms": forms }}>{denied ? <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-navy-900 p-8 text-center"><p className="text-4xl">🔒</p><h1 className="mt-3 text-xl font-bold text-white">No access</h1><p className="mt-2 text-sm text-slate-400">Your role (<b>{who.role}</b>) can’t open {item.label}. Ask an owner to change your role in Team &amp; roles.</p><a href="/admin" className="mt-4 inline-block text-sm text-sky-brand">← Mission Control</a></div> : children}</AdminShell>
    </body></html>
  );
}
