import "../globals.css";
import type { Metadata } from "next";
import { Unbounded, Open_Sans, Noto_Sans_Bengali, Noto_Sans_Arabic, Noto_Sans_Devanagari } from "next/font/google";
import { notFound } from "next/navigation";
import { locales, rtlLocales, SITE, CONTACT, localeNames, ogLocale } from "@/lib/i18n";
import { setLoc, T, L } from "@/lib/loc";
import en from "@/messages/en.json";
import { nav } from "@/lib/nav";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactDock from "@/components/ContactDock";
import Reveal from "@/components/Reveal";
import Motion from "@/components/Motion";
import LangBanner from "@/components/LangBanner";
import Consent from "@/components/Consent";
import { consentT } from "@/lib/consentkeys";
const display = Unbounded({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700", "800"], display: "swap" });
const body = Open_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const bn = Noto_Sans_Bengali({ subsets: ["bengali"], variable: "--f-bn", weight: ["400", "700"], preload: false, display: "swap" });
const ar = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--f-ar", weight: ["400", "700"], preload: false, display: "swap" });
const hi = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--f-hi", weight: ["400", "700"], preload: false, display: "swap" });
export function generateStaticParams() { return locales.map(locale => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; setLoc(locale);
  const title = T(en.meta.title), description = T(en.meta.description);
  return {
    metadataBase: new URL(SITE), title: { default: title, template: "%s | Stag Prime" }, description,
    alternates: { types: { "application/rss+xml": "/rss.xml" }, canonical: `/${locale}`, languages: { ...Object.fromEntries(locales.map(l => [l, `/${l}`])), "x-default": "/en" } },
    openGraph: { type: "website", url: `/${locale}`, siteName: "Stag Prime", locale: ogLocale[locale], title, description, images: [{ url: "/og.jpg", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", site: "@stag_prime", title, description, images: ["/og.jpg"] },
    icons: { icon: "/logo.svg" }, verification: { google: process.env.GOOGLE_SITE_VERIFICATION, yandex: process.env.YANDEX_VERIFICATION, other: Object.fromEntries(([["msvalidate.01", process.env.BING_SITE_VERIFICATION], ["p:domain_verify", process.env.PINTEREST_VERIFICATION], ["facebook-domain-verification", process.env.FACEBOOK_DOMAIN_VERIFICATION], ["naver-site-verification", process.env.NAVER_VERIFICATION], ["baidu-site-verification", process.env.BAIDU_VERIFICATION]] as [string, string | undefined][]).filter(([, v]) => v) as [string, string][]) }, robots: { index: true, follow: true },
  };
}
const jsonLd = {
  "@context": "https://schema.org", "@type": ["Organization", "ProfessionalService"], "@id": `${SITE}/#org`,
  name: "Stag Prime", legalName: "Stag Prime LLC", alternateName: "Stag Prime Digital Agency", url: SITE, logo: `${SITE}/logo.svg`, image: `${SITE}/og.jpg`,
  slogan: "Your Ultimate Growth Partner", email: CONTACT.email, telephone: "+13073964184",
  address: { "@type": "PostalAddress", streetAddress: "30 N Gould St #23907", addressLocality: "Sheridan", addressRegion: "WY", postalCode: "82801", addressCountry: "US" },
  location: [{ "@type": "Place", name: "Bangladesh Office", address: { "@type": "PostalAddress", streetAddress: "268/C Kadirganj, Boalia", addressLocality: "Rajshahi", postalCode: "6000", addressCountry: "BD" } }],
  contactPoint: [{ "@type": "ContactPoint", telephone: "+13073964184", contactType: "customer service", email: CONTACT.support, availableLanguage: ["en", "bn", "ar", "es", "fr", "de", "hi"] }],
  sameAs: ["https://www.facebook.com/stagprime","https://www.instagram.com/stagprimes/","https://x.com/stag_prime","https://www.linkedin.com/company/StagPrime","https://youtube.com/@stagprime","https://www.pinterest.com/Stagprime/","https://medium.com/@stagprime","https://www.quora.com/profile/Stag-Prime","https://linktr.ee/stagprime","https://www.tumblr.com/stagprime","https://clutch.co/profile/stag-prime-digital-agency","https://www.crunchbase.com/organization/stag-prime-digital-agency","https://www.trustpilot.com/review/stagprime.com","https://www.yelp.com/biz/stag-prime-digital-agency-sheridan"],
};
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(locales as readonly string[]).includes(locale)) notFound();
  setLoc(locale);
  // Translate nav server-side so the client header ships only the strings it needs.
  const tNav = nav.map(g => ({ ...g, label: T(g.label), key: g.label, href: L(g.href),
    featured: g.featured && { ...g.featured, t: T(g.featured.t), d: T(g.featured.d), cta: T(g.featured.cta), href: L(g.featured.href) },
    cols: g.cols?.map(c => ({ title: T(c.title), items: c.items.map(i => ({ ...i, t: i.ext ? i.t : T(i.t), d: i.d && T(i.d), subs: i.subs?.map(T), href: i.ext ? i.href : L(i.href) })) })) }));
  const ui = Object.fromEntries(["Login", "Book a Call", "Open menu", "Close menu", "Menu", "Contact", "Login / Sign up", "Featured", "Explore", "View all", "Quick chat:", "Call", "Language", "Main", "Skip to content", "Home", "Stag Prime home"].map(k => [k, T(k)]));
  const banner = Object.fromEntries(locales.map(l => [l, l]));
  return (
    <html lang={locale} dir={rtlLocales.includes(locale) ? "rtl" : "ltr"} className={`${display.variable} ${body.variable} ${bn.variable} ${ar.variable} ${hi.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[80] focus:bg-white focus:text-navy-900 focus:px-4 focus:py-2 focus:rounded">{ui["Skip to content"]}</a>
        <LangBanner locale={locale} names={localeNames} labels={Object.fromEntries(Object.keys(banner).map(l => [l, { q: tq(l), yes: ty(l), no: tn(l) }]))} />
        <Header nav={tNav} ui={ui} locale={locale} names={localeNames} />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer />
        <ContactDock />
            <Consent policy={L("/privacy")} t={consentT()} cfg={{ gtm: process.env.NEXT_PUBLIC_GTM_ID, ga4: process.env.NEXT_PUBLIC_GA4_ID, pixel: process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID, ads: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
              adsLabels: Object.fromEntries(["PURCHASE", "LEAD", "SIGNUP"].map(k => [k.toLowerCase(), process.env[`NEXT_PUBLIC_GOOGLE_ADS_LABEL_${k}`] || ""]).filter(([, v]) => v)), tiktok: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID, linkedin: process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID }} />
        <Reveal />
        <Motion />
      </body>
    </html>
  );
}
// Banner copy is shown in the *suggested* language, so it is defined here for every locale.
const Q: Record<string, [string, string, string]> = {
  en: ["View this site in English?", "Switch", "No thanks"], bn: ["এই সাইটটি বাংলায় দেখবেন?", "বাংলায় দেখুন", "না, ধন্যবাদ"],
  ar: ["هل تريد عرض هذا الموقع بالعربية؟", "التبديل", "لا، شكرًا"], es: ["¿Ver este sitio en español?", "Cambiar", "No, gracias"],
  fr: ["Afficher ce site en français ?", "Changer", "Non merci"], de: ["Diese Website auf Deutsch ansehen?", "Wechseln", "Nein danke"],
  hi: ["क्या आप यह साइट हिन्दी में देखना चाहेंगे?", "बदलें", "नहीं, धन्यवाद"],
};
const tq = (l: string) => Q[l][0], ty = (l: string) => Q[l][1], tn = (l: string) => Q[l][2];
