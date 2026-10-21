import "../globals.css";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin";
export const metadata = { title: "Stag Prime Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
/** Phase-2 admin shell. Every page below is staff/admin-only (checked here AND in each /api/admin route). See ADMIN-NOTES.md. */
const NAV: [string, string][] = [["/admin", "Overview"], ["/admin/chat", "Live chat"], ["/admin/seo", "SEO & redirects"]];
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await requireStaff(); if (!s) redirect("/en/login");
  return (
    <html lang="en"><body className="bg-navy-950 text-slate-200 font-sans">
      <div className="min-h-screen grid md:grid-cols-[14rem_1fr]">
        <aside className="border-e border-white/10 bg-navy-900 p-5"><a href="/admin" className="flex items-center gap-2"><img src="/emblem.svg" alt="" className="h-8" /><span className="font-bold text-white">Admin</span></a>
          <nav aria-label="Admin" className="mt-8 grid gap-1">{NAV.map(([h, n]) => <a key={h} href={h} className="rounded-lg px-3 py-2 text-sm hover:bg-white/5 hover:text-white">{n}</a>)}<a href="/en" className="mt-6 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white">← Website</a></nav>
          <p className="mt-8 text-xs text-slate-500">{s.user.email}<br />role: {s.user.role}</p></aside>
        <main className="p-5 sm:p-8 min-w-0">{children}</main>
      </div>
    </body></html>
  );
}
