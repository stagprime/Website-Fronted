/**
 * Section-block model shared by the admin page builder and the frontend renderer (components/Blocks.tsx).
 * A page document (Prisma `Page.sections`, JSON text) is an ordered Section[]. Text fields marked `i18n` are stored per locale in
 * `content[locale]`; a missing locale falls back to the English override, then to the code default run through T() (existing translations).
 */
export type FieldKind = "text" | "textarea" | "md" | "url" | "image" | "number" | "bool" | "color" | "select" | "list" | "html";
export type Field = { key: string; label: string; kind: FieldKind; i18n?: boolean; options?: string[]; item?: Field[]; help?: string; placeholder?: string };
export type Section = { id: string; type: string; visible: boolean; settings: Record<string, unknown>; content: Record<string, Record<string, unknown>>; label?: string; schedule?: { from?: string; to?: string }; locales?: string[] };
export type BlockDef = { type: string; name: string; icon: string; fields: Field[]; ownerOnly?: boolean; desc: string };

const t = (key: string, label: string, kind: FieldKind = "text", i18n = true, extra: Partial<Field> = {}): Field => ({ key, label, kind, i18n, ...extra });

export const BLOCKS: BlockDef[] = [
  { type: "hero", name: "Hero", icon: "★", desc: "Big headline with two buttons and an optional image", fields: [t("eyebrow", "Eyebrow"), t("title", "Title"), t("sub", "Subtitle", "textarea"), t("cta1", "Primary button label"), t("cta1Href", "Primary button link", "url", false), t("cta2", "Secondary button label"), t("cta2Href", "Secondary button link", "url", false), t("image", "Background image", "image", false)] },
  { type: "richText", name: "Rich text", icon: "¶", desc: "Heading + markdown body (## headings, lists, **bold**, [links](/path))", fields: [t("kicker", "Kicker"), t("heading", "Heading"), t("body", "Body (markdown)", "md"), t("light", "Light background", "bool", false)] },
  { type: "cta", name: "Call to action", icon: "➜", desc: "Contact CTA card with WhatsApp / Telegram / call buttons", fields: [t("title", "Title"), t("sub", "Text", "textarea"), t("marquee", "Show marquee strip", "bool", false)] },
  { type: "faq", name: "FAQ", icon: "?", desc: "Accordion of questions (emits FAQPage schema)", fields: [t("heading", "Heading"), t("items", "Questions", "list", true, { item: [t("q", "Question"), t("a", "Answer", "textarea")] }), t("useGlobal", "Use global FAQ list (Store → FAQ)", "bool", false)] },
  { type: "services", name: "Services grid", icon: "▦", desc: "Cards for the services (from Store → Services)", fields: [t("kicker", "Kicker"), t("heading", "Heading"), t("only", "Only these slugs (comma separated, empty = all)", "text", false)] },
  { type: "packages", name: "Gig packages", icon: "▤", desc: "Basic / Standard / Premium packages of one service", fields: [t("svc", "Service slug", "text", false), t("color", "Accent color", "color", false)] },
  { type: "products", name: "Products", icon: "◫", desc: "Store products of one category", fields: [t("heading", "Heading"), t("cat", "Category slug (empty = all)", "text", false), t("limit", "Max items", "number", false)] },
  { type: "testimonials", name: "Testimonials", icon: "❝", desc: "Quotes from clients", fields: [t("heading", "Heading"), t("items", "Quotes", "list", true, { item: [t("quote", "Quote", "textarea"), t("name", "Name"), t("role", "Role / company")] })] },
  { type: "stats", name: "Stats", icon: "#", desc: "Row of big numbers", fields: [t("items", "Stats", "list", true, { item: [t("value", "Value"), t("label", "Label")] })] },
  { type: "steps", name: "Process steps", icon: "→", desc: "Numbered steps", fields: [t("kicker", "Kicker"), t("heading", "Heading"), t("items", "Steps", "list", true, { item: [t("title", "Title"), t("text", "Text", "textarea")] })] },
  { type: "image", name: "Image", icon: "▣", desc: "Single image with caption", fields: [t("src", "Image", "image", false), t("alt", "Alt text"), t("caption", "Caption"), t("wide", "Full width", "bool", false)] },
  { type: "gallery", name: "Gallery", icon: "▥", desc: "Grid of images", fields: [t("heading", "Heading"), t("images", "Images", "list", false, { item: [t("src", "Image", "image", false), t("alt", "Alt text", "text", false)] })] },
  { type: "form", name: "Form", icon: "✎", desc: "Embed a form from Forms", fields: [t("heading", "Heading"), t("formKey", "Form key", "text", false)] },
  { type: "contactInfo", name: "Contact info", icon: "☎", desc: "Phone, WhatsApp, Telegram, emails and offices from Branding → Contact", fields: [t("heading", "Heading")] },
  { type: "marquee", name: "Marquee", icon: "≋", desc: "Giant scrolling text link", fields: [t("text", "Text"), t("href", "Link", "url", false)] },
  { type: "video", name: "Video embed", icon: "▶", desc: "YouTube / Vimeo embed", fields: [t("title", "Title"), t("url", "YouTube or Vimeo URL", "url", false)] },
  { type: "html", name: "Custom HTML", icon: "</>", desc: "Raw HTML (admins/owner only; scripts are stripped)", ownerOnly: true, fields: [t("html", "HTML", "html", false)] },
  { type: "spacer", name: "Spacer", icon: "↕", desc: "Vertical space", fields: [t("size", "Size", "select", false, { options: ["sm", "md", "lg"] })] },
];
export const blockDef = (type: string) => BLOCKS.find(b => b.type === type);

