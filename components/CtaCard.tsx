import { L, T } from "@/lib/loc";
import { S } from "@/lib/site";
import { Marquee } from "@/components/ui";
/** Contact CTA card (WhatsApp / Telegram / call) — contact details come from Admin → Branding → Contact. */
export default function CtaCard({ title, sub, marquee }: { title: string; sub: string; marquee?: boolean }) {
  const c = S().contact;
  return (<>
    {marquee && <Marquee />}
    <section className="px-5 sm:px-8 py-24">
      <div className="reveal relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-brand via-navy-800 to-navy-900 p-8 sm:p-16 border border-sky-brand/30">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <div><h2 data-split="scroll" className="font-display text-3xl sm:text-5xl font-extrabold text-white leading-tight">{title}</h2><p className="mt-5 text-slate-200 text-lg">{sub}</p></div>
          <div className="grid gap-3">
            {c.whatsapp && <a href={c.whatsapp} target="_blank" rel="noopener" className="rounded-2xl bg-[#178a3e] px-6 py-4 font-semibold text-white flex justify-between">WhatsApp <span aria-hidden>→</span></a>}
            {c.telegram && <a href={c.telegram} target="_blank" rel="noopener" className="rounded-2xl bg-[#1b6fa0] px-6 py-4 font-semibold text-white flex justify-between">Telegram {c.telegramHandle} <span aria-hidden>→</span></a>}
            {c.phone && <a href={c.tel} className="rounded-2xl bg-white px-6 py-4 font-semibold text-navy-900 flex justify-between"><span>{T("Call")} <span dir="ltr">{c.phone}</span></span> <span aria-hidden>→</span></a>}
            <a href={L("/contact")} className="text-center text-sm text-slate-200 hover:text-white">{T("or send a project brief →")}</a>
          </div>
        </div>
      </div>
    </section>
  </>);
}
