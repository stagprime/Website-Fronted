import { L, T, getLoc } from "@/lib/loc";
import { primeSite } from "@/lib/site";
// No headers() here: it turned notFound() on static/ISR pages (e.g. /en/services/unknown) into a 500. The [locale] layout already set the request locale.
export async function generateMetadata() { const l = getLoc(); await primeSite(l); return { title: { absolute: `${T("Page not found")} (404) | Stag Prime` }, robots: { index: false } }; }
export default function NotFound() {
  return (<section className="relative min-h-[80vh] grid place-items-center px-5 pt-32 pb-20 text-center overflow-hidden">
    <div className="absolute inset-0 grid-bg" /><div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[32rem] h-[32rem] rounded-full bg-sky-brand/20 blur-[120px]" />
    <div className="relative"><img src="/emblem.svg" alt="" className="mx-auto h-28 w-auto opacity-90" />
      <p className="mt-8 font-display text-8xl sm:text-9xl font-extrabold grad-text">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-white">{T("This trail has gone cold.")}</h1>
      <p className="mt-3 text-slate-300 max-w-md mx-auto">{T("The page you're looking for moved or never existed. Try one of these instead:")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">{[["Home", "/"], ["Services", "/services"], ["Store", "/store"], ["Blog", "/blog"], ["Contact", "/contact"]].map(([n, h]) => <a key={h} href={L(h)} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:border-sky-brand">{T(n)}</a>)}</div></div>
  </section>);
}
