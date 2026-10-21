import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { route, ok, fail, str, need } from "@/lib/api";
import { dicts, source, keyOf } from "@/lib/tr";
import { locales } from "@/lib/i18n";
import { audit } from "@/lib/audit";
import { aiComplete, aiKey, langName } from "@/lib/ai";
export const runtime = "nodejs";
const LOCS = locales.filter(l => l !== "en");
async function entry(key: string, en: string) {
  const rows = await db.uiString.findMany({ where: { key } });
  const values = Object.fromEntries(locales.map(l => { const r = rows.find(x => x.locale === l); return [l, { built: l === "en" ? source[key] ?? en : dicts[l]?.[key] ?? "", override: r?.value ?? null, status: r?.status ?? null }]; }));
  return { key, en: rows.find(r => r.locale === "en")?.value ?? source[key] ?? en, values };
}
/** GET ?text=… | ?key=… → one entry; GET ?grid=1&locale=bn&q=&missing=1&page= → translation grid. */
export const GET = route("content.edit", async ({ url }) => {
  const sp = url.searchParams;
  if (sp.get("text") != null || sp.get("key")) { const text = sp.get("text") || ""; const key = sp.get("key") || keyOf(text); return ok({ ...(await entry(key, text)), ai: aiKey() }); }
  const loc = sp.get("locale") || "bn"; const q = (sp.get("q") || "").toLowerCase(); const missing = sp.get("missing") === "1"; const drafts = sp.get("drafts") === "1"; const page = Math.max(0, Number(sp.get("page") || 0));
  const ov = await db.uiString.findMany({ where: { locale: { in: [loc, "en"] } } });
  const o = new Map(ov.map(r => [`${r.locale}|${r.key}`, r]));
  const keys = new Set([...Object.keys(source), ...ov.map(r => r.key)]);
  let rows = [...keys].map(k => { const r = o.get(`${loc}|${k}`); const en = o.get(`en|${k}`)?.value ?? source[k] ?? ""; const val = r?.value ?? dicts[loc]?.[k] ?? ""; return { key: k, en, value: val, override: !!r, status: r?.status ?? (val ? "built-in" : "missing") }; });
  const total = rows.length; const missingCount = rows.filter(r => !r.value).length; const draftCount = rows.filter(r => r.status === "ai_draft").length;
  if (missing) rows = rows.filter(r => !r.value); if (drafts) rows = rows.filter(r => r.status === "ai_draft");
  if (q) rows = rows.filter(r => r.key.toLowerCase().includes(q) || r.en.toLowerCase().includes(q) || r.value.toLowerCase().includes(q));
  return ok({ locale: loc, total, missingCount, draftCount, count: rows.length, rows: rows.slice(page * 100, page * 100 + 100), ai: aiKey() });
});
/** PUT {key, locale, value, status?} — empty value removes the override (falls back to built-in translation). */
export const PUT = route("content.edit", async ({ body, who, ip }) => {
  const key = str(body.key, 200), locale = str(body.locale, 5), value = typeof body.value === "string" ? body.value.slice(0, 20000) : "";
  need(key && (locales as readonly string[]).includes(locale), "key and a valid locale are required");
  const status = body.status === "ai_draft" ? "ai_draft" : "reviewed";
  if (!value.trim()) await db.uiString.deleteMany({ where: { key, locale } });
  else await db.uiString.upsert({ where: { key_locale: { key, locale } }, create: { key, locale, value, status }, update: { value, status } });
  revalidateTag(`ui:${locale}`); await audit(who, "translation.save", "ui", `${key}:${locale}`, { value: value.slice(0, 200), status }, ip);
  return ok();
});
/** POST {key, en, locales?} → AI drafts saved as status ai_draft (off without OPENAI_API_KEY). */
export const POST = route("content.edit", async ({ body, who, ip }) => {
  if (!aiKey()) return fail("AI is off — set OPENAI_API_KEY to enable AI drafts.", 409);
  const key = str(body.key, 200); const en = typeof body.en === "string" ? body.en.slice(0, 6000) : (source[key] || ""); need(key && en, "key and English text required");
  const targets = (Array.isArray(body.locales) ? body.locales : LOCS).filter((l): l is string => typeof l === "string" && LOCS.includes(l as never));
  const out: Record<string, string> = {};
  await Promise.all(targets.map(async l => {
    const t = await aiComplete([{ role: "system", content: `Translate website copy for Stag Prime (digital agency) from English to ${langName(l)}. Keep brand names, URLs, numbers, placeholders like {name} and markdown/HTML tags unchanged. Return only the translation.` }, { role: "user", content: en }], { max: 1200 });
    if (t) { out[l] = t; await db.uiString.upsert({ where: { key_locale: { key, locale: l } }, create: { key, locale: l, value: t, status: "ai_draft" }, update: { value: t, status: "ai_draft" } }); revalidateTag(`ui:${l}`); }
  }));
  await audit(who, "translation.ai_draft", "ui", key, Object.keys(out), ip);
  return ok({ drafts: out });
});
