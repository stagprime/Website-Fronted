import { db } from "@/lib/db";
export default async function AdminHome() {
  const [open, human, orders, pending, redirects] = await Promise.all([db.chatConversation.count({ where: { status: "open" } }), db.chatConversation.count({ where: { status: "human" } }), db.order.count(), db.order.count({ where: { status: "pending" as never } }), db.redirect.count()]);
  const card = (n: number, l: string, h: string) => <a href={h} className="rounded-2xl border border-white/10 bg-navy-900 p-6 hover:border-sky-500"><p className="text-3xl font-bold text-white">{n}</p><p className="text-sm text-slate-400">{l}</p></a>;
  return (<><h1 className="text-2xl font-bold text-white">Overview</h1>
    <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">{card(human, "Chats waiting for a person", "/admin/chat")}{card(open, "Open chats (AI)", "/admin/chat")}{card(orders, "Orders", "/admin")}{card(pending, "Orders pending requirements", "/admin")}{card(redirects, "Redirects", "/admin/seo#redirects")}</div>
    <p className="mt-8 text-sm text-slate-400">Orders, users, blog and store management are planned for the next admin phase — see ADMIN-NOTES.md.</p></>);
}
