import SeoAdmin from "./SeoAdmin";
import { requireAdmin } from "@/lib/admin";
export default async function Page() { const a = !!(await requireAdmin()); return <><h1 className="text-2xl font-bold text-white mb-2">SEO & redirects</h1><p className="mb-6 text-sm text-slate-400">Analyze any page, override its title/description/canonical/robots/OG per locale, and manage 301/302/410 redirects. {a ? "" : "(Read-only: staff can analyze; only admins can save.)"}</p><SeoAdmin canEdit={a} /></>; }
