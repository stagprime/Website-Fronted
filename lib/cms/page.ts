import { rawPage } from "@/lib/site";
import { getLoc, T } from "@/lib/loc";
import { parseSections, type Section, HOME_SECTIONS, legacyDefs } from "./blocks";
/** Published section list for a page key ("home", "/about", "/privacy", custom "/landing"), or null when not managed in the DB. */
export function pageDoc(key: string): Section[] | null { return parseSections(rawPage(key)?.sections); }
export function pageTitle(key: string) { return rawPage(key)?.title; }
/** Localized text of a section field: locale override → English override (translated if known) → code default through T(). */
export function txt(sec: Section | undefined, field: string, def: string): string {
  const l = getLoc(); const v = sec?.content?.[l]?.[field];
  if (typeof v === "string" && v.trim()) return v;
  const en = sec?.content?.en?.[field];
  if (typeof en === "string" && en.trim()) return l === "en" ? en : T(en);
  return T(def);
}
export function list<T = Record<string, string>>(sec: Section, field: string): T[] {
  const l = getLoc(); const v = sec.content?.[l]?.[field]; if (Array.isArray(v) && v.length) return v as T[];
  const en = sec.content?.en?.[field]; if (Array.isArray(en)) return (l === "en" ? en : en.map(x => typeof x === "object" && x ? Object.fromEntries(Object.entries(x).map(([k, s]) => [k, typeof s === "string" ? T(s) : s])) : x)) as T[];
  const st = sec.settings?.[field]; return Array.isArray(st) ? st as T[] : [];
}
export const setting = (sec: Section, k: string) => sec.settings?.[k] as string | undefined;
export function defaultHome(): Section[] { return HOME_SECTIONS.map(h => ({ id: h.id, type: "legacy", visible: true, settings: {}, content: {} })); }

/** Built-in sections of a coded page, editable in Admin → Pages: order/visibility from the page document (missing ones appended),
 *  text through txt() with the code default from PAGE_SECTIONS, non-translatable values from settings. */
export function coded(key: string) {
  const defs = legacyDefs(key); const doc = (pageDoc(key) || []).filter(x => x.type === "legacy" && defs.some(d => d.id === x.id));
  const order: Section[] = [...doc, ...defs.filter(d => !doc.some(x => x.id === d.id)).map(d => ({ id: d.id, type: "legacy", visible: true, settings: {}, content: {} }))];
  const sec = (id: string) => order.find(x => x.id === id);
  const def = (id: string, f: string) => defs.find(d => d.id === id)?.fields.find(x => x.key === f)?.def;
  return {
    order,
    text: (id: string, f: string) => txt(sec(id), f, String(def(id, f) ?? "")),
    /** Non-i18n value (settings), falling back to the code default. */
    val: <V,>(id: string, f: string): V => { const v = sec(id)?.settings?.[f]; return (v === undefined || v === "" ? def(id, f) : v) as V; },
    items: <V = Record<string, string>,>(id: string, f: string): V[] => { const s0 = sec(id); const l = s0 ? list<V>(s0, f) : []; if (l.length) return l;
      const dv = def(id, f); return (Array.isArray(dv) ? dv.map(x => Object.fromEntries(Object.entries(x as object).map(([k, v]) => [k, typeof v === "string" && k !== "icon" ? T(v) : v]))) : []) as V[]; },
  };
}
