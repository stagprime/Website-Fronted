// Collects every translatable string: build-time misses (data/i18n-missing.txt from SP_I18N_COLLECT=1 build) + T("...") literals + key lists.
import fs from "fs";
const keys = new Set();
if (fs.existsSync("data/i18n-missing.txt")) for (const l of fs.readFileSync("data/i18n-missing.txt", "utf8").split("\n")) if (l) keys.add(JSON.parse(l));
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(`${d}/${e.name}`) : [`${d}/${e.name}`]);
for (const f of [...walk("app"), ...walk("components"), ...walk("lib")].filter(f => /\.tsx?$/.test(f))) {
  const s = fs.readFileSync(f, "utf8");
  for (const m of s.matchAll(/\bT\("((?:[^"\\]|\\.)*)"\)/g)) keys.add(JSON.parse(`"${m[1]}"`));
  for (const m of s.matchAll(/export const (?:chatKeys|acctKeys)\s*=\s*\[([\s\S]*?)\];/g)) for (const x of m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)) keys.add(JSON.parse(`"${x[1]}"`));
  for (const m of s.matchAll(/const K: Record<string, string> = \{([\s\S]*?)\};/g)) for (const x of m[1].matchAll(/: "((?:[^"\\]|\\.)*)"/g)) keys.add(JSON.parse(`"${x[1]}"`));
}
for (const k of JSON.parse(fs.readFileSync("lib/formkeys.json", "utf8"))) keys.add(k);
const out = [...keys].filter(k => k.trim() && /[A-Za-z]/.test(k)).sort();
fs.writeFileSync("data/i18n-keys.json", JSON.stringify(out, null, 0)); console.log(out.length, "keys");
