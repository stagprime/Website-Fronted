// Converts UI translations to STABLE keys.
//   lib/tr/en.json      { "<ns>.<slug>.<hash6>": "English source" }  (source of truth for English)
//   lib/tr/<l>.json     { "<same key>": "translation" }
// Key = "ui." + slug(en, 40 chars) + "." + sha1(en).slice(0,6) — the migration key format from cms-data-model.md.
// Once a key exists it never changes, even if the English text is later edited in the admin (UiString table).
// Any English-text keys found in a locale file (e.g. fresh output of i18n-translate.py) are converted in place.
import fs from "fs"; import crypto from "crypto";
const slug = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "x";
export const keyFor = (en) => `ui.${slug(en)}.${crypto.createHash("sha1").update(en).digest("hex").slice(0, 6)}`;
const enPath = "lib/tr/en.json";
const en = fs.existsSync(enPath) ? JSON.parse(fs.readFileSync(enPath, "utf8")) : {};
const known = new Set(Object.values(en));
for (const s of JSON.parse(fs.readFileSync("data/i18n-keys.json", "utf8"))) if (!known.has(s)) { en[keyFor(s)] = s; known.add(s); }
const rev = Object.fromEntries(Object.entries(en).map(([k, v]) => [v, k]));
fs.writeFileSync(enPath, JSON.stringify(Object.fromEntries(Object.entries(en).sort()), null, 1));
for (const l of ["bn", "ar", "es", "fr", "de", "hi"]) {
  const p = `lib/tr/${l}.json`, d = JSON.parse(fs.readFileSync(p, "utf8")), out = {};
  for (const [k, v] of Object.entries(d)) { const id = en[k] !== undefined ? k : rev[k] ?? (en[keyFor(k)] = k, rev[k] = keyFor(k)); out[id] = v; }
  fs.writeFileSync(p, JSON.stringify(Object.fromEntries(Object.entries(out).sort()), null, 1));
  console.log(l, Object.keys(out).length);
}
fs.writeFileSync(enPath, JSON.stringify(Object.fromEntries(Object.entries(en).sort()), null, 1));
console.log("en", Object.keys(en).length);
