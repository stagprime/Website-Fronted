// Static security checks for a Stag Prime app: every admin API handler is permission-gated, every admin write checks the
// request origin, and no secret-looking values are committed. Usage: node scripts/security-scan.mjs [dir]
import fs from "fs"; import path from "path"; import { execSync } from "child_process";
const root = process.argv[2] || "."; let bad = 0; const fail = m => { bad++; console.log("✗", m); };
const walk = d => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]) : [];
const routes = walk(path.join(root, "app/api/admin")).filter(f => f.endsWith("route.ts"));
for (const f of routes) { const s = fs.readFileSync(f, "utf8");
  for (const m of s.matchAll(/export (?:const (\w+) = (\w+)\(|async function (\w+)\(([^)]*)\)\s*\{([\s\S]*?)\n\})/g)) {
    const name = m[1] || m[3]; if (!/^(GET|POST|PUT|PATCH|DELETE)$/.test(name)) continue;
    if (m[1]) { if (m[2] !== "route") fail(`${f} ${name}: not wrapped in route()`); continue; }
    const body = m[5]; const gated = /requirePerm\(|route\(|e2eEnabled\(\)|return handler\(req\)|new NextResponse\("Not Found"/.test(body); if (!gated) fail(`${f} ${name}: no permission check`);
    if (name !== "GET" && !/sameOrigin\(|return handler\(req\)|Not Found/.test(body)) fail(`${f} ${name}: write without same-origin check`);
  } }
const api = fs.readFileSync(path.join(root, "lib/api.ts"), "utf8"); if (!/sameOrigin\(req\)/.test(api)) fail("lib/api.ts route(): no same-origin check for writes");
console.log(`${routes.length} admin route files checked`);
const files = execSync("git ls-files", { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);
const PAT = [/sk_(live|test)_[0-9a-zA-Z]{10,}/, /vercel_blob_rw_[0-9a-zA-Z_]{10,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /postgres(ql)?:\/\/[^\s"'`:]+:[^\s"'`@]{6,}@/, /\bghp_[0-9A-Za-z]{30,}/, /re_[0-9A-Za-z]{20,}/, /AKIA[0-9A-Z]{16}/];
for (const f of files) { if (/\.(png|jpe?g|webp|gif|ico|woff2?|ttf|otf|avif|mp4|zip|pdf)$/i.test(f)) continue; const p = path.join(root, f); let s; try { s = fs.readFileSync(p, "utf8"); } catch { continue; }
  for (const re of PAT) { const m = s.match(new RegExp(re.source, "g")) || []; if (m.some(x => !/change|password|\$\{|<|example|xxx/i.test(x))) fail(`possible secret in ${f} (${re.source.slice(0, 20)}…)`); }
  if (/^\.env($|\.(?!example))/.test(path.basename(f))) fail(`env file committed: ${f}`); }
console.log(`${files.length} tracked files scanned for secrets`); console.log(bad ? `${bad} problems` : "security scan clean"); process.exit(bad ? 1 : 0);
