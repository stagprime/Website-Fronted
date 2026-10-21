/**
 * UI dictionaries keyed by STABLE ids (see scripts/i18n-rekey.mjs). en.json maps id → English source;
 * <locale>.json maps id → translation. `idFor` lets legacy T("English text") calls resolve to the stable id.
 * The admin can later replace these JSON files with a UiString table (key, locale, value) loaded through lib/settings-style cache.
 */
import en from "./en.json"; import bn from "./bn.json"; import ar from "./ar.json"; import es from "./es.json"; import fr from "./fr.json"; import de from "./de.json"; import hi from "./hi.json";
export const source: Record<string, string> = en;
export const dicts: Record<string, Record<string, string>> = { bn, ar, es, fr, de, hi };
export const idFor: Record<string, string> = Object.fromEntries(Object.entries(en).map(([k, v]) => [v, k]));
