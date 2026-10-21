// RBAC + live chat-widget checks (playwright-core + system Chrome). Complements scripts/e2e-admin.mjs.
//   ADMIN_EMAIL=… ADMIN_PASSWORD=… node scripts/e2e-roles.mjs
// 1) Chat settings (enabled / greeting / WhatsApp-Telegram-Call buttons) take effect in the public widget (en + RTL ar).
// 2) Throwaway editor and support accounts reach exactly the admin modules their role allows (UI + API) and are denied elsewhere.
import { chromium } from "playwright-core";
import fs from "fs";
const BASE = process.env.BASE || "http://localhost:3000"; const EMAIL = process.env.ADMIN_EMAIL, PASS = process.env.ADMIN_PASSWORD;
if (!EMAIL || !PASS) { console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD"); process.exit(2); }
const src = fs.readFileSync("lib/rbac.ts", "utf8");
const PERMS = Object.fromEntries([...src.matchAll(/"([a-z]+\.[a-z]+)": \[([^\]]*)\]/g)].map(m => [m[1], [...m[2].matchAll(/"(\w+)"/g)].map(x => x[1])]));
const NAV = [...fs.readFileSync("lib/admin-nav.ts", "utf8").matchAll(/href: "([^"]+)", label: "[^"]+", perm: "([^"]+)"/g)].map(m => ({ href: m[1], perm: m[2] }));
// One representative API per permission (GET unless noted).
const API = { "orders.view": "/api/admin/orders", "customers.view": "/api/admin/customers", "content.edit": "/api/admin/pages", "catalog.edit": "/api/admin/stripe",
  "settings.edit": "/api/admin/tracking", "emails.edit": "/api/admin/emails", "users.manage": "/api/admin/team", "audit.view": "/api/admin/audit", "backups.manage": "/api/admin/backups",
  "chat.use": "/api/admin/chat", "seo.edit": "/api/admin/seo" };
const fails = []; let passes = 0;
async function step(name, fn) { try { await fn(); passes++; console.log("✓", name); } catch (e) { fails.push(name); console.log("✗", name, "—", (e?.message || String(e)).split("\n")[0]); } }
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
async function session(email, pass) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
  await page.goto(BASE + "/en/login", { waitUntil: "networkidle", timeout: 120000 }); await page.fill("#ae", email); await page.fill("#ap", pass);
  await page.click("form button:has-text('Login')"); await page.waitForURL(/\/(account|admin)/, { timeout: 60000 }).catch(async e => { throw new Error(`login ${email}: ${(await page.textContent("form").catch(() => ""))?.slice(0, 120)} ${e.message.split("\n")[0]}`); });
  const api = (p, m = "GET", b) => page.evaluate(async ([p, m, b]) => { const r = await fetch(p, { method: m, headers: b ? { "Content-Type": "application/json" } : {}, body: b ? JSON.stringify(b) : undefined }); let j = null; try { j = await r.json(); } catch {} return { status: r.status, j }; }, [p, m, b]);
  const go = async p => { const r = await page.goto(BASE + p, { waitUntil: "domcontentloaded", timeout: 120000 }); await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {}); return r; };
  return { ctx, page, api, go };
}
const admin = await session(EMAIL, PASS);

