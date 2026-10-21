import { useParamsLoc, L, T, TT } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, H2, wrap, Btn, CTA, TrustStrip } from "@/components/ui";
import { InvestorForm } from "@/components/Forms";
import { DonateBox } from "@/components/Buy";
import { formT } from "@/lib/formt";
import { donationTiers } from "@/lib/catalog";
import { getLoc } from "@/lib/loc";
import { ai } from "@/lib/art";
import Icon from "@/components/Icon";
import { CONTACT } from "@/lib/i18n";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); return await seoMeta("/investors", "Investors & Donation", "Join us in shaping the future of Stag Prime. Learn about investment and donation opportunities and how to get in touch."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params);
  const dt = { title: T("Choose an amount"), custom: T("Custom amount (USD)"), cta: T("Donate with Stripe"), busy: T("Opening checkout…"), note: T("You will receive a Stripe receipt by email."), amount: T("Amount"), value: T("Amount") };
  return (<>
    <JsonLd data={breadcrumb([["Investors & Donation", "/investors"]])} />
    <PageHero img={ai("page-investors")} kicker="Investors & Donation" title={<>{T("Join us in shaping")} <span className="grad-text">{T("the future of Stag Prime.")}</span></>} sub="Stag Prime is an operator-led digital company — agency services, our own software, print-on-demand and media businesses. We welcome conversations with investors and supporters." crumbs={[["Investors & Donation", "/investors"]]}>
      <div className="mt-9 flex flex-wrap gap-4"><Btn href="#invest">{T("Invest Now")}</Btn><Btn href={`#donate`} ghost>{T("Donate Now")}</Btn></div>
    </PageHero>
    <section className={`${wrap} pb-20 grid md:grid-cols-3 gap-6`}>{[["Why Stag Prime", "Diversified revenue model: client services, owned digital products, POD stores across six marketplaces, and KDP/YouTube media. Proven product exit: Stag VPN, sold to NexGlobo."], ["Investment opportunities", "Investment structures, use of funds and projections are shared privately with qualified investors on request."], ["Donation opportunities", "Support our internship and student training programs that build digital skills. Donation tiers and recognition details are shared on request."]].map(([h, d]) => <div key={h} className="reveal glass rounded-3xl p-8"><h2 className="font-display text-xl font-bold text-white">{TT(h)}</h2><p className="mt-3 text-slate-400">{TT(d)}</p></div>)}</section>
    <section className="bg-slate-50 text-navy-900"><div className={`${wrap} py-20 grid md:grid-cols-2 gap-10`}>
      <div><Kicker light>{T("How to invest")}</Kicker><ol className="space-y-3">{["Contact us by email or phone", "Receive our investor information pack", "Meet the founder and review documents", "Agree terms and complete the process"].map((s, i) => <li key={s} className="flex gap-4 rounded-2xl bg-white border border-slate-200 p-4"><span className="font-display text-blue-brand">0{i + 1}</span>{TT(s)}</li>)}</ol></div>
      <div><Kicker light>{T("How to donate")}</Kicker><p className="text-slate-600">{T("One-time and recurring donations will be available via secure Stripe checkout. Until then, email")} <a href={`mailto:${CONTACT.email}`} className="font-semibold text-blue-brand">{CONTACT.email}</a> {T("or call")} <a href={CONTACT.tel} className="font-semibold text-blue-brand">{CONTACT.phone}</a>.</p>
        <p className="mt-6 text-xs text-slate-500">Stag Prime LLC is a for-profit company; donations are not tax-deductible. Nothing on this page is an offer to sell securities.</p></div></div></section>
    <section className={`${wrap} pb-24 grid lg:grid-cols-[1.3fr_1fr] gap-8 items-start`}>
      <div id="invest"><Kicker>{T("Investor inquiry")}</Kicker><H2>Request the investor pack.</H2><div className="mt-6"><InvestorForm t={formT()} /></div></div>
      <div id="donate"><Kicker>{T("Donate")}</Kicker><H2>Support the internship program.</H2><p className="mt-3 text-slate-300">{T("Donations fund training and equipment for interns in web development, app development, SEO and content. Secure payment by Stripe.")}</p><div className="mt-6"><DonateBox tiers={donationTiers} locale={getLoc()} t={dt} /></div></div>
    </section>
    <CTA title="Join us in making a difference." />
  </>);
}
