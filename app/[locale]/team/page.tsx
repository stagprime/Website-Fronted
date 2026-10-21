import { S } from "@/lib/site";
import { loadLoc, L, T } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, wrap, CTA } from "@/components/ui";
import { ai } from "@/lib/art";
import { founderLd } from "@/lib/people";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params);  return await seoMeta("/team", "Our Team — The Stag Squad", "Meet the Stag Prime team: leadership, software & SaaS engineers, creative designers, marketers and support."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); const { team } = S(); 
  const groups = [...new Set(team.map(m => m.group))];
  return (<>
    <JsonLd data={breadcrumb([["Team", "/team"]])} /><JsonLd data={founderLd()} />
    <PageHero img={ai("manifesto-studio")} kicker="01001100 :: The Stag Squad" title={<>{T("Architects · Developers ·")} <span className="grad-text">{T("Marketers · Visionaries")}</span></>} crumbs={[["Team", "/team"]]} />
    <section className={`${wrap} pb-24 space-y-14`}>{groups.map((g, gi) => (
      <div key={g}><p className="font-mono text-sm text-sky-brand">[{String(gi + 1).padStart(2, "0")}] {T(g).toUpperCase()}</p>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">{team.filter(m => m.group === g).map(m => (
          <article key={m.role} className="reveal glow-card rounded-2xl border border-sky-brand/20 bg-navy-900/80 p-4 sm:p-5">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-navy-800 to-blue-brand/40">{m.photo ? <img src={m.photo} alt={`${m.name ?? "Team member"}, ${m.role}`} className="w-full h-full object-cover" loading="lazy" /> : <svg viewBox="0 0 100 100" className="absolute inset-0 text-sky-brand/40" aria-hidden><circle cx="50" cy="38" r="17" fill="currentColor" /><path d="M14 100c2-22 17-34 36-34s34 12 36 34Z" fill="currentColor" /></svg>}</div>
            <h2 className="mt-4 font-display text-sm sm:text-base font-bold text-white">{m.name ?? T("Team Member")}</h2><p className="text-xs sm:text-sm text-sky-brand">{T(m.role)}</p>
            {m.linkedin && <a href={m.linkedin} className="mt-2 inline-block text-xs text-slate-400">{T("LinkedIn")} ↗</a>}
          </article>))}</div></div>))}
      <div className="rounded-3xl border border-dashed border-sky-brand/30 p-8 font-mono text-sm text-slate-300">{T("> Plus our internship program and student / alumni network in Web Dev, App Dev, SEO and Content.")} <a href={L("/careers")} className="text-sky-brand">{T("Join us")} →</a></div>
    </section><CTA />
  </>);
}
