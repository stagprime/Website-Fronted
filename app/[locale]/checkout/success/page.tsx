import { useParamsLoc, T } from "@/lib/loc";
import { seoMeta } from "@/lib/seo";
import { PageHero, wrap, Btn } from "@/components/ui";
import { Purchase } from "@/components/Track";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await useParamsLoc(params); return { ...await seoMeta("/checkout/success", "Payment successful", "Thank you for your order with Stag Prime."), robots: { index: false, follow: false } }; }
type Sp = { session_id?: string };
export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Sp> }) { await useParamsLoc(params);
  const { session_id } = await searchParams; let value: number | undefined, name: string | undefined, kind = "";
  if (session_id && process.env.STRIPE_SECRET_KEY && /^cs_[\w]+$/.test(session_id)) {
    try { const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, { headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }, cache: "no-store" }); const j = await r.json(); if (j.payment_status === "paid" || j.status === "complete") { value = (j.amount_total || 0) / 100; name = j.metadata?.item; kind = String(j.metadata?.item || "").split(":")[0]; } } catch { /* show generic thank-you */ }
  }
  return (<>
    {session_id && value !== undefined && <Purchase id={session_id} value={value} name={name} />}
    <PageHero kicker="Payment successful" title="Thank you — your order is confirmed." sub="A receipt is on its way to your inbox. Track your order, download files and message our team from your account." crumbs={[["Checkout", "/checkout/success"]]}>
      <div className="mt-9 flex flex-wrap gap-4"><Btn href="/account">{kind === "gig" ? T("Submit your requirements") : T("Go to my account")} →</Btn><Btn href="/store" ghost>{T("Continue shopping")}</Btn></div>
    </PageHero>
    <section className={`${wrap} pb-24`}><p className="text-slate-300 max-w-2xl">{T("New here? Create an account with the same email you used at checkout and your order will appear automatically.")}</p></section>
  </>);
}
