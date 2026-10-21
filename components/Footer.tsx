import { L, T, TT } from "@/lib/loc";
import { CONTACT } from "@/lib/i18n";
import { services, ventures, socials, profiles } from "@/content/site";

const cols: [string, [string, string][]][] = [
  ["Services", services.map(s => [s.title, `/services/${s.slug}`])],
  ["Ventures", [...ventures.map(v => [v.title, `/ventures/${v.slug}`] as [string, string]), ["Portfolio", "/portfolio"], ["Store", "/store"]]],
  ["Company", [["About", "/about"], ["Team", "/team"], ["Partners", "/partners"], ["Careers", "/careers"], ["Reviews", "/reviews"], ["Blog", "/blog"], ["FAQ", "/faq"], ["Pricing", "/pricing"], ["Contact", "/contact"]]],
];
export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy-900 pb-24 sm:pb-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <img src="/logo-wide.svg" alt="Stag Prime Digital Agency" className="h-20 w-auto" />
          <p className="mt-4 text-slate-400 text-sm">{T("Your Ultimate Growth Partner.")}</p>
          <address className="not-italic mt-6 text-sm text-slate-400 space-y-1">
            <p className="text-white font-semibold">{T("USA — Stag Prime LLC")}</p><p>{T("30 N Gould St #23907, Sheridan, WY 82801")}</p>
            <p className="text-white font-semibold pt-3">{T("Bangladesh Office")}</p><p>{T("268/C Kadirganj, Boalia, Rajshahi-6000")}</p>
            <p className="pt-3"><a href={CONTACT.tel} className="hover:text-white">{CONTACT.phone}</a> · <a href={`mailto:${CONTACT.email}`} className="hover:text-white">{CONTACT.email}</a></p>
            <p><a href={`mailto:${CONTACT.support}`} className="hover:text-white">{CONTACT.support}</a></p>
          </address>
        </div>
        {cols.map(([h, ls]) => (
          <div key={h}><p className="text-white font-semibold mb-4 text-sm">{TT(h)}</p><ul className="space-y-2 text-sm text-slate-400">{ls.map(([n, p]) => <li key={p}><a href={L(p)} className="hover:text-white">{TT(n)}</a></li>)}</ul></div>
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 pb-8 flex flex-wrap gap-2">
        {[...socials, ...profiles.map(p => [p.n, p.u])].map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener" className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400 hover:text-white hover:border-sky-brand">{TT(n)}</a>)}
      </div>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 flex flex-wrap justify-between gap-3 text-xs text-slate-400 border-t border-white/5 pt-6">
        <span>{T("© 2026 Stag Prime LLC. All Rights Reserved.")}</span><span className="flex gap-5"><a href={L("/privacy")} className="hover:text-white">{T("Privacy Policy")}</a><a href={L("/terms")} className="hover:text-white">{T("Terms of Service")}</a></span>
      </div>
    </footer>
  );
}
