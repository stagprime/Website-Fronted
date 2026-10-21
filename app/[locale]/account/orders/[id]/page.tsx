import { redirect, notFound } from "next/navigation";
import { useParamsLoc, L, T } from "@/lib/loc";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { wrap } from "@/components/ui";
import { RequirementsForm, MessageForm, DeliveryActions } from "@/components/AccountUI";
import { acctT, STEPS, stepLabel } from "@/lib/acct";
import { gigOf } from "@/content/gigs";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return { title: "Order", robots: { index: false, follow: false } }; }
export default async function Page({ params }: { params: Promise<{ locale: string; id: string }> }) { await useParamsLoc(params);
  const { id } = await params; const s = await auth(); if (!s?.user) redirect(L("/login"));
  const o = await db.order.findUnique({ where: { id }, include: { events: { orderBy: { createdAt: "asc" } }, files: true, messages: { orderBy: { createdAt: "asc" } } } });
  if (!o || (o.userId !== s.user.id && o.email !== s.user.email && !["admin", "staff"].includes(s.user.role))) notFound();
  const t = acctT(); const gig = o.item.startsWith("gig:") ? gigOf(o.item.split(":")[1]) : undefined; const idx = STEPS.indexOf(o.status as never);
  const card = "glass rounded-3xl p-6 sm:p-8";
  return (
    <section className={`${wrap} pt-36 pb-24 grid gap-8`}>
      <div><a href={L("/account")} className="text-sm text-sky-brand">← {T("My account")}</a><h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-white">{T(o.title)}</h1><p className="mt-2 text-slate-300">#{o.id.slice(-8).toUpperCase()} · ${(o.amount / 100).toFixed(2)} · {o.createdAt.toISOString().slice(0, 10)}{o.dueAt && ` · ${T("Due")} ${o.dueAt.toISOString().slice(0, 10)}`}</p></div>
      {o.kind === "service" && <div className={card}><h2 className="sr-only">{T("Status")}</h2>
        <ol className="grid grid-cols-5 gap-2">{STEPS.map((st, i) => <li key={st} className="text-center"><span className={`mx-auto grid place-items-center w-9 h-9 rounded-full text-sm font-bold ${i <= idx ? "bg-gradient-to-br from-sky-brand to-blue-brand text-white" : "border border-white/20 text-slate-400"}`} aria-current={i === idx ? "step" : undefined}>{i + 1}</span><span className={`mt-2 block text-xs ${i <= idx ? "text-white" : "text-slate-400"}`}>{T(stepLabel[st])}</span></li>)}</ol>
        <ul className="mt-6 space-y-2 text-sm">{o.events.map(e => <li key={e.id} className="flex gap-3 text-slate-300"><span className="text-slate-400 w-24 shrink-0">{e.createdAt.toISOString().slice(0, 10)}</span><span><b className="text-white">{T(stepLabel[e.status])}</b>{e.note && ` — ${T(e.note)}`}</span></li>)}</ul>
        {o.status === "delivered" && o.userId === s.user.id && <div className="mt-6"><DeliveryActions orderId={o.id} t={t} /></div>}</div>}
      {gig && !o.requirements && <div className={card}><h2 className="font-display text-lg font-bold text-white mb-4">{T("Submit your requirements")}</h2><RequirementsForm orderId={o.id} questions={gig.requirements.map(T)} t={t} /></div>}
      {o.files.length > 0 && <div className={card}><h2 className="font-display text-lg font-bold text-white mb-3">{T("Files")}</h2><ul className="space-y-2">{o.files.map(f => <li key={f.id}><a href={`/api/download?f=${f.id}`} className="text-sky-brand hover:text-white">⬇ {f.name}</a> <span className="text-xs text-slate-400">({T(f.kind)})</span></li>)}</ul></div>}
      <div className={card}><h2 className="font-display text-lg font-bold text-white mb-4">{T("Messages")}</h2>
        <ul className="space-y-3 mb-6">{o.messages.map(m => <li key={m.id} className={`rounded-2xl p-4 text-sm ${m.fromStaff ? "bg-sky-brand/10 border border-sky-brand/30" : "bg-white/5"}`}><p className="text-xs text-slate-400">{m.fromStaff ? "Stag Prime" : T("You")} · {m.createdAt.toISOString().slice(0, 16).replace("T", " ")}</p><p className="mt-1 whitespace-pre-wrap text-slate-100">{m.body}</p></li>)}
          {!o.messages.length && <li className="text-slate-300 text-sm">{T("Questions about your order? Message our team here.")}</li>}</ul>
        <MessageForm orderId={o.id} t={t} /></div>
    </section>
  );
}
