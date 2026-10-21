import { NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";
import { limit } from "@/lib/ratelimit";
import { sendEmail } from "@/lib/email";
import type { FormFieldDef, FormSettings } from "@/lib/cms/forms";
import { clientIp } from "@/lib/ip";
export const runtime = "nodejs";
const E = (error: string, status = 422, field?: string) => NextResponse.json({ ok: false, error, field }, { status });
/** Public endpoint for forms built in Admin → Forms (rendered by the "form" block). Stores a FormSubmission and emails recipients. */
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!limit(`cmsform:${ip}`, 8, 600_000)) return E("Too many submissions. Please try again later.", 429);
  if (!dbReady()) return E("Forms are unavailable right now.", 503);
  let fd: FormData; try { fd = await req.formData(); } catch { return E("Invalid form data.", 400); }
  if (String(fd.get("website") || "")) return NextResponse.json({ ok: true });
  const key = String(fd.get("_form") || ""); const locale = String(fd.get("_locale") || "en").slice(0, 5);
  const f = await db.form.findUnique({ where: { key } }); if (!f || !f.active) return E("This form is not available.", 404);
  let fields: FormFieldDef[] = [], st: FormSettings = {}; try { fields = JSON.parse(f.fields); st = JSON.parse(f.settings); } catch { return E("Form is misconfigured.", 500); }
  const data: Record<string, string> = {};
  for (const fl of fields) {
    const raw = fd.get(fl.key); const v = typeof raw === "string" ? raw.trim().slice(0, fl.type === "textarea" ? 5000 : 500) : "";
    const label = typeof fl.label === "string" ? fl.label : fl.label?.en || fl.key;
    if (fl.type === "checkbox") { if (fl.required && !v) return E(`Please confirm: ${label}`, 422, fl.key); data[fl.key] = v ? "yes" : "no"; continue; }
    if (fl.required && !v) return E(`Please fill in: ${label}`, 422, fl.key);
    if (v && fl.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return E("Please enter a valid email address.", 422, fl.key);
    if (v && fl.type === "select" && fl.options?.length && !fl.options.includes(v)) return E(`Invalid choice for ${label}`, 422, fl.key);
    if (v) data[fl.key] = v;
  }
  await db.formSubmission.create({ data: { formId: f.id, formKey: key, data: JSON.stringify(data), locale, ip } });
  const to = (st.recipients || process.env.MAIL_TO || "brand@stagprime.com").split(/[,\s]+/).filter(x => x.includes("@")).slice(0, 5);
  const text = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
  await Promise.all(to.map(t => sendEmail("form.notify", t, { form: f.title, fields: text }).catch(() => null)));
  return NextResponse.json({ ok: true });
}
