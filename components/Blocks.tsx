/**
 * Frontend renderer for CMS section blocks (lib/cms/blocks.ts). Built-in "legacy" sections of coded pages are passed in via `legacy`
 * and rendered in the order/visibility stored in the page document.
 */
import { Fragment } from "react";
import { getLoc, L, T } from "@/lib/loc";
import { S } from "@/lib/site";
import { isLive, cleanHtml, type Section } from "@/lib/cms/blocks";
import { txt, list, setting } from "@/lib/cms/page";
import { Kicker, wrap, Btn, JsonLd, Marquee } from "@/components/ui";
import CtaCard from "@/components/CtaCard";
import Md from "@/components/Md";
import Icon from "@/components/Icon";
import { GigPackages } from "@/components/Gig";
import { ProductCard } from "@/components/Store";
import { CmsForm, type CmsField } from "@/components/CmsForm";
import { formByKey } from "@/lib/cms/forms";
import { db } from "@/lib/db";

const sp = { sm: "h-8", md: "h-16", lg: "h-32" } as Record<string, string>;
const H = ({ k, h, light }: { k?: string; h?: string; light?: boolean }) => <>{k && <Kicker light={light}>{k}</Kicker>}{h && <h2 className={`font-display text-3xl sm:text-5xl font-bold leading-[1.1] tracking-tight ${light ? "text-navy-900" : "text-white"}`}>{h}</h2>}</>;
const img = (src?: string) => !src ? "" : src;
/** Per-locale alt text from the media library (Media.alt JSON {locale: text}) for /media/<path> URLs; falls back to English. */
async function mediaAlts(srcs: string[]): Promise<Record<string, string>> {
  const paths = srcs.filter(u => u?.startsWith("/media/")).map(u => decodeURIComponent(u.slice(7).split("?")[0])); if (!paths.length) return {};
  const loc = getLoc(); const rows = await db.media.findMany({ where: { path: { in: paths } }, select: { path: true, alt: true } }).catch(() => []);
  return Object.fromEntries(rows.map(r => { let a: Record<string, string> = {}; try { a = JSON.parse(r.alt || "{}"); } catch { /* bad json */ } return [`/media/${r.path}`, a[loc] || a.en || ""]; }));
}
function yt(u: string) { const m = u.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/); if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`; const v = u.match(/vimeo\.com\/(\d+)/); return v ? `https://player.vimeo.com/video/${v[1]}` : ""; }