/** Built-in (coded) sections of a page that can be reordered/hidden and have editable copy. */
export type LegacyDef = { id: string; name: string; fields: Field[] };
export const HOME_SECTIONS: LegacyDef[] = [
  { id: "hero", name: "Hero", fields: [t("badge", "Badge line"), t("title", "Headline (empty = designed default)"), t("sub", "Subtitle", "textarea"), t("cta1", "Primary button"), t("cta2", "Secondary button")] },
  { id: "proof", name: "Platforms strip", fields: [t("label", "Label")] },
  { id: "about", name: "Manifesto", fields: [t("kicker", "Kicker"), t("title", "Manifesto text", "textarea")] },
  { id: "services", name: "Services bento", fields: [t("kicker", "Kicker")] },
  { id: "ventures", name: "Ventures rail", fields: [t("kicker", "Kicker")] },
  { id: "process", name: "Process (horizontal scroll)", fields: [t("kicker", "Kicker")] },
  { id: "stats", name: "Stats (numbers: Content → Home stats)", fields: [t("kicker", "Kicker")] },
  { id: "store", name: "Store teaser", fields: [t("kicker", "Kicker")] },
  { id: "cta", name: "Giant marquee CTA", fields: [t("w1", "Word 1"), t("w2", "Word 2 (gradient)"), t("w3", "Word 3")] },
];
export const PAGE_HERO_FIELDS: Field[] = [t("kicker", "Kicker"), t("title", "Title"), t("sub", "Subtitle", "textarea"), t("image", "Hero image (empty = default)", "image", false)];

export const uid = () => Math.random().toString(36).slice(2, 10);
export function parseSections(json: string | null | undefined): Section[] | null {
  if (!json) return null; try { const v = JSON.parse(json); return Array.isArray(v) ? v as Section[] : null; } catch { return null; }
}
/** Is the section live right now for this locale? */
export function isLive(s: Section, locale: string, now = Date.now()) {
  if (!s.visible) return false;
  if (s.locales?.length && !s.locales.includes(locale)) return false;
  if (s.schedule?.from && Date.parse(s.schedule.from) > now) return false;
  if (s.schedule?.to && Date.parse(s.schedule.to) < now) return false;
  return true;
}
/** Strip scripts / inline handlers from admin-provided HTML. */
/** Allow-list HTML sanitizer for the admin "HTML" block: unknown tags dropped (text kept), script/style/etc. removed with content,
 *  only safe attributes kept, URLs must be http(s)/relative/mailto/tel, iframes only from YouTube/Vimeo. */
const OK_TAGS = new Set("a abbr b blockquote br caption code div em figcaption figure h2 h3 h4 h5 h6 hr i img li ol p pre s small span strong sub sup table tbody td th thead tr u ul iframe".split(" "));
const OK_ATTR = new Set("href src alt title class width height target rel loading allow allowfullscreen frameborder colspan rowspan".split(" "));
const IFRAME_HOST = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)\//i;
const decode = (v: string) => v.replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);?/g, (_, d) => String.fromCodePoint(+d)).replace(/&colon;/gi, ":").replace(/&tab;|&newline;/gi, "");
const safeUrl = (v: string) => { const u = decode(v).replace(/[\u0000-\u0020\u007f]+/g, ""); return /^(https?:|mailto:|tel:|\/(?!\/)|#)/i.test(u) ? u : null; };
const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export function cleanHtml(h: string) {
  return h.replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|template|textarea|title|xmp|object|embed|svg|math)\b[\s\S]*?(<\/\1\s*>|$)/gi, "")
    .replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>?/g, (_, close: string, tag: string, attrs: string) => {
      const t = tag.toLowerCase(); if (!OK_TAGS.has(t)) return "";
      if (close) return `</${t}>`;
      const out: string[] = [];
      for (const m of attrs.matchAll(/([^\s"'>\/=]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
        const a = m[1].toLowerCase(); if (!OK_ATTR.has(a)) continue; let v = m[3] ?? m[4] ?? m[5] ?? "";
        if (a === "href" || a === "src") { const u = safeUrl(v); if (!u || (t === "iframe" && !IFRAME_HOST.test(u))) continue; v = u; }
        out.push(`${a}="${esc(decode(v))}"`);
      }
      if (t === "iframe" && !out.some(x => x.startsWith("src="))) return "";
      if (t === "a" && out.some(x => x === 'target="_blank"')) out.push('rel="noopener noreferrer"');
      return `<${t}${out.length ? " " + out.join(" ") : ""}>`;
    });
}
