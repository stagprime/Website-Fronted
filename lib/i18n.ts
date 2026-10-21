export const locales = ["en", "bn", "ar", "es", "fr", "de", "hi"] as const;
export const defaultLocale = "en";
export const rtlLocales = ["ar"];
export type Locale = (typeof locales)[number];
export const localeNames: Record<string, string> = { en: "English", bn: "বাংলা", ar: "العربية", es: "Español", fr: "Français", de: "Deutsch", hi: "हिन्दी" };
export const ogLocale: Record<string, string> = { en: "en_US", bn: "bn_BD", ar: "ar_AR", es: "es_ES", fr: "fr_FR", de: "de_DE", hi: "hi_IN" };
// Country (ISO-3166) → suggested locale, used only for the suggestion banner (never auto-redirect on geo).
export const geoLocale: Record<string, string> = { BD: "bn", IN: "hi", SA: "ar", AE: "ar", EG: "ar", QA: "ar", KW: "ar", JO: "ar", MA: "ar", ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", FR: "fr", BE: "fr", SN: "fr", CI: "fr", DE: "de", AT: "de", CH: "de" };
export const SITE = "https://www.stagprime.com";
export const CONTACT = {
  phone: "+1 307-396-4184", tel: "tel:+13073964184",
  whatsapp: "https://wa.me/13073964184", telegram: "https://t.me/stagprime",
  email: "brand@stagprime.com", support: "support@stagprime.com",
};