export async function Block({ s }: { s: Section }) {
  const l = getLoc(); const site = S();
  switch (s.type) {
    case "hero": { const bg = img(setting(s, "image")); return (
      <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44">
        <div className="absolute inset-0 grid-bg" />{bg && <div className="absolute inset-0 opacity-40"><img src={bg} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-navy-950 to-navy-950/30" /></div>}
        <div className={wrap}>{txt(s, "eyebrow", "") && <Kicker>{txt(s, "eyebrow", "")}</Kicker>}
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white leading-[1.05] tracking-tight max-w-4xl">{txt(s, "title", "")}</h1>
          {txt(s, "sub", "") && <p className="mt-6 max-w-2xl text-lg text-slate-300">{txt(s, "sub", "")}</p>}
          <div className="mt-8 flex flex-wrap gap-4">{txt(s, "cta1", "") && <Btn href={setting(s, "cta1Href") || "/contact"}>{txt(s, "cta1", "")}</Btn>}{txt(s, "cta2", "") && <Btn ghost href={setting(s, "cta2Href") || "/services"}>{txt(s, "cta2", "")}</Btn>}</div></div>
      </section>); }
    case "richText": { const light = !!s.settings?.light; return (
      <section className={light ? "bg-slate-50 text-navy-900" : ""}><div className={`${wrap} py-16 max-w-4xl`}><H k={txt(s, "kicker", "")} h={txt(s, "heading", "")} light={light} /><div className={`mt-6 prose-sp ${light ? "text-navy-900" : ""}`}><Md src={txt(s, "body", "")} /></div></div></section>); }
    case "cta": return <CtaCard title={txt(s, "title", "Ready to dominate your market?")} sub={txt(s, "sub", "Join the agency that builds its own empires. Talk to us on WhatsApp, Telegram or call directly.")} marquee={!!s.settings?.marquee} />;
    case "faq": { const items = s.settings?.useGlobal ? site.faqs.map(([q, a]) => ({ q: T(q), a: T(a) })) : list<{ q: string; a: string }>(s, "items");
      return (<section className={`${wrap} py-16 max-w-4xl`}><H h={txt(s, "heading", "Frequently asked questions")} />
        <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map(i => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })) }} />
        <div className="mt-8 grid gap-3">{items.map((i, n) => <details key={n} className="rounded-2xl border border-white/10 p-5"><summary className="cursor-pointer font-semibold text-white">{i.q}</summary><p className="mt-3 text-slate-300">{i.a}</p></details>)}</div></section>); }
    case "services": { const only = (setting(s, "only") || "").split(",").map(x => x.trim()).filter(Boolean); const sv = site.services.filter(x => !only.length || only.includes(x.slug));
      return (<section className={`${wrap} py-16`}><H k={txt(s, "kicker", "")} h={txt(s, "heading", "Services")} />
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{sv.map(x => <a key={x.slug} href={L(`/services/${x.slug}`)} className="glass rounded-3xl p-7 border border-white/10 hover:border-sky-brand/60 transition">
          <Icon name={x.icon} color={x.color} className="w-8 h-8" /><h3 className="mt-4 font-display text-xl font-bold text-white">{T(x.title)}</h3><p className="mt-2 text-sm text-slate-300">{T(x.short)}</p></a>)}</div></section>); }
    case "packages": return setting(s, "svc") ? <GigPackages svc={setting(s, "svc")!} color={setting(s, "color") || "#48BDED"} /> : null;
    case "products": { const cat = setting(s, "cat"); const lim = Number(s.settings?.limit) || 12; const ps = site.products.filter(p => !cat || p.cat === cat).slice(0, lim);
      return (<section className={`${wrap} py-16`}><H h={txt(s, "heading", "")} /><div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{ps.map(p => <ProductCard key={p.slug} p={p} />)}</div></section>); }
    case "testimonials": { const items = list<{ quote: string; name: string; role: string }>(s, "items");
      return (<section className="bg-slate-50 text-navy-900"><div className={`${wrap} py-16`}><H light h={txt(s, "heading", "What clients say")} />
        <div className="mt-8 grid md:grid-cols-3 gap-5">{items.map((i, n) => <figure key={n} className="rounded-3xl bg-white p-7 shadow-sm"><blockquote className="text-slate-700">“{i.quote}”</blockquote><figcaption className="mt-4 font-semibold">{i.name}<span className="block text-sm font-normal text-slate-600">{i.role}</span></figcaption></figure>)}</div></div></section>); }
    case "stats": { const items = list<{ value: string; label: string }>(s, "items");
      return (<section className={`${wrap} py-14`}><dl className="grid grid-cols-2 md:grid-cols-4 gap-6">{items.map((i, n) => <div key={n} className="glass rounded-3xl p-6"><dt className="text-sm text-slate-300">{i.label}</dt><dd className="font-display text-4xl font-extrabold text-white">{i.value}</dd></div>)}</dl></section>); }
    case "steps": { const items = list<{ title: string; text: string }>(s, "items");
      return (<section className={`${wrap} py-16`}><H k={txt(s, "kicker", "")} h={txt(s, "heading", "")} /><ol className="mt-8 grid md:grid-cols-4 gap-5">{items.map((i, n) => <li key={n} className="glass rounded-3xl p-6"><span className="font-display text-sky-brand text-sm">0{n + 1}</span><h3 className="mt-2 font-display text-lg font-bold text-white">{i.title}</h3><p className="mt-2 text-sm text-slate-300">{i.text}</p></li>)}</ol></section>); }
    case "image": { const src = img(setting(s, "src")); if (!src) return null; const alt = txt(s, "alt", "") || (await mediaAlts([src]))[src] || "";
      return (<figure className={`${s.settings?.wide ? "" : wrap} py-10`}><img src={src} alt={alt} className="w-full rounded-3xl" loading="lazy" />{txt(s, "caption", "") && <figcaption className="mt-3 text-center text-sm text-slate-400">{txt(s, "caption", "")}</figcaption>}</figure>); }
    case "gallery": { const ims = (s.settings?.images as { src: string; alt: string }[] | undefined) || []; const ma = await mediaAlts(ims.map(i => i.src));
      return (<section className={`${wrap} py-14`}><H h={txt(s, "heading", "")} /><div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">{ims.filter(i => i.src).map((i, n) => <img key={n} src={i.src} alt={i.alt || ma[i.src] || ""} loading="lazy" className="aspect-square w-full rounded-2xl object-cover" />)}</div></section>); }
    case "form": { const f = await formByKey(setting(s, "formKey") || ""); if (!f) return null;
      return (<section className={`${wrap} py-16 max-w-4xl`}><H h={txt(s, "heading", f.title)} /><div className="mt-8"><CmsForm formKey={f.key} locale={l} fields={f.fields as CmsField[]} submit={f.submit} success={f.success} /></div></section>); }
    case "contactInfo": { const c = site.contact;
      return (<section className={`${wrap} py-16`}><H h={txt(s, "heading", "Contact")} /><div className="mt-8 grid md:grid-cols-3 gap-5 text-slate-300">
        <div className="glass rounded-3xl p-6"><p><a href={c.tel} dir="ltr" className="text-white">{c.phone}</a></p><p className="mt-2"><a href={c.whatsapp} className="text-sky-brand">WhatsApp</a> · <a href={c.telegram} className="text-sky-brand">Telegram {c.telegramHandle}</a></p><p className="mt-2"><a href={`mailto:${c.email}`}>{c.email}</a></p><p><a href={`mailto:${c.support}`}>{c.support}</a></p></div>
        {c.offices.map(o => <address key={o.label} className="glass rounded-3xl p-6 not-italic"><p className="font-semibold text-white">{T(o.label)}</p><p className="mt-2">{T(o.line)}</p></address>)}</div></section>); }
    case "marquee": return <Marquee text={txt(s, "text", "Let's build something big")} href={setting(s, "href") || "/contact"} />;
    case "video": { const u = yt(setting(s, "url") || ""); if (!u) return null;
      return (<section className={`${wrap} py-14 max-w-5xl`}><H h={txt(s, "title", "")} /><div className="mt-6 aspect-video overflow-hidden rounded-3xl border border-white/10"><iframe src={u} title={txt(s, "title", "Video")} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full" /></div></section>); }
    case "html": return <div className={wrap} dangerouslySetInnerHTML={{ __html: cleanHtml(String(s.settings?.html || "")) }} />;
    case "spacer": return <div aria-hidden className={sp[setting(s, "size") || "md"] || sp.md} />;
    default: return null;
  }
}
/** Render a section list. `legacy` maps built-in section ids → JSX; `only` filters (e.g. position). */
export default function Blocks({ sections, legacy = {}, filter }: { sections: Section[]; legacy?: Record<string, React.ReactNode>; filter?: (s: Section) => boolean }) {
  const l = getLoc();
  return <>{sections.filter(s => isLive(s, l) && (!filter || filter(s))).map(s => <Fragment key={s.id}>{s.type === "legacy" ? legacy[s.id] ?? null : <Block s={s} />}</Fragment>)}</>;
}
