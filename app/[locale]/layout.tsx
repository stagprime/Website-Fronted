import "../globals.css";
import type { Metadata } from "next";
import { Unbounded, Open_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { locales, rtlLocales, SITE, localeNames, ogLocale } from "@/lib/i18n";
import { setLoc, T, L } from "@/lib/loc";
import { primeSite, S } from "@/lib/site";
import { themeCss, googleFontsHref } from "@/lib/theme";
import { trackingConfig } from "@/lib/tracking";
import en from "@/messages/en.json";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactDock from "@/components/ContactDock";
import Reveal from "@/components/Reveal";
import Motion from "@/components/Motion";
import LangBanner from "@/components/LangBanner";
import Consent from "@/components/Consent";
import { consentT } from "@/lib/consentkeys";
const display = Unbounded({ subsets: ["latin"], preload: false, variable: "--font-display", weight: ["500", "700", "800"], display: "swap" });
const body = Open_Sans({ subsets: ["latin"], preload: false, variable: "--font-body", display: "optional" }); // not preloaded (unused on bn/ar/hi phones); optional = no late re-paint of hero copy (LCP)
export function generateStaticParams() { return locales.map(locale => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; setLoc(locale); const { brand, seoDefaults } = await primeSite(locale);
  const title = T(en.meta.title), description = seoDefaults.defaultDescription || T(en.meta.description);
  const icons: Metadata["icons"] = brand.favicon === "/favicon.ico"
    ? { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/favicon-32.png", type: "image/png", sizes: "32x32" }], apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }] }
    : { icon: brand.favicon, apple: "/apple-touch-icon.png" };
  return {
    metadataBase: new URL(SITE), title: { default: title, template: seoDefaults.titleTemplate || `%s | ${brand.titleSuffix}` }, description,
    alternates: { types: { "application/rss+xml": "/rss.xml" }, canonical: `/${locale}`, languages: { ...Object.fromEntries(locales.map(l => [l, `/${l}`])), "x-default": "/en" } },
    openGraph: { type: "website", url: `/${locale}`, siteName: brand.name, locale: ogLocale[locale], title, description, images: [{ url: brand.ogImage, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", site: brand.twitter, title, description, images: [brand.ogImage] },
    icons, verification: { google: process.env.GOOGLE_SITE_VERIFICATION, yandex: process.env.YANDEX_VERIFICATION, other: Object.fromEntries(([["msvalidate.01", process.env.BING_SITE_VERIFICATION], ["p:domain_verify", process.env.PINTEREST_VERIFICATION], ["facebook-domain-verification", process.env.FACEBOOK_DOMAIN_VERIFICATION], ["naver-site-verification", process.env.NAVER_VERIFICATION], ["baidu-site-verification", process.env.BAIDU_VERIFICATION]] as [string, string | undefined][]).filter(([, v]) => v) as [string, string][]) }, robots: { index: true, follow: true },
  };
}
/** Organization JSON-LD — built from Admin → Branding (brand, contact, offices) and SEO → Schema (sameAs, types, extra JSON). */
function orgLd() {
  const { brand, contact: c, orgSchema: o, locales: _l } = { ...S(), locales };
  const [hq, ...rest] = c.offices; const addr = (x: typeof hq) => ({ "@type": "PostalAddress", streetAddress: x.street, addressLocality: x.city, ...(x.region && { addressRegion: x.region }), ...(x.postal && { postalCode: x.postal }), addressCountry: x.country });
  let extra: Record<string, unknown> = {}; try { extra = o.extra ? JSON.parse(o.extra) : {}; } catch { /* invalid JSON is ignored (validated in admin) */ }
  return {
    "@context": "https://schema.org", "@type": o.types, "@id": `${SITE}/#org`,
    name: brand.name, legalName: brand.legal, alternateName: o.alternateName, url: SITE, logo: `${SITE}${brand.logo}`, image: `${SITE}${brand.ogImage}`,
    slogan: brand.slogan, email: c.email, telephone: c.phoneE164,
    ...(hq && { address: addr(hq) }),
    location: rest.map(x => ({ "@type": "Place", name: x.label, address: addr(x) })),
    contactPoint: [{ "@type": "ContactPoint", telephone: c.phoneE164, contactType: "customer service", email: c.support, availableLanguage: [..._l] }],
    sameAs: o.sameAs, ...extra,
  };
}
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(locales as readonly string[]).includes(locale)) notFound();
  setLoc(locale); const site = await primeSite(locale); const nav = site.nav;
  // Translate nav server-side so the client header ships only the strings it needs.
  const tNav = nav.map(g => ({ ...g, label: T(g.label), key: g.label, href: L(g.href),
    featured: g.featured && { ...g.featured, t: T(g.featured.t), d: T(g.featured.d), cta: T(g.featured.cta), href: L(g.featured.href) },
    cols: g.cols?.map(c => ({ title: T(c.title), items: c.items.map(i => ({ ...i, t: i.ext ? i.t : T(i.t), d: i.d && T(i.d), subs: i.subs?.map(T), href: i.ext ? i.href : L(i.href) })) })) }));
  const ui = Object.fromEntries(["Login", "Book a Call", "Open menu", "Close menu", "Menu", "Contact", "Login / Sign up", "Featured", "Explore", "View all", "Quick chat:", "Call", "Language", "Main", "Skip to content", "Home", "Stag Prime home"].map(k => [k, T(k)]));
  const banner = Object.fromEntries(locales.map(l => [l, l]));
  const css = themeCss(site.theme), fonts = googleFontsHref(site.theme), cfg = trackingConfig(site.tracking);
  return (
    <html lang={locale} dir={rtlLocales.includes(locale) ? "rtl" : "ltr"} className={`${display.variable} ${body.variable}`} style={SCRIPT[locale] ? { ["--font-script" as string]: SCRIPT[locale] } : undefined}>
      {/* bn/ar/hi use the device script face at every width (globals.css). Unbounded has no glyphs for those scripts, and its tight metrics clip them. */}
      <head>{fonts && <link rel="stylesheet" href={fonts} />}<style dangerouslySetInnerHTML={{ __html: css }} /></head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd()) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd(locale)) }} />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[80] focus:bg-white focus:text-navy-900 focus:px-4 focus:py-2 focus:rounded">{ui["Skip to content"]}</a>
        <LangBanner locale={locale} names={localeNames} labels={Object.fromEntries(Object.keys(banner).map(l => [l, { q: tq(l), yes: ty(l), no: tn(l) }]))} />
        <Header nav={tNav} ui={ui} locale={locale} names={localeNames} brand={{ emblem: site.brand.emblem, contact: { whatsapp: site.contact.whatsapp, telegram: site.contact.telegram, tel: site.contact.tel, phone: site.contact.phone, telegramHandle: site.contact.telegramHandle } }} />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer />
        <ContactDock />
            {site.consent.enabled && <Consent policy={L("/privacy")} t={consentT()} cfg={cfg} />}
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
// Bengali / Arabic / Hindi use the device's own script fonts (Noto ships on Android/ChromeOS; Windows & Apple have native faces).
// Downloading 110–170 KB web fonts for these scripts pushed mobile LCP past 4 s; system faces render instantly.
const SCRIPT: Record<string, string> = {
  ar: '"Noto Sans Arabic","Segoe UI","Geeza Pro",Tahoma,sans-serif',
  bn: '"Noto Sans Bengali","Nirmala UI","Bangla Sangam MN",Vrinda,sans-serif',
  hi: '"Noto Sans Devanagari","Nirmala UI","Kohinoor Devanagari",Mangal,sans-serif',
};
const tq = (l: string) => Q[l][0], ty = (l: string) => Q[l][1], tn = (l: string) => Q[l][2];

/** WebSite + SearchAction (sitelinks search box) → /{locale}/search?q= */
function websiteLd(locale: string) {
  const { brand } = S();
  return { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE}/#website`, name: brand.name, alternateName: "Stag Prime", url: `${SITE}/${locale}`, inLanguage: locale, publisher: { "@id": `${SITE}/#org` },
    potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${SITE}/${locale}/search?q={search_term_string}` }, "query-input": "required name=search_term_string" } };
}
