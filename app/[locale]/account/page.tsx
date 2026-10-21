import { redirect } from "next/navigation";
import { useParamsLoc, L, T, getLoc } from "@/lib/loc";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { wrap } from "@/components/ui";
import { ProfileForm } from "@/components/AccountUI";
import { acctT, stepLabel } from "@/lib/acct";
import { localeNames } from "@/lib/i18n";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return { title: "My account", robots: { index: false, follow: false } }; }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params);
  const s = await auth(); if (!s?.user) redirect(L("/login"));
  const [u, orders] = await Promise.all([db.user.findUnique({ where: { id: s.user.id } }), db.order.findMany({ where: { OR: [{ userId: s.user.id }, { email: s.user.email || "-" }] }, orderBy: { createdAt: "desc" }, include: { files: { where: { kind: "download" } } } })]);
  const svc = orders.filter(o => o.kind === "service"), other = orders.filter(o => o.kind !== "service"); const dls = orders.flatMap(o => o.files);
  const card = "glass rounded-3xl p-6 sm:p-8";
  return (
    <section className={`${wrap} pt-36 pb-24 grid gap-8`}>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-display text-[11px] tracking-[.3em] uppercase text-sky-brand">{T("My account")}</p><h1 className="mt-2 font-display text-4xl font-extrabold text-white">{T("Welcome back")}{u?.name ? `, ${u.name}` : ""}.</h1></div>
        <form action={async () => { "use server"; await signOut({ redirectTo: `/${getLoc()}` }); }}><button className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white">{T("Log out")}</button></form></div>
      <div className={card}><h2 className="font-display text-lg font-bold text-white mb-4">{T("Profile")}</h2><p className="mb-4 text-sm text-slate-300">{u?.email}</p><ProfileForm name={u?.name || ""} locale={u?.locale || getLoc()} names={localeNames} t={acctT()} /></div>
      <div className={card}><h2 className="font-display text-lg font-bold text-white">{T("Service orders")}</h2>
        {svc.length ? <ul className="mt-4 divide-y divide-white/10">{svc.map(o => <li key={o.id}><a href={L(`/account/orders/${o.id}`)} className="flex flex-wrap justify-between gap-3 py-4 hover:text-sky-brand"><span className="font-semibold text-white">{T(o.title)}</span><span className="text-sm text-slate-300">{T(stepLabel[o.status])} · ${(o.amount / 100).toFixed(2)} · {o.createdAt.toISOString().slice(0, 10)}</span></a></li>)}</ul>
          : <p className="mt-3 text-slate-300">{T("No service orders yet.")} <a href={L("/services")} className="font-semibold text-sky-brand">{T("Browse services")} →</a></p>}</div>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className={card}><h2 className="font-display text-lg font-bold text-white">{T("Orders & payments")}</h2>
          {other.length ? <ul className="mt-4 divide-y divide-white/10">{other.map(o => <li key={o.id} className="flex justify-between gap-3 py-3 text-sm"><a href={L(`/account/orders/${o.id}`)} className="text-white hover:text-sky-brand">{T(o.title)}</a><span className="text-slate-300">${(o.amount / 100).toFixed(2)}</span></li>)}</ul> : <p className="mt-3 text-slate-300">{T("No purchases yet.")} <a href={L("/store")} className="font-semibold text-sky-brand">{T("Visit the store")} →</a></p>}</div>
        <div className={card}><h2 className="font-display text-lg font-bold text-white">{T("Digital downloads")}</h2>
          {dls.length ? <ul className="mt-4 space-y-2">{dls.map(f => <li key={f.id}><a href={`/api/download?f=${f.id}`} className="text-sky-brand hover:text-white">⬇ {f.name}</a></li>)}</ul> : <p className="mt-3 text-slate-300">{T("Files from your purchases appear here.")}</p>}</div>
      </div>
    </section>
  );
}
