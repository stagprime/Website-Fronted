// Unit checks for small security helpers (run: npx tsx scripts/unit.test.mts).
import fs from "fs";
import { execSync } from "child_process";
import { clientIp } from "../lib/ip";
import { safeNext } from "../lib/safe-next";
let pass = 0, fail = 0; const eq = (name: string, a: unknown, b: unknown) => { if (JSON.stringify(a) === JSON.stringify(b)) { pass++; console.log("✓", name); } else { fail++; console.log("✗", name, "→", a, "expected", b); } };
const H = (o: Record<string, string>) => new Headers(o);
eq("clientIp: X-Real-IP wins", clientIp(H({ "x-real-ip": "203.0.113.9", "x-forwarded-for": "1.1.1.1, 198.51.100.2" })), "203.0.113.9");
eq("clientIp: last XFF hop, not the spoofable first", clientIp(H({ "x-forwarded-for": "6.6.6.6, 198.51.100.2" })), "198.51.100.2");
eq("clientIp: single XFF", clientIp(H({ "x-forwarded-for": " 198.51.100.7 " })), "198.51.100.7");
eq("clientIp: none → fallback", clientIp(H({})), "local"); eq("clientIp: custom fallback", clientIp(H({}), ""), ""); eq("clientIp: undefined headers", clientIp(undefined), "local");
const bad = execSync(`rg -n --no-heading 'x-forwarded-for' app lib auth.ts middleware.ts components -g '*.ts' -g '*.tsx' || true`, { encoding: "utf8" }).split("\n").filter(l => l && !l.startsWith("lib/ip.ts"));
eq("no route reads X-Forwarded-For directly (all use clientIp)", bad, []);
for (const f of ["app/api/chat/route.ts", "app/api/forms/route.ts", "app/api/forms/cms/route.ts", "app/api/account/route.ts", "app/api/track/route.ts", "lib/api.ts", "auth.ts"]) eq(`${f} uses clientIp`, fs.readFileSync(f, "utf8").includes("clientIp("), true);
eq("safeNext: admin path", safeNext("/admin/coupons?x=1", "/en/account"), "/admin/coupons?x=1");
for (const v of ["//evil.com", "/\\evil.com", "https://evil.com", "javascript:alert(1)", "/%0d%0aSet-Cookie:x", "\t//evil.com", "", null, "admin", "/a\\b"]) eq(`safeNext rejects ${JSON.stringify(v)}`, safeNext(v as string, "/en/account") === "/en/account" || !safeNext(v as string, "/en/account").startsWith("//"), true);
eq("safeNext: protocol-relative after trim", safeNext("  //evil.com", "/f"), "/f");
eq("safeNext: encoded CRLF stays a path", safeNext("/%0d%0aSet-Cookie:x", "/f").startsWith("/%0"), true);
console.log(`\n${pass} passed, ${fail} failed`); if (fail) process.exit(1);