// ---- 1. chat widget
const orig = (await admin.api("/api/admin/settings?key=chat")).j.value;
const setChat = async v => { const r = await admin.api("/api/admin/settings", "PUT", { key: "chat", value: { ...orig, ...v } }); if (!r.j?.ok) throw new Error(JSON.stringify(r.j)); };
const pub = await browser.newContext(); const pp = await pub.newPage();
const visit = async p => { await pp.goto(BASE + p, { waitUntil: "domcontentloaded", timeout: 120000 }); await pp.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {}); await pp.addStyleTag({ content: "nextjs-portal{display:none!important}" }); }; // dev-only overlay sits on the RTL dock
try {
  await step("chat disabled → no widget on /en and /ar", async () => { await setChat({ enabled: false });
    for (const l of ["/en", "/ar/services"]) { await visit(l); if (await pp.locator("[data-testid=contact-dock]").count()) throw new Error(`dock visible on ${l}`); } });
  const greet = `E2E greeting ${Date.now()}`;
  await step("chat enabled + greeting shown in panel", async () => { await setChat({ enabled: true, greeting: greet, showWhatsapp: true, showTelegram: true, showCall: true });
    await visit("/en"); await pp.locator("[data-testid=contact-dock] > button[aria-expanded]").click(); await pp.getByRole("menuitem").first().click();
    await pp.waitForSelector("[data-testid=chat-greeting]", { timeout: 20000 }); const t = await pp.textContent("[data-testid=chat-greeting]"); if (t?.trim() !== greet) throw new Error(`greeting "${t}"`); });
  await step("all contact buttons shown when on", async () => { await visit("/en"); await pp.locator("[data-testid=contact-dock] > button[aria-expanded]").click();
    const n = await pp.locator("#sp-dock [role=menuitem]").count(); if (n !== 4) throw new Error(`${n} items`); });
  await step("buttons off → only Live chat (en + RTL ar)", async () => { await setChat({ enabled: true, showWhatsapp: false, showTelegram: false, showCall: false });
    for (const l of ["/en", "/ar"]) { await visit(l); await pp.locator("[data-testid=contact-dock] > button[aria-expanded]").click();
      const hrefs = await pp.locator("#sp-dock [role=menuitem]").evaluateAll(es => es.map(e => e.getAttribute("href") || "button"));
      if (hrefs.length !== 1 || hrefs[0] !== "button") throw new Error(`${l}: ${hrefs.join(",")}`); } });
  await step("only WhatsApp on → Live chat + WhatsApp", async () => { await setChat({ enabled: true, showWhatsapp: true, showTelegram: false, showCall: false });
    await visit("/en"); await pp.locator("[data-testid=contact-dock] > button[aria-expanded]").click();
    const hrefs = await pp.locator("#sp-dock [role=menuitem]").evaluateAll(es => es.map(e => e.getAttribute("href") || "button"));
    if (hrefs.length !== 2 || !/wa\.me|whatsapp/i.test(hrefs[1])) throw new Error(hrefs.join(",")); });
} finally { await admin.api("/api/admin/settings", "PUT", { key: "chat", value: orig }); await pub.close(); }

// ---- 2. roles
for (const role of ["editor", "support"]) {
  const c = await admin.api("/api/admin/e2e", "POST", { action: "staff", role }); if (!c.j?.ok) { fails.push(`create ${role}`); console.log("✗ create", role, JSON.stringify(c.j)); continue; }
  const s = await session(c.j.email, c.j.password);
  for (const { href, perm } of NAV) {
    const allowed = PERMS[perm].includes(role);
    await step(`${role} UI ${href} → ${allowed ? "allowed" : "denied"}`, async () => {
      const r = await s.go(href); if (!r || r.status() >= 500) throw new Error(`HTTP ${r?.status()}`); await s.page.waitForTimeout(300);
      const body = await s.page.textContent("body"); const denied = /No access/.test(body || "");
      if (allowed === denied) throw new Error(denied ? "shows No access" : "content shown without permission");
      const inNav = await s.page.locator(`nav a[href="${href}"]`).count(); if (allowed !== inNav > 0) throw new Error(`sidebar link ${inNav ? "present" : "missing"}`);
    });
  }
  for (const [perm, url] of Object.entries(API)) {
    const allowed = PERMS[perm].includes(role);
    await step(`${role} API ${url} (${perm}) → ${allowed ? "200" : "403"}`, async () => { const r = await s.api(url); if (allowed ? r.status !== 200 : r.status !== 403) throw new Error(`HTTP ${r.status}`); });
  }
  await step(`${role} API writes outside role are 403`, async () => {
    const checks = [["/api/admin/settings", "PUT", { key: "brand", value: {} }], ["/api/admin/team", "POST", { action: "role", email: EMAIL, role: "customer" }], ["/api/admin/backups", "POST", { action: "create" }], ["/api/admin/e2e", "POST", { action: "autocomplete" }]];
    if (role === "support") checks.push(["/api/admin/pages", "POST", { key: "x" }]); if (role === "editor") checks.push(["/api/admin/orders", "POST", { action: "x" }]);
    for (const [u, m, b] of checks) { const r = await s.api(u, m, b); if (r.status !== 403) throw new Error(`${m} ${u} → ${r.status}`); } });
  await step(`${role} anonymous-style API denied after logout`, async () => { await s.ctx.clearCookies(); const r = await s.api("/api/admin/orders"); if (![401, 403].includes(r.status)) throw new Error(`HTTP ${r.status}`); });
  await s.ctx.close();
}
await admin.api("/api/admin/e2e", "POST", { action: "unstaff" });
await browser.close();
console.log(`\n${passes} passed, ${fails.length} failed`); if (fails.length) process.exit(1);
