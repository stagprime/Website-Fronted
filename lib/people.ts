import { SITE } from "./i18n";
import { S } from "./site";
/** Founder (Admin → Content → Founder). Call inside a request after useParamsLoc. */
export const founderOf = () => S().founder;
export const founderLd = () => { const f = S().founder; return { "@context": "https://schema.org", "@type": "Person", "@id": `${SITE}/#founder`, name: f.name, jobTitle: f.jobTitle, worksFor: { "@id": `${SITE}/#org` }, url: `${SITE}/en/about`, ...(f.image && { image: f.image.startsWith("http") ? f.image : `${SITE}${f.image}` }), ...(f.linkedin && { sameAs: [f.linkedin] }), knowsAbout: ["Digital marketing", "SEO", "App development", "SaaS", "Amazon KDP", "Print-on-demand", "VPN infrastructure"] }; };
