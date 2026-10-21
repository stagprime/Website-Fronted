import { cache } from "react";
import { locales, defaultLocale } from "./i18n";
import { dicts, keyOf, source } from "./tr";
// Per-request locale store (React cache is request-scoped in RSC). Set by layout/page/generateMetadata.
const store = cache(() => ({ l: defaultLocale as string, ov: {} as Record<string, Record<string, string>> }));
/** Admin UiString overrides (locale → key → text), primed per request by lib/site.ts primeSite(). */
export function setOverrides(l: string, map: Record<string, string>) { store().ov[l] = map; }
const ov = (l: string, id?: string) => (id ? store().ov[l]?.[id] : undefined);
export function setLoc(l?: string) { if (l && (locales as readonly string[]).includes(l)) store().l = l; return store().l; }
export const getLoc = () => store().l;
export async function loadLoc(params: Promise<{ locale?: string }> | undefined) { const p = params ? await params : {}; const l = setLoc(p.locale); const { primeSite } = await import("./site"); await primeSite(l); return l; }
/** Translate an English UI/page string to the current locale (falls back to English). */
// i18n key collection: run the server with SP_I18N_COLLECT=1 and crawl a non-English locale; missing keys append to data/i18n-missing.txt (see scripts/i18n-*.mjs).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const miss = (s: string) => { if (process.env.SP_I18N_COLLECT === "1" && s.trim() && /[A-Za-z]/.test(s)) { try { require("fs").appendFileSync(process.cwd() + "/data/i18n-missing.txt", JSON.stringify(s) + "\n"); } catch { /* ignore */ } } return s; };
export function T(s: string): string { return Tl(getLoc(), s); }
export function Tl(l: string, s: string): string { if (!s) return s; const id = keyOf(s); if (l === "en") return ov("en", id) ?? s; return ov(l, id) ?? (id && dicts[l]?.[id]) ?? miss(s); }
/** Translate by stable key, e.g. Tk("ui.get-started.ab12cd"). Prefer this in new code; English text lives in lib/tr/en.json. */
export function Tk(key: string, l = getLoc()): string { return ov(l, key) || (l !== "en" && dicts[l]?.[key]) || ov("en", key) || source[key] || key; }
/** Locale-prefixed internal link. */
export function L(h: string) { return /^([a-z]+:|#)/.test(h) ? h : `/${getLoc()}${h === "/" ? "" : h}`; }
export function TT<V>(x: V): V | string { return typeof x === "string" ? T(x) : x; }
