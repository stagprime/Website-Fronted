import { useParamsLoc, L, T, TT } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, Kicker, H2, wrap, Btn, CTA, TrustStrip } from "@/components/ui";
import { ai } from "@/lib/art";
import Icon from "@/components/Icon";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); return await seoMeta("/privacy", "Privacy Policy", "Privacy Policy for Stag Prime LLC and stagprime.com."); }
const S: [string, string][] = [["Information we collect","We collect information you provide (such as name, email, phone and project details submitted via forms) and technical data (such as device, browser and usage analytics)."],["How we use information","To respond to inquiries, deliver services and products, process payments through Stripe, improve our website and communicate with you."],["Sharing","We do not sell personal data. We share data with service providers (hosting, payments, analytics, email) only as needed to operate our business."],["Cookies","We use essential cookies (e.g. language preference) and, with consent, analytics cookies."],["Your rights","Depending on your location you may have rights to access, correct or delete your data. Contact support@stagprime.com."],["Contact","Stag Prime LLC, 30 N Gould St #23907, Sheridan, WY 82801, USA · support@stagprime.com"]];
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params);
  return (<>
    <JsonLd data={breadcrumb([["Privacy Policy", "/privacy"]])} />
    <PageHero img={ai("venture-stag-vpn")} kicker="Legal" title="Privacy Policy" sub="Last updated: 2026. Template — pending legal review before launch." crumbs={[["Privacy Policy", "/privacy"]]} />
    <article className={`${wrap} pb-24 max-w-3xl prose-sp`}><p className="rounded-2xl border border-area-red/40 bg-area-red/10 p-4 text-sm">{T("⚠ Draft template for legal review. Not final legal advice.")}</p>
      {S.map(([h, p]) => <section key={h}><h2>{TT(h)}</h2><p>{TT(p)}</p></section>)}</article>
  </>);
}
