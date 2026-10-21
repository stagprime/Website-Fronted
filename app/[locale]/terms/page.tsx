import { LegalBody } from "@/components/LegalBody";
import { terms } from "@/content/legal";
import { loadLoc, T } from "@/lib/loc";
import { seoMeta, breadcrumb } from "@/lib/seo";
import { PageHero, JsonLd, wrap } from "@/components/ui";
import { ai } from "@/lib/art";
import { coded } from "@/lib/cms/page";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); return await seoMeta("/terms", "Terms of Service", "Terms of Service for Stag Prime LLC and stagprime.com."); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); const c = coded("/terms"); const meta = c.order.find(x => x.id === "legalMeta");
  const DEF_SUB = "Last updated: 2026. Template — pending legal review before launch."; const upd = c.val<string>("legalMeta", "updated"), note = c.text("legalMeta", "note");
  const DEF_NOTE = "Template — pending legal review before launch."; const custom = upd !== "2026" || Object.entries(meta?.content || {}).some(([l, v]) => typeof v?.note === "string" && v.note !== (l === "en" ? DEF_NOTE : ""));
  const sub = custom ? `${T("Last updated:")} ${upd}.${note ? ` ${note}` : ""}` : DEF_SUB; const banner = meta?.visible !== false && c.val<boolean>("legalMeta", "showBanner") !== false;
  return (<>
    <JsonLd data={breadcrumb([["Terms of Service", "/terms"]])} />
    <PageHero img={ai("svc-writing-consulting")} kicker="Legal" title="Terms of Service" sub={sub} crumbs={[["Terms of Service", "/terms"]]} />
    <article className={`${wrap} pb-24 max-w-3xl prose-sp`}>{banner && <p data-testid="legal-banner" className="rounded-2xl border border-area-red/40 bg-area-red/10 p-4 text-sm">{c.text("legalMeta", "banner")}</p>}
      <LegalBody pageKey="/terms" items={terms} /></article>
  </>);
}
