import { loadLoc, T, TT } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, wrap } from "@/components/ui";
import { formT } from "@/lib/formt";
import { ai } from "@/lib/art";
import { ContactForm } from "@/components/Forms";
import { getContact, getServices } from "@/lib/content";
import { coded } from "@/lib/cms/page";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); return await seoMeta("/contact", "Contact & Book a Call", "Talk to Stag Prime: WhatsApp or call +1 307-396-4184, Telegram @stagprime, email brand@stagprime.com, or send a project brief."); }
export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ topic?: string }> }) { await loadLoc(params); const [CONTACT, services] = await Promise.all([getContact(), getServices()]); const topic = (await searchParams).topic?.slice(0, 120); const c = coded("/contact");
  const ch = [["WhatsApp", CONTACT.whatsapp, CONTACT.phone, "#20BF55"], ["Telegram", CONTACT.telegram, CONTACT.telegramHandle, "#2AABEE"], ["Call", CONTACT.tel, CONTACT.phone, "#1071B2"], ["Email", `mailto:${CONTACT.email}`, CONTACT.email, "#48BDED"], ["Support", `mailto:${CONTACT.support}`, CONTACT.support, "#3FB7D3"]];
  return (<>
    <JsonLd data={breadcrumb([["Contact", "/contact"]])} />
    <PageHero kicker="Let's Talk Business" title={<>{T("Ready to scale?")} <span className="grad-text">{T("Let's talk.")}</span></>} sub="Fill out the form, message us, or book a free strategy call." img={ai("page-contact")} crumbs={[["Contact", "/contact"]]} />
    {(() => { const off = c.order.find(x => x.id === "offices")?.visible !== false; const form = c.order.find(x => x.id === "form")?.visible !== false; return (
    <section className={`${wrap} pb-24 grid lg:grid-cols-[1.5fr_1fr] gap-8`}>
      {form && <ContactForm t={formT()} topic={topic} services={[...services.map(s => s.title), "POD Automation", "Digital products", "Ecosystem Partnership", "Investment", "Other Inquiry"].map(x => T(x))} />}
      <div className="space-y-3">{ch.map(([n, u, v, c]) => <a key={n} href={u} target={u.startsWith("http") ? "_blank" : undefined} rel="noopener" className="glass glow-card rounded-2xl p-5 flex items-center gap-4"><span className="h-10 w-10 rounded-xl grid place-items-center text-white text-sm font-bold" style={{ background: c }}>{n[0]}</span><span><span className="block text-xs text-slate-400">{TT(n)}</span><span className="block font-semibold text-white">{TT(v)}</span></span></a>)}
        {off && <div className="glass rounded-2xl p-5 text-sm text-slate-300"><p className="font-semibold text-white">{c.text("offices", "hqTitle")}</p><p>{c.text("offices", "hqText")}</p><p className="mt-3 font-semibold text-white">{c.text("offices", "bdTitle")}</p><p>{c.text("offices", "bdText")}</p></div>}</div>
    </section>); })()}
  </>);
}
