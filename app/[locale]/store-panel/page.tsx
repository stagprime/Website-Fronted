import { S } from "@/lib/site";
import Image from "next/image";
import { notFound } from "next/navigation";
import { loadLoc, T, getLoc, L } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, wrap, Btn, CTA, Kicker, H2 } from "@/components/ui";
import { SITE } from "@/lib/i18n";
import { ViewContent } from "@/components/Track";
// OwnStore by Stag Prime. Slug stays store-panel. Name, price, image, and the subscribe URL come from the CMS product
// when that entry exists; a removed entry 404s. A stored legacy name is rewritten in lib/settings.ts.
const panel = () => S().products.find(x => x.slug === "store-panel");
const origin = (u: string) => { try { return new URL(u).origin; } catch { return u; } };
const SUB = "https://stag-prime-store-panel.vercel.app/subscribe";
const META_TITLE = "OwnStore by Stag Prime — $20/month";
const META_DESC = "OwnStore by Stag Prime is the $20/month admin for your own products and your own delivery. No dropshipping suppliers and no marketplace catalogue.";
const H1 = "OwnStore by Stag Prime";
const VALUE = "Your own store. Your own products. Your own delivery.";
const audiences = [
  ["Retailers and makers who hold their own stock", "You already have goods to sell. The admin lists them, prices them, and tracks stock."],
  ["Teams that pack and deliver orders themselves", "You fulfil each order. The dashboard shows pending, processing, shipped, and delivered."],
  ["Businesses that want one admin per shop", "Every shop is its own tenant, with its own products, orders, customers, and staff logins."],
  ["Merchants who do not want a custom build", "Subscribe, pay $20 a month with Stripe, and open a finished admin the same day."],
];
const included: [string, string][] = [
  ["Products and inventory", "Add your products, prices, and stock. The catalogue belongs to your shop."],
  ["Orders", "Follow each order from pending to processing, shipped, and delivered."],
  ["Customers", "Keep buyer records in your own tenant, separate from every other shop."],
  ["Payments", "Buyers pay you for their orders. Your subscription is a separate $20 monthly charge on Stripe."],
  ["Shipping and delivery", "You choose how each order is delivered. The admin does not book a dropshipping carrier."],
  ["Online Store settings", "Set the public shop title, tagline, visibility, and storefront options."],
  ["Addons", "Turn storefront tools on or off, including the cart and related extras."],
  ["Languages, currency, and domains", "Offer more than one language, show the currencies you enable, and connect your own domain when you launch."],
];
const steps: [string, string][] = [
  ["Subscribe", "Open the subscribe page and create the shop."],
  ["Pay with Stripe", "The plan is $20 per month, billed by Stripe."],
  ["Receive the admin login", "Credentials are emailed after payment."],
  ["Open the dashboard", "Sign in, add products, and start taking orders."],
];
const faq: [string, string][] = [
  ["What is OwnStore by Stag Prime?", "OwnStore by Stag Prime is a store admin from Stag Prime LLC. Each business gets its own tenant to sell its own products and run its own delivery."],
  ["Is OwnStore by Stag Prime for dropshipping?", "No. There is no supplier marketplace and no link to dropshipping vendors. You sell your catalogue and deliver the orders yourself."],
  ["How much does OwnStore by Stag Prime cost?", "One plan: $20 per month, billed through Stripe. The price on this page is the price on the subscribe page."],
  ["Is there a free trial?", "There is no separate free trial. You subscribe at $20 per month and you can cancel if the shop is not a fit."],
  ["Who should use OwnStore by Stag Prime?", "Merchants in Bangladesh and worldwide who already have products to sell and a way to deliver them."],
  ["How do I subscribe to OwnStore by Stag Prime?", "Choose Subscribe. You create the shop and pay with Stripe. The admin login is emailed after payment."],
  ["How do my customers pay?", "Buyers pay you for their orders. The $20 monthly plan is your subscription, separate from those sales."],
  ["Who owns the products and the customer data?", "You do. Each shop is its own tenant. Your products are not listed in a public marketplace of other sellers."],
  ["Can I use my own domain?", "Yes. Connect your domain from the store settings when the public shop is ready. You can start on the address that comes with the product."],
  ["Which languages and currencies can the shop use?", "You can run the storefront in more than one language and show prices in the currencies you enable."],
  ["Does Stag Prime deliver the orders for me?", "No. You pack and deliver. The admin records the path from pending to delivered so your team can see the status."],
  ["Can I cancel OwnStore by Stag Prime?", "Yes. The plan is monthly. Cancel in Stripe billing when you no longer want the admin."],
  ["What support is included?", "Write to Stag Prime from the contact page, WhatsApp, or email. We help you open the admin and answer product questions."],
  ["How is OwnStore by Stag Prime different from a custom-built admin?", "A custom admin is a project you scope and wait for. OwnStore by Stag Prime is a finished product at $20 per month."],
  ["How is OwnStore by Stag Prime different from Boneek-style shop tools?", "Those tools often tie the shop to their own marketplace patterns. OwnStore by Stag Prime is your admin for your goods and your delivery, with no supplier catalogue."],
  ["Is OwnStore by Stag Prime only for sellers in Bangladesh?", "No. Sellers in Bangladesh are a core audience, and the same admin works for merchants anywhere who sell their own products."],
  ["What happens after I pay?", "Stripe confirms the subscription, your shop tenant is created, and the admin credentials are emailed to you."],
  ["Can more than one person sign in?", "Yes. The shop has its own staff logins, separate from every other business."],
];
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  await loadLoc(params); return panel() ? await seoMeta("/store-panel", META_TITLE, META_DESC, "/img/real/store-panel-dashboard.webp") : {};
}
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  await loadLoc(params); const p = panel(); if (!p) notFound(); const l = getLoc();
  const url = p.url || SUB; const signIn = `${origin(url)}/login`;
  const amount = (p.p.match(/[\d.]+/) || ["20"])[0];
  const name = T(p.n);
  const ld = { "@context": "https://schema.org", "@type": "SoftwareApplication", name, applicationCategory: "BusinessApplication", applicationSubCategory: "E-commerce store admin", operatingSystem: "Web", url: `${SITE}/${l}/store-panel`, description: T(META_DESC), image: `${SITE}${p.img || "/img/real/store-panel-dashboard.webp"}`, featureList: (p.feats || []).map(f => T(f)), provider: { "@id": `${SITE}/#org` },
    offers: { "@type": "Offer", price: amount, priceCurrency: "USD", url, description: T("$20 per month for one store admin."), priceSpecification: { "@type": "UnitPriceSpecification", price: amount, priceCurrency: "USD", billingDuration: "P1M", unitCode: "MON" } } };
  return (<>
    <JsonLd data={breadcrumb([["Store", "/store"], ["SaaS & Software", "/store/software"], [p.n, "/store-panel"]])} /><JsonLd data={ld} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: T(q), acceptedAnswer: { "@type": "Answer", text: T(a) } })) }} />
    <ViewContent name={name} type="saas" id="store-panel" />
    <PageHero img={p.img} color={p.color} kicker={`${p.n} · ${p.p}`} title={H1} sub={VALUE} crumbs={[["Store", "/store"], ["SaaS & Software", "/store/software"], [p.n, "/store-panel"]]}>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">{T(p.d)}</p>
      <div className="mt-9 flex flex-wrap gap-4 items-center"><Btn href={url} ext>Subscribe — $20/month</Btn><Btn href={signIn} ghost ext>Sign in to your store</Btn></div>
    </PageHero>
    <section className={`${wrap} pb-8`}>
      {p.img && <Image src={p.img} alt={T("OwnStore by Stag Prime dashboard")} width={1280} height={720} sizes="(max-width:1280px) 100vw, 80rem" className="w-full h-auto rounded-[2rem] border border-white/10" priority />}
    </section>
    <section className={`${wrap} py-16`}>
      <Kicker>{T("Who it is for")}</Kicker>
      <H2>{T("Built for merchants who own what they sell")}</H2>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">{T("OwnStore by Stag Prime is for shops in Bangladesh and worldwide that sell their own products. You list your goods, take the orders, and deliver them yourself. There is no supplier marketplace inside the product.")}</p>
      <div className="mt-10 grid md:grid-cols-2 gap-5">{audiences.map(([h, d]) => <article key={h} className="glass rounded-3xl p-7"><h3 className="font-display text-xl font-bold text-white leading-snug">{T(h)}</h3><p className="mt-3 text-slate-300 leading-relaxed">{T(d)}</p></article>)}</div>
    </section>
    <section className={`${wrap} py-16`}>
      <Kicker>{T("What is inside")}</Kicker>
      <H2>{T("The dashboard covers the work of running your shop")}</H2>
      <div className="mt-10 grid md:grid-cols-2 gap-5">{included.map(([h, d]) => <article key={h} className="rounded-3xl border border-white/10 p-7"><h3 className="font-display text-lg font-bold text-white leading-snug">{T(h)}</h3><p className="mt-3 text-slate-300 leading-relaxed">{T(d)}</p></article>)}</div>
      <ul className="mt-8 grid sm:grid-cols-2 gap-3">{(p.feats || []).map(f => <li key={f} className="flex gap-3 text-slate-200 leading-relaxed"><span style={{ color: p.color }}>✓</span>{T(f)}</li>)}</ul>
    </section>
    <section className="bg-slate-50 text-navy-900"><div className={`${wrap} py-20`}>
      <Kicker light>{T("How it works")}</Kicker>
      <h2 className="font-display text-3xl sm:text-5xl font-bold leading-snug">{T("From subscribe to the first product")}</h2>
      <ol className="mt-10 grid md:grid-cols-4 gap-5">{steps.map(([h, d], i) => <li key={h} className="rounded-3xl bg-white border border-slate-200 p-6"><span className="font-display text-blue-brand">0{i + 1}</span><h3 className="mt-2 font-display text-lg font-bold leading-snug">{T(h)}</h3><p className="mt-2 text-sm text-slate-600 leading-relaxed">{T(d)}</p></li>)}</ol>
    </div></section>
    <section className={`${wrap} py-20 grid lg:grid-cols-2 gap-10 items-center`}>
      <div>
        <Kicker>{T("Pricing")}</Kicker>
        <H2>{T("$20 per month")}</H2>
        <p className="mt-6 text-lg leading-relaxed text-slate-300">{T("One shop, one tenant, one monthly plan. No supplier fee and no cut of your sales.")}</p>
        <div className="mt-8 flex flex-wrap gap-4"><Btn href={url} ext>Subscribe — $20/month</Btn><a href={L("/store")} className="inline-flex items-center font-semibold text-sky-brand">{T("Browse every Stag Prime product")} →</a></div>
      </div>
      <div className="glass rounded-3xl p-8">
        <p className="font-display text-5xl font-bold text-white">{p.p}</p>
        <p className="mt-3 text-slate-300 leading-relaxed">{T("$20 per month for one store admin.")}</p>
        <p className="mt-4 text-sm text-slate-400 leading-relaxed">{T("Billed by Stripe. Cancel any month from billing.")}</p>
      </div>
    </section>
    <section className={`${wrap} pb-20`}>
      <Kicker>{T("How it compares")}</Kicker>
      <H2>{T("A finished admin, not a supplier network")}</H2>
      <div className="mt-10 grid md:grid-cols-2 gap-5">
        <article className="rounded-3xl border border-white/10 p-7"><h3 className="font-display text-xl font-bold text-white leading-snug">{T("Against a custom build")}</h3><p className="mt-3 text-slate-300 leading-relaxed">{T("A custom store admin is a project you scope and wait for. OwnStore by Stag Prime is ready the day you subscribe.")}</p></article>
        <article className="rounded-3xl border border-white/10 p-7"><h3 className="font-display text-xl font-bold text-white leading-snug">{T("Against dropshipping platforms")}</h3><p className="mt-3 text-slate-300 leading-relaxed">{T("Those platforms connect you to someone else's products. OwnStore by Stag Prime has no supplier catalogue. You sell what you own and deliver it yourself.")}</p></article>
      </div>
      <p className="mt-8 max-w-3xl text-slate-300 leading-relaxed">{T("OwnStore by Stag Prime is a product of Stag Prime LLC, the team behind Stag Prime Sentinel. Your shop stays in its own tenant.")} <a href={L("/contact")} className="font-semibold text-sky-brand">{T("Ask Stag Prime a question")} →</a></p>
    </section>
    <section className={`${wrap} pb-24 grid lg:grid-cols-[1fr_1.2fr] gap-12`}>
      <div><Kicker>{T("Questions")}</Kicker><H2>{T("Common questions before you subscribe")}</H2></div>
      <div>{faq.map(([q, a]) => <details key={q} className="mb-3 rounded-2xl border border-white/10 p-5"><summary className="cursor-pointer font-semibold text-white leading-snug">{T(q)}</summary><p className="mt-3 text-slate-300 leading-relaxed">{T(a)}</p></details>)}</div>
    </section>
    <CTA title="Start OwnStore by Stag Prime" sub="Subscribe for $20 a month, or tell us if you need a custom shop instead." />
  </>);
}
