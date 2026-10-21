import { unstable_cache } from "next/cache";
import { dbReady } from "@/lib/db";
import { getLoc } from "@/lib/loc";
export type FormFieldDef = { key: string; type: string; label: Record<string, string> | string; required?: boolean; options?: string[]; placeholder?: string; width?: string };
export type FormSettings = { recipients?: string; submitLabel?: Record<string, string>; successMsg?: Record<string, string>; createLead?: boolean };
const loadForms = unstable_cache(async () => {
  if (!dbReady()) return [];
  try { const { db } = await import("@/lib/db"); return await db.form.findMany({ where: { active: true } }); } catch { return []; }
}, ["cms-forms"], { tags: ["forms"], revalidate: 600 });
const pick = (v: Record<string, string> | string | undefined, l: string, d = "") => typeof v === "string" ? v : (v?.[l] || v?.en || d);
/** Localized form definition for the "form" block. */
export async function formByKey(key: string) {
  if (!key) return null; const f = (await loadForms()).find(x => x.key === key); if (!f) return null; const l = getLoc();
  let fields: FormFieldDef[] = [], st: FormSettings = {}; try { fields = JSON.parse(f.fields); st = JSON.parse(f.settings); } catch { /* bad json */ }
  return { key: f.key, title: f.title, fields: fields.map(x => ({ ...x, label: pick(x.label, l, x.key) })), submit: pick(st.submitLabel, l, "Send"), success: pick(st.successMsg, l, "Thanks! We received your message.") };
}
