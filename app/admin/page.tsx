import Link from "next/link";
import { db } from "@/lib/db";
import { staff, can } from "@/lib/rbac";
import { getSettings } from "@/lib/settings";
import { getCatalog } from "@/lib/catalog";
import { aiKey } from "@/lib/ai";
import { stripeOn } from "@/lib/stripe";
import { trackingConfig } from "@/lib/tracking";
export const metadata = { title: "Mission Control" };
export const dynamic = "force-dynamic";
const usd = (c: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(c / 100);
type Act = { n: number; label: string; href: string; tone: "red" | "amber" | "sky"; why: string };
/** Mission Control: an action queue of everything that needs a human, KPIs and recent activity — filtered by role. */
export default async function Mission() {
  const who = await staff(); if (!who) return null; const r = who.role; const now = new Date(); const d30 = new Date(Date.now() - 30 * 86400_000); const d7 = new Date(Date.now() + 7 * 86400_000);
  const s = await getSettings(); const days = s.orders.autoCompleteDays || 3;
  const z = Promise.resolve(0);
  const [human, pendingReq, revision, late, awaiting, newForms, notFound, aiDrafts, noAlt, expiring, drafts, sched] = await Promise.all([
    can(r, "chat.use") ? db.chatConversation.count({ where: { status: "human" } }) : z,
    can(r, "orders.view") ? db.order.count({ where: { status: "pending" as never, kind: "service" as never } }) : z,
    can(r, "orders.view") ? db.order.count({ where: { status: "revision" as never } }) : z,
    can(r, "orders.view") ? db.order.count({ where: { status: { in: ["pending", "in_progress", "revision"] as never[] }, dueAt: { lt: now } } }) : z,
    can(r, "orders.view") ? db.order.count({ where: { status: "delivered" as never } }) : z,
    can(r, "forms.view") ? db.formSubmission.count({ where: { status: "new" } }) : z,
    can(r, "seo.edit") ? db.notFoundLog.count({ where: { hits: { gte: 3 } } }) : z,
    can(r, "content.edit") ? db.uiString.count({ where: { status: "ai_draft" } }) : z,
    can(r, "content.edit") ? db.media.count({ where: { mime: { startsWith: "image/" }, OR: [{ alt: null }, { alt: "{}" }] } }) : z,
    can(r, "catalog.edit") ? db.coupon.count({ where: { active: true, endsAt: { gt: now, lt: d7 } } }) : z,
    can(r, "content.edit") ? db.page.count({ where: { draft: { not: null } } }) : z,
    can(r, "content.edit") ? db.blogPost.count({ where: { status: "scheduled" } }) : z,
  ]);
  let unsynced = 0; if (can(r, "catalog.edit") && stripeOn()) { const { catalog } = await getCatalog(); const m = s.stripePrices as Record<string, { amount: number }>; unsynced = Object.entries(catalog).filter(([id, it]) => m[id]?.amount !== it.amount).length; }
  const t = trackingConfig(s.tracking); const noTracking = can(r, "settings.edit") && !t.ga4 && !t.gtm;
  const acts: Act[] = ([
    { n: human, label: "chats waiting for a person", href: "/admin/chat", tone: "red", why: "Visitors asked for a human or the AI handed off." },
    { n: late, label: "orders past their due date", href: "/admin/orders?status=active", tone: "red", why: "Update the client or adjust the due date." },
    { n: revision, label: "revision requests", href: "/admin/orders", tone: "amber", why: "Clients asked for changes to a delivery." },
    { n: pendingReq, label: "orders waiting for requirements", href: "/admin/orders", tone: "amber", why: "Nudge the client to submit the brief." },
    { n: awaiting, label: `delivered orders awaiting acceptance`, href: "/admin/orders", tone: "sky", why: `They auto-complete ${days} days after delivery.` },
    { n: newForms, label: "new form submissions", href: "/admin/forms", tone: "amber", why: "Leads from contact, job and investor forms." },
    { n: notFound, label: "broken URLs hit 3+ times", href: "/admin/seo/redirects", tone: "amber", why: "Add redirects to keep traffic and rankings." },
    { n: aiDrafts, label: "AI-drafted translations to review", href: "/admin/translations", tone: "sky", why: "Machine drafts are live until you review them." },
    { n: noAlt, label: "images without alt text", href: "/admin/media", tone: "sky", why: "Alt text helps accessibility and image SEO." },
    { n: expiring, label: "coupons expiring this week", href: "/admin/coupons", tone: "sky", why: "Extend or let them lapse." },
    { n: drafts, label: "pages with unpublished drafts", href: "/admin/pages", tone: "sky", why: "Preview and publish, or discard." },
    { n: unsynced, label: "catalog prices not synced to Stripe", href: "/admin/stripe", tone: "amber", why: "Checkout still works (inline prices) — sync for Stripe reporting." },
    { n: noTracking ? 1 : 0, label: "analytics not configured", href: "/admin/tracking", tone: "sky", why: "Add a GA4 or GTM ID to measure traffic." },
  ] as Act[]).filter(a => a.n > 0);
  const kpi = can(r, "orders.view") ? await (async () => {
    const paid = await db.order.findMany({ where: { createdAt: { gte: d30 }, status: { notIn: ["pending", "cancelled"] as never[] } }, select: { amount: true, refundedAmount: true, kind: true } });
    const rev = paid.reduce((a, o) => a + o.amount - o.refundedAmount, 0); const active = await db.order.count({ where: { status: { in: ["pending", "in_progress", "revision", "delivered"] as never[] } } });
    const customers = await db.user.count({ where: { role: "customer" as never, createdAt: { gte: d30 } } });
    return [["Revenue (30 days)", usd(rev)], ["Paid orders (30 days)", String(paid.length)], ["Avg. order", paid.length ? usd(rev / paid.length) : "—"], ["Active orders", String(active)], ["New customers (30 days)", String(customers)]];
  })() : [];
  const recent = can(r, "audit.view") ? await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }) : [];
  const sys = [["Database", "connected"], ["Stripe", stripeOn() ? ((process.env.STRIPE_SECRET_KEY || "").startsWith("sk_live") ? "live mode" : "test mode") : "not configured"], ["AI features", aiKey() ? (s.chat.aiEnabled ? "on" : "key set, chat AI off") : "off (no OPENAI_API_KEY)"], ["Email", process.env.RESEND_API_KEY ? "Resend" : process.env.SMTP_HOST ? "SMTP" : "outbox file only"], ["Analytics", t.ga4 || t.gtm || "none"]];
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Dhaka" }).format(now));
  return <>
    <div className="mb-6"><p className="text-sm text-slate-400">{hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"}, {who.name || who.email.split("@")[0]} · <span className="capitalize">{who.role}</span></p><h1 className="font-display text-3xl font-bold text-white">Mission Control</h1></div>
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="rounded-2xl border border-white/10 bg-navy-900/80 p-5"><h2 className="mb-1 font-semibold text-white">Needs action</h2><p className="mb-4 text-xs text-slate-400">Everything waiting on a person, most urgent first. Press <kbd className="rounded bg-white/10 px-1">⌘K</kbd> to jump anywhere.</p>
        {acts.length ? <ul className="grid gap-2">{acts.map(a => <li key={a.label}><Link href={a.href} className="group flex items-center gap-4 rounded-xl border border-white/5 bg-navy-950/60 p-3 hover:border-sky-brand/50">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-lg font-bold ${a.tone === "red" ? "bg-red-500/15 text-red-200" : a.tone === "amber" ? "bg-amber-500/15 text-amber-200" : "bg-sky-brand/15 text-sky-200"}`}>{a.n}</span>
          <span className="flex-1"><span className="block font-medium text-white">{a.label}</span><span className="text-xs text-slate-400">{a.why}</span></span><span className="text-slate-500 group-hover:text-sky-brand">→</span></Link></li>)}</ul>
          : <p className="rounded-xl border border-dashed border-emerald-400/30 p-8 text-center text-emerald-200">✓ Inbox zero — nothing needs you right now.</p>}
        {(sched > 0) && <p className="mt-3 text-xs text-slate-400">{sched} blog post(s) scheduled.</p>}
      </section>
      <div className="grid content-start gap-6">
        {!!kpi.length && <section className="grid grid-cols-2 gap-3">{kpi.map(([l, v], i) => <div key={l} className={`rounded-2xl border border-white/10 bg-navy-900/80 p-4 ${i === 0 ? "col-span-2" : ""}`}><p className={`font-bold text-white ${i === 0 ? "text-3xl" : "text-xl"}`}>{v}</p><p className="text-xs text-slate-400">{l}</p></div>)}</section>}
        <section className="rounded-2xl border border-white/10 bg-navy-900/80 p-5"><h2 className="mb-3 font-semibold text-white">System</h2><dl className="grid gap-1.5 text-sm">{sys.map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-slate-400">{k}</dt><dd className="truncate text-right text-slate-200">{v}</dd></div>)}</dl></section>
        {!!recent.length && <section className="rounded-2xl border border-white/10 bg-navy-900/80 p-5"><h2 className="mb-3 font-semibold text-white">Recent activity</h2><ul className="grid gap-2 text-xs">{recent.map(a => <li key={a.id} className="flex justify-between gap-2"><span className="truncate text-slate-300"><b className="text-white">{a.actor?.split("@")[0] || "system"}</b> {a.action.replace(".", " ")} {a.entityId && <code className="text-slate-500">{a.entityId.slice(0, 30)}</code>}</span><span className="shrink-0 text-slate-500">{a.createdAt.toLocaleTimeString("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit" })}</span></li>)}</ul><Link href="/admin/audit" className="mt-3 inline-block text-xs text-sky-brand">Full audit log →</Link></section>}
      </div>
    </div></>;
}
