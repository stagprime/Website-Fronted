import Icon from "@/components/Icon";
import { loadLoc, L, T, TT, getLoc } from "@/lib/loc";
import { seoMeta } from "@/lib/seo";
import Image from "next/image";
import t0 from "@/messages/en.json";
import { S } from "@/lib/site";
import Blocks from "@/components/Blocks";
import { pageDoc, txt, defaultHome } from "@/lib/cms/page";
import { CursorGlow, Counter } from "@/components/Fx";
import Art from "@/components/Art";
import { Kicker, wrap, Btn, JsonLd, R } from "@/components/ui";
import { breadcrumb } from "@/lib/seo";
import { ai, merch, vpn, storeOf } from "@/lib/art";

function Badge() {
  const txt = getLoc() === "en" ? "STAG PRIME • BOOK A CALL • GROWTH PARTNER • " : "STAG PRIME • STAG PRIME • STAG PRIME • ";
  return (
    <a href={L("/contact")} data-cursor={T("Book")} aria-label={T("Book a free strategy call")} className="group relative grid place-items-center w-36 h-36 sm:w-44 sm:h-44">
      <svg viewBox="0 0 200 200" className="badge-ring absolute inset-0" aria-hidden><defs><path id="bc" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
        <text fill="#cfe9f7" fontSize="13.5" letterSpacing="2" fontFamily="var(--font-display)"><textPath href="#bc" textLength="486" lengthAdjust="spacing">{txt}</textPath></text></svg>
      <span className="grid place-items-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-sky-brand to-blue-brand shadow-xl shadow-sky-brand/40 group-hover:scale-110 transition"><img src="/emblem.svg" alt="" className="h-12 sm:h-14 w-auto" /></span>
    </a>
  );
}
const SecHead = ({ k, title, light }: { k: string; title: React.ReactNode; light?: boolean }) => (
  <div data-up><Kicker light={light}>{TT(k)}</Kicker><h2 className={`font-display text-[2.1rem] sm:text-6xl font-bold leading-[1.02] tracking-tight ${light ? "text-navy-900" : "text-white"}`}><R>{title}</R></h2></div>
);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); return { ...await seoMeta("/", t0.meta.title, t0.meta.description), title: { absolute: T(t0.meta.title) } }; }
export default async function Home({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params);
  const { services, ventures, products, stores, process, profiles, partners, contact: CONTACT } = S();
  // CMS: Admin → Pages → Home controls section order/visibility, copy per locale and extra blocks.
  const doc = pageDoc("home") ?? defaultHome(); const sec = (id: string) => doc.find(x => x.type === "legacy" && x.id === id);
  const H = (id: string, f: string, d: string) => txt(sec(id), f, d);
  const heroTitle = sec("hero")?.content?.[getLoc()]?.title || sec("hero")?.content?.en?.title ? H("hero", "title", "") : "";
  const hero = ai("hero-collage"), studio = ai("manifesto-studio");
  const ventureImg: Record<string, { src: string | null; w: number; h: number; alt: string }> = {
    "stag-vpn": { src: vpn("site-phone").web, w: 1000, h: 873, alt: "Stag VPN Android app shown on two phones" },
    "print-on-demand": { src: merch[2].web, w: 324, h: 324, alt: `${merch[2].alt} — Stag Prime design on Zazzle` },
    media: { src: ai("svc-amazon-youtube-automation"), w: 1024, h: 768, alt: "Concept art of books and a video play screen representing KDP and YouTube" },
    software: { src: ai("store-digital"), w: 1024, h: 768, alt: "Concept art of a code script, UI kit and template stack" },
  };
  const stats: [string, string, string][] = S().homeStats.map(x => [x.value, x.label, x.tilt]);
  const legacy: Record<string, React.ReactNode> = {
    hero: (
      <section className="home-hero relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 grid-bg" />
          <CursorGlow />
          <div className="absolute inset-y-0 end-0 h-full w-full lg:w-[46%] opacity-80 lg:opacity-100" data-parallax="8">
            <Art src={hero} alt={T("Stag Prime shield emblem surrounded by app, analytics and video icons")} w={1024} h={768} priority sizes="(max-width:1024px) 100vw, 46vw" className="h-full w-full !object-[72%_center]" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/75 to-navy-950/10 rtl:bg-gradient-to-l" /><div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-navy-950/30" />
          </div>
        </div>
        <div className={`${wrap} hero-copy relative w-full pt-28 sm:pt-32 pb-16 sm:pb-20`}>
          <span className="inline-flex max-w-full items-center gap-2 rounded-full glass px-4 py-1.5 text-xs leading-relaxed text-slate-300"><span className="h-2 w-2 shrink-0 rounded-full bg-area-lime pulse-ring" />{H("hero", "badge", "US LLC · Global in-house team · Est. operators")}</span>
          {heroTitle ? <h1 data-split className="mt-6 font-display font-extrabold text-white text-4xl leading-snug sm:text-6xl lg:text-7xl max-w-3xl">{heroTitle}</h1> : getLoc() !== "en" ? <h1 data-split className="mt-6 font-display font-extrabold text-white text-4xl leading-snug sm:text-6xl lg:text-7xl max-w-3xl">{T("We Build, Scale, and We Dominate.")}</h1> : <h1 data-split className="mt-6 font-display font-extrabold text-white text-4xl leading-[1.08] sm:text-6xl lg:text-7xl max-w-3xl">
            We Build, Scale, and We{" "}
            <span className="inline-flex items-center align-middle">D<span aria-hidden className="mx-[.04em] inline-block h-[.62em] w-[1.25em] rounded-full bg-gradient-to-r from-sky-brand to-blue-brand align-middle shadow-[0_0_40px_rgba(72,189,237,.6)] relative overflow-hidden"><img src="/emblem.svg" alt="" className="absolute left-1/2 top-1/2 h-[80%] -translate-x-1/2 -translate-y-1/2" /></span><span className="sr-only">o</span>minate.</span>
          </h1>}
          <div className="mt-10 grid max-w-3xl sm:grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <p className="max-w-xl text-lg text-slate-300 leading-relaxed">{H("hero", "sub", t0.hero.sub)}</p>
              <div className="mt-8 flex flex-wrap gap-4"><Btn href="/contact">{H("hero", "cta1", t0.hero.cta1)} →</Btn><Btn href="/services" ghost>{H("hero", "cta2", t0.hero.cta2)}</Btn></div>
            </div>
            <Badge />
          </div>
        </div>
      </section>
    ),
    proof: (
      <section aria-label={T("Profiles and platforms")} className="border-y border-white/10 bg-navy-900/70">
        <div className={`${wrap} py-7 flex flex-col md:flex-row md:items-center gap-5`}>
          <p className="shrink-0 font-display text-[11px] tracking-[.3em] uppercase text-slate-500">{H("proof", "label", "Operating on")}</p>
          <ul className="flex flex-wrap gap-x-8 gap-y-3 font-display text-sm sm:text-base uppercase tracking-[.12em] text-slate-300">
            {[...partners.marketplaces, "Shopify", "Google Ads", "Google Play"].map(p => <li key={p}>{TT(p)}</li>)}
          </ul>
          <ul className="md:ml-auto flex gap-3 text-xs">{profiles.slice(0, 2).map(p => <li key={p.n}><a href={p.u} target="_blank" rel="noopener" className="rounded-full border border-white/15 px-3 py-1.5 text-slate-300 hover:text-white">{p.n} ↗</a></li>)}</ul>
        </div>
      </section>
    ),
    about: (
      <section className="relative overflow-hidden">
        <div className={`${wrap} py-28 sm:py-40 grid lg:grid-cols-[1.4fr_1fr] gap-14 items-center`}>
          <div>
            <Kicker>{H("about", "kicker", "Our Manifesto")}</Kicker>
            <p data-light className="font-display text-[1.75rem] sm:text-5xl font-bold leading-[1.15] text-white">{H("about", "title", "Operators, not just an agency. We scaled our own print-on-demand network, built and sold our own VPN app, and run our own media channels. The strategies that grew our businesses are the ones we bring to yours.")}</p>
            <div className="mt-10"><a href={L("/about")} data-cursor={T("Read")} className="font-semibold text-sky-brand">{T("Our story")} →</a></div>
          </div>
          <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/10" data-up>
            <div data-parallax="10" className="absolute inset-0 scale-110"><Art src={studio} alt="Silhouettes of a team working at glowing monitors in a dark studio" w={1024} h={576} className="h-full w-full" /></div>
            <div className="absolute inset-0 bg-[#0E2346] mix-blend-multiply opacity-40" />
          </div>
        </div>
      </section>
    ),
    services: (
      <section className="bg-slate-50 text-navy-900">
        <div className={`${wrap} py-24 sm:py-32`}>
          <div className="flex flex-wrap justify-between items-end gap-6"><SecHead light k={H("services", "kicker", "What We Do")} title={<>{T("The complete")}<br />{T("growth stack.")}</>} /><a href={L("/services")} className="font-semibold text-blue-brand">{T("All services")} →</a></div>
          <div className="mt-14 grid gap-5 md:grid-cols-6">
            {services.map((s, i) => {
              const img = ai(`svc-${s.slug}`);
              return (
                <a key={s.slug} href={L(`/services/${s.slug}`)} data-cursor={T("Explore")} data-up className={`group relative overflow-hidden rounded-[1.75rem] bg-navy-900 text-white ${i < 2 ? "md:col-span-3 min-h-[24rem]" : i === 5 ? "md:col-span-6 min-h-[18rem]" : "md:col-span-2 min-h-[22rem]"}`}>
                  <Art src={img} alt={`${T(s.title)} concept art`} w={1024} h={768} color={s.color} sizes="(max-width:768px) 100vw, 50vw" className="absolute inset-0 h-full w-full opacity-70 group-hover:opacity-90 group-hover:scale-105 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-transparent" />
                  <div className="relative h-full flex flex-col justify-end p-7 sm:p-8">
                    <span className="grid place-items-center w-11 h-11 rounded-2xl backdrop-blur" style={{ background: `${s.color}33` }}><Icon name={s.icon} color={s.color} /></span>
                    <h3 className={`mt-4 font-display font-bold ${i < 2 ? "text-2xl sm:text-3xl" : "text-xl"}`}>{T(s.title)}</h3>
                    <p className="mt-2 text-sm text-slate-300 max-w-md">{s.subs.map(x => x.t.split(" (")[0]).join(" · ")}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    ),
    ventures: (
      <section className="py-24 sm:py-32 overflow-hidden">
        <div className={`${wrap} flex flex-wrap justify-between items-end gap-6`}><SecHead k={H("ventures", "kicker", "Our Ecosystem")} title={<>{T("We practice")}<br />{T("what we preach.")}</>} /><a href={L("/ventures")} className="font-semibold text-sky-brand">{T("All ventures")} →</a></div>
        <div className="rail mt-14 flex gap-6 overflow-x-auto px-5 sm:px-8 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))] pb-4">
          {ventures.map((v, i) => { const im = ventureImg[v.slug]; return (
            <a key={v.slug} href={L(v.slug === "stag-vpn" ? "/portfolio/stag-vpn" : `/ventures/${v.slug}`)} data-cursor={T("View")} className="group shrink-0 w-[82vw] sm:w-[30rem]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/10 bg-navy-800">
                <Art src={im.src} alt={im.alt} w={im.w} h={im.h} color={v.color} sizes="(max-width:640px) 82vw, 30rem" className="h-full w-full group-hover:scale-105 transition duration-700" />
                <span className="absolute top-4 left-4 rounded-full bg-navy-950/80 backdrop-blur px-3 py-1 font-mono text-xs text-sky-brand">SP-{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="mt-5 flex items-start justify-between gap-4"><div><h3 className="font-display text-xl font-bold text-white">{T(v.title)}</h3><p className="mt-1 text-sm text-slate-400">{T(v.tag)} · {T(v.short)}</p></div><span className="mt-1 text-sky-brand group-hover:translate-x-1 transition">→</span></div>
            </a>); })}
        </div>
      </section>
    ),
    process: (
      <section data-hscroll className="relative bg-navy-900 border-y border-white/5 overflow-hidden">
        <div className="lg:h-screen flex flex-col justify-center py-24 lg:py-0">
          <div className={`${wrap} w-full`}><SecHead k={H("process", "kicker", "How We Work")} title="From audit to scale." /></div>
          <div data-track className="mt-12 flex flex-col lg:flex-row gap-6 px-5 sm:px-8 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:w-max">
            {process.map(([h, d], i) => (
              <article key={h} className="lg:w-[34rem] shrink-0 rounded-[1.75rem] border border-white/10 bg-navy-950/60 p-8 sm:p-10 lg:min-h-[22rem] flex flex-col">
                <span className="font-display text-7xl sm:text-8xl font-extrabold grad-text leading-none">0{i + 1}</span>
                <h3 className="mt-auto pt-10 font-display text-3xl font-bold text-white">{TT(h)}</h3><p className="mt-3 text-lg text-slate-400">{TT(d)}</p>
              </article>
            ))}
            <a href={L("/contact")} data-cursor={T("Start")} className="lg:w-[24rem] shrink-0 rounded-[1.75rem] bg-gradient-to-br from-sky-brand to-blue-brand p-10 flex flex-col justify-end text-white lg:min-h-[22rem]"><span className="font-display text-3xl font-bold">{T("Start with a free strategy call")} →</span></a>
          </div>
        </div>
      </section>
    ),
    stats: (
      <section className={`${wrap} py-24 sm:py-32`}>
        <SecHead k={H("stats", "kicker", "Proof in Numbers")} title={<>{T("Built on our")}<br />{T("own results.")}</>} />
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stats.map(([n, l, r]) => (
            <div key={l} data-up className="tilt rounded-[1.5rem] bg-white text-navy-900 p-6 sm:p-9 shadow-2xl shadow-black/30" style={{ ["--r" as string]: r }}>
              <div className="font-display text-3xl sm:text-6xl font-extrabold tracking-tight"><Counter value={n} /></div><p className="mt-3 text-xs sm:text-sm uppercase tracking-[.15em] text-slate-500">{TT(l)}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 rounded-[1.75rem] border border-white/10 p-7 sm:p-10 flex flex-wrap items-center justify-between gap-6">
          <p className="font-display text-xl sm:text-2xl text-white max-w-2xl">{T("Read independent reviews of our work — or leave one after your project.")}</p>
          <div className="flex flex-wrap gap-3">{profiles.map(p => <a key={p.n} href={p.u} target="_blank" rel="noopener" data-cursor={T("Open")} className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 hover:text-white hover:border-sky-brand">{p.n} ↗</a>)}</div>
        </div>
      </section>
    ),
    store: (
      <section className="bg-slate-50 text-navy-900">
        <div className={`${wrap} py-24 sm:py-32 grid lg:grid-cols-[1fr_1.2fr] gap-14 items-center`}>
          <div>
            <SecHead light k={H("store", "kicker", "Our Store")} title={<>{T("Tools, templates")}<br />{T("& real merch.")}</>} />
            <ul className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
              {products.map(p => <li key={p.slug}><a href={L(`/store#${p.slug}`)} data-cursor={T("Buy")} className="flex items-center justify-between py-4 hover:text-blue-brand"><span className="font-semibold">{p.n}</span><span className="font-display">{p.p}</span></a></li>)}
            </ul>
            <div className="mt-8 flex flex-wrap gap-4"><a href={L("/store")} className="rounded-full bg-navy-900 px-6 py-3 font-semibold text-white">{T("Visit the store")} →</a><a href={L("/ventures/print-on-demand")} className="rounded-full border border-slate-300 px-6 py-3 font-semibold">{T("Merch network")}</a></div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {merch.slice(0, 9).map((m, i) => (
              <a key={m.web} href={m.link} target="_blank" rel="noopener" data-cursor={T("Shop")} className={`group relative block overflow-hidden rounded-2xl bg-white border border-slate-200 ${i % 3 === 1 ? "translate-y-6" : ""}`}>
                <Image src={m.web} alt={`${m.alt} — Stag Prime design on ${storeOf(m.link)}`} width={m.w} height={m.h} sizes="(max-width:1024px) 30vw, 14rem" className="aspect-square w-full object-cover group-hover:scale-105 transition duration-500" />
                <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-navy-900">{storeOf(m.link)} ↗</span>
              </a>
            ))}
          </div>
        </div>
        <div className={`${wrap} pb-16 flex flex-wrap gap-3`}>{stores.map(s => <a key={s.n} href={s.u} target="_blank" rel="noopener" className="rounded-full border border-slate-300 px-4 py-2 text-sm hover:border-blue-brand hover:text-blue-brand">{s.n} ↗</a>)}</div>
      </section>
    ),
    cta: (
      <section className="relative overflow-hidden py-20 sm:py-28 border-t border-white/5">
        <a href={L("/contact")} data-cursor={T("Let's talk")} aria-label={T("Start your project — contact Stag Prime")} className="block">
          <div dir="ltr" className="flex w-max mq">
            {Array.from({ length: 2 }).map((_, k) => <span key={k} aria-hidden className="flex items-center gap-10 pr-10 font-display font-extrabold text-[17vw] sm:text-[11vw] leading-none text-white whitespace-nowrap">
              {H("cta", "w1", "LET'S BUILD")} <img src="/emblem.svg" alt="" className="h-[.7em] w-auto" /> <span className="grad-text">{H("cta", "w2", "LET'S SCALE")}</span> <img src="/emblem.svg" alt="" className="h-[.7em] w-auto" /> {H("cta", "w3", "LET'S DOMINATE")} <img src="/emblem.svg" alt="" className="h-[.7em] w-auto" /></span>)}
          </div>
        </a>
        <div className={`${wrap} mt-12 flex flex-wrap items-center justify-center gap-4`}>
          <a href={CONTACT.whatsapp} target="_blank" rel="noopener" className="rounded-full bg-[#178a3e] px-7 py-3.5 font-semibold text-white">{T("WhatsApp")}</a>
          <a href={CONTACT.telegram} target="_blank" rel="noopener" className="rounded-full bg-[#1b6fa0] px-7 py-3.5 font-semibold text-white">Telegram {CONTACT.telegramHandle}</a>
          <a href={CONTACT.tel} className="rounded-full bg-white px-7 py-3.5 font-semibold text-navy-900">{T("Call")} <span dir="ltr">{CONTACT.phone}</span></a>
          <a href={L("/contact")} className="rounded-full border border-sky-brand/40 px-7 py-3.5 font-semibold text-sky-brand">{T("Send a brief")}</a>
        </div>
      </section>
    ),
  };
  return (
    <>
      <JsonLd data={breadcrumb([])} />
      

      <Blocks sections={doc} legacy={legacy} />
    </>
  );
}
