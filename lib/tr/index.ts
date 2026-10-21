/**
 * UI dictionaries keyed by STABLE ids (see scripts/i18n-rekey.mjs). en.json maps id → English source;
 * <locale>.json maps id → translation. `idFor` lets legacy T("English text") calls resolve to the stable id.
 * The admin can later replace these JSON files with a UiString table (key, locale, value) loaded through lib/settings-style cache.
 */
import en from "./en.json"; import bn from "./bn.json"; import ar from "./ar.json"; import es from "./es.json"; import fr from "./fr.json"; import de from "./de.json"; import hi from "./hi.json";
export const source: Record<string, string> = en;
export const dicts: Record<string, Record<string, string>> = { bn, ar, es, fr, de, hi };
export const idFor: Record<string, string> = Object.fromEntries(Object.entries(en).map(([k, v]) => [v, k]));
/** Stable key for any English string: the en.json id when known, else a content hash ("cms.<hash>") for admin-authored copy. */
export function keyOf(s: string): string {
  const id = idFor[s]; if (id) return id;
  let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return `cms.${(h >>> 0).toString(36)}${s.length.toString(36)}`;
}
