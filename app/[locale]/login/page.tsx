import { loadLoc, getLoc } from "@/lib/loc";
import { seoMeta } from "@/lib/seo";
import { formT } from "@/lib/formt";
import { AuthForm } from "@/components/Forms";
import { googleEnabled } from "@/auth";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); return { ...await seoMeta("/login", "Client Login", "Sign in to your Stag Prime account to track service orders, download purchases and message our team."), robots: { index: false, follow: true } }; }
export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ mode?: string }> }) { await loadLoc(params);
  const m = (await searchParams).mode; const initial = m === "signup" ? "signup" : m === "forgot" ? "forgot" : "login";
  return (<section className="relative min-h-screen grid place-items-center px-5 pt-32 pb-20"><div className="absolute inset-0 grid-bg" /><div className="relative w-full"><AuthForm t={formT()} locale={getLoc()} google={googleEnabled()} initial={initial} /></div></section>);
}
