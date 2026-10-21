import { L, T, TT } from "@/lib/loc";
import { S } from "@/lib/site";
/** Footer — columns, links, contact, socials and legal links come from Admin → Menus → Footer and Branding. */
export default function Footer() {
  const { footer, services, ventures, socials, profiles, contact: CONTACT, brand } = S();
  const cols: [string, [string, string][]][] = footer.columns.map(c => [c.title, [
    ...(c.source === "services" ? services.map(s => [s.title, `/services/${s.slug}`] as [string, string]) : c.source === "ventures" ? ventures.map(v => [v.title, `/ventures/${v.slug}`] as [string, string]) : []),
    ...c.links.map(x => [x.label, x.href] as [string, string])]]);
  return (
    <footer className="border-t border-white/5 bg-navy-900 pb-24 sm:pb-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <img src={brand.logoWide} alt={`${brand.name} Digital Agency`} className="h-20 w-auto" />
          <p className="mt-4 text-slate-400 text-sm">{T(brand.tagline)}</p>
          <address className="not-italic mt-6 text-sm text-slate-400 space-y-1">
            {CONTACT.offices.map((o, i) => <div key={`${i}-${o.label}`}><p className={`text-white font-semibold ${i ? "pt-3" : ""}`}>{T(o.label)}</p><p>{T(o.line)}</p></div>)}
            <p className="pt-3"><a href={CONTACT.tel} className="hover:text-white" dir="ltr">{CONTACT.phone}</a> · <a href={`mailto:${CONTACT.email}`} className="hover:text-white">{CONTACT.email}</a></p>
            <p><a href={`mailto:${CONTACT.support}`} className="hover:text-white">{CONTACT.support}</a></p>
          </address>
        </div>
        {cols.map(([h, ls]) => (
          <div key={h}><p className="text-white font-semibold mb-4 text-sm">{TT(h)}</p><ul className="space-y-2 text-sm text-slate-400">{ls.map(([n, p]) => <li key={p}><a href={L(p)} className="hover:text-white">{TT(n)}</a></li>)}</ul></div>
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 pb-8 flex flex-wrap gap-2">
        {footer.showSocials && [...socials, ...profiles.map(p => [p.n, p.u])].map(([n, u], si) => <a key={`${si}-${n}`} href={u} target="_blank" rel="noopener" className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400 hover:text-white hover:border-sky-brand">{TT(n)}</a>)}
      </div>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 flex flex-wrap justify-between gap-3 text-xs text-slate-400 border-t border-white/5 pt-6">
        <span>{T("© 2026 Stag Prime LLC. All Rights Reserved.").replace("2026", String(new Date().getFullYear())).replace("Stag Prime LLC", brand.legal)}</span><span className="flex gap-5">{footer.legal.map(x => <a key={x.href} href={L(x.href)} className="hover:text-white">{TT(x.label)}</a>)}</span>
      </div>
    </footer>
  );
}
