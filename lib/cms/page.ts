import { rawPage } from "@/lib/site";
import { getLoc, T } from "@/lib/loc";
import { parseSections, type Section, HOME_SECTIONS } from "./blocks";
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
