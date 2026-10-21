import { NextResponse } from "next/server";
import { deliver } from "@/lib/mailer";
export const runtime = "nodejs";
const hits = new Map<string, number[]>();
const RULES: Record<string, { req: string[]; max: Record<string, number> }> = {
  contact: { req: ["name", "email", "message"], max: { name: 120, email: 200, phone: 40, message: 5000 } },
  "job-application": { req: ["name", "email", "agree"], max: { name: 120, email: 200, cover: 2500, experience: 3000, why: 2000 } },
  investor: { req: ["name", "email", "interest", "message"], max: { name: 120, email: 200, company: 200, message: 4000 } },
};
export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim(); const now = Date.now();
  const h = (hits.get(ip) || []).filter(t => now - t < 600000); if (h.length >= 8) return NextResponse.json({ ok: false, error: "Too many submissions. Please try again later." }, { status: 429 }); hits.set(ip, [...h, now]);
  let fd: FormData; try { fd = await req.formData(); } catch { return NextResponse.json({ ok: false, error: "Invalid form data." }, { status: 400 }); }
  if (String(fd.get("website") || "")) return NextResponse.json({ ok: true }); // honeypot: silently accept bots
  const t0 = Number(fd.get("_t") || 0); if (t0 && now - t0 < 2500) return NextResponse.json({ ok: true }); // submitted too fast → bot
  const type = String(fd.get("type") || "contact"); const rule = RULES[type]; if (!rule) return NextResponse.json({ ok: false, error: "Unknown form." }, { status: 400 });
  const data: Record<string, string | string[]> = {}; const files: { filename: string; content: Buffer }[] = [];
  for (const [k, v] of fd.entries()) {
    if (["website", "_t", "type"].includes(k)) continue;
    if (typeof v === "string") { const s = v.trim().slice(0, rule.max[k] || 1000); data[k] = data[k] ? [data[k], s].flat() : s; }
    else if (v.size) {
      if (k !== "cv" || type !== "job-application") continue;
      if (v.size > 5 * 1024 * 1024) return NextResponse.json({ ok: false, error: "CV must be under 5 MB.", field: "cv" }, { status: 422 });
      if (!/\.(pdf|docx?)$/i.test(v.name)) return NextResponse.json({ ok: false, error: "CV must be a PDF or Word document.", field: "cv" }, { status: 422 });
      files.push({ filename: v.name, content: Buffer.from(await v.arrayBuffer()) });
    }
  }
  for (const r of rule.req) if (!data[r]) return NextResponse.json({ ok: false, error: `Please fill in: ${r}.`, field: r }, { status: 422 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.email))) return NextResponse.json({ ok: false, error: "Please enter a valid email address.", field: "email" }, { status: 422 });
  const text = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("\n");
  try { const { db, dbReady } = await import("@/lib/db"); if (dbReady()) await db.formSubmission.create({ data: { formKey: type, data: JSON.stringify(data), locale: String(data.locale || "en").slice(0, 5), ip } }); } catch { /* inbox is best-effort; email + jsonl still record it */ }
  const r = await deliver(`[stagprime.com] ${type} — ${data.name}`, text, { type, ...data, ip }, files);
  return NextResponse.json({ ok: true, via: r.via });
}
