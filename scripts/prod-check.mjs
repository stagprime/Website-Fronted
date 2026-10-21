// Production-mode checks against `next start` (NODE_ENV=production, SP_E2E unset):
//   BASE=http://localhost:3100 node scripts/prod-check.mjs
// The e2e helper route must answer a plain 404 before any auth/role check (an unauthenticated 403 would leak that it exists).
const BASE = process.env.BASE || "http://localhost:3100"; let fail = 0;
const check = (n, ok, info) => { console.log(ok ? "✓" : "✗", n, ok ? "" : info); if (!ok) fail++; };
for (const [m, h] of [["POST", {}], ["GET", {}], ["POST", { "Content-Type": "application/json", Origin: BASE }]]) {
  const r = await fetch(`${BASE}/api/admin/e2e`, { method: m, headers: h, body: m === "POST" ? JSON.stringify({ action: "staff", role: "editor" }) : undefined }); const t = await r.text();
  check(`${m} /api/admin/e2e → 404 in production`, r.status === 404 && !/Forbidden|role/i.test(t), `${r.status} ${t.slice(0, 80)}`);
}
const o = await fetch(`${BASE}/api/admin/orders`); check("other admin APIs still answer 403 (auth check active)", o.status === 403 || o.status === 401, String(o.status));
console.log(fail ? `${fail} failed` : "all passed"); process.exit(fail ? 1 : 0);
