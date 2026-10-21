import { useParamsLoc, T, getLoc } from "@/lib/loc";
import { wrap } from "@/components/ui";
import { TokenForm } from "@/components/AccountUI";
import { acctT } from "@/lib/acct";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return { title: "Reset password", robots: { index: false, follow: false } }; }
export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ token?: string; email?: string }> }) { await useParamsLoc(params);
  const { token = "", email = "" } = await searchParams;
  return <section className={`${wrap} pt-40 pb-24 max-w-lg`}><h1 className="font-display text-3xl font-extrabold text-white mb-6">{T("Reset your password")}</h1><div className="glass rounded-3xl p-8"><p className="mb-4 text-sm text-slate-300">{email}</p><TokenForm kind="reset" email={email} token={token} locale={getLoc()} t={acctT()} /></div></section>;
}
