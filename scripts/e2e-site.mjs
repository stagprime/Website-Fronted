// Public website checks after the admin moved to separate apps: SITE_URL=… node scripts/e2e-site.mjs
// Locales (incl. RTL), mobile layout, console errors, no admin area, no customer data on public routes, webhook/preview are locked.
import { chromium } from "playwright-core";
const S = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, ""); const BYPASS = process.env.VERCEL_BYPASS ? { "x-vercel-protection-bypass": process.env.VERCEL_BYPASS } : {};
let passes = 0; const fails = []; async function step(n, fn) { try { await fn(); passes++; console.log("✓", n); } catch (e) { fails.push(n); console.log("✗", n, "—", (e?.message || String(e)).split("\n")[0].slice(0, 300)); } }
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
for (const mobile of [false, true]) {
  const ctx = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile, extraHTTPHeaders: BYPASS }); const page = await ctx.newPage(); const errs = [];
  page.on("pageerror", e => errs.push(`${page.url()}: ${e.message}`)); page.on("console", m => { if (m.type() === "error" && !/favicon|Failed to load resource.*(401|403|404)|net::ERR|DevTools|Fast Refresh/i.test(m.text())) errs.push(`${page.url()}: ${m.text().slice(0, 160)}`); });
  for (const l of ["en", "bn", "ar"]) for (const p of ["", "/services", "/store", "/blog", "/about", "/contact", "/account"]) await step(`${mobile ? "mobile" : "desktop"} /${l}${p}`, async () => {
    const r = await page.goto(`${S}/${l}${p}`, { waitUntil: "domcontentloaded", timeout: 120000 }); await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    if (!r || r.status() !== 200) throw new Error(`HTTP ${r?.status()}`); if ((await page.getAttribute("html", "lang")) !== l) throw new Error("lang"); if (l === "ar" && (await page.getAttribute("html", "dir")) !== "rtl") throw new Error("not rtl");
    const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (over > 2) throw new Error(`horizontal overflow ${over}px`); });
  await step(`${mobile ? "mobile" : "desktop"}: no console errors`, async () => { if (errs.length) throw new Error(errs.slice(0, 3).join(" | ")); }); await ctx.close();
}
const get = async (p, init = {}) => { const r = await fetch(S + p, { redirect: "manual", ...init, headers: { ...BYPASS, ...(init.headers || {}) } }); return { status: r.status, text: await r.text() }; };
await step("no admin area on the website", async () => { for (const p of ["/admin", "/admin/orders", "/api/admin/orders", "/api/admin/settings?key=brand", "/api/admin/e2e"]) { const r = await get(p); if (![404, 405].includes(r.status) && !(r.status >= 300 && r.status < 400)) throw new Error(`${p} → ${r.status}`); if (/E2E|"orders":/.test(r.text)) throw new Error(`${p} leaked`); } });
await step("customer APIs need a session", async () => { for (const p of ["/api/download?f=x", "/api/orders", "/api/account"]) { const r = await get(p); if (r.status === 200 && /@/.test(r.text)) throw new Error(`${p} leaked`); if (r.status >= 500) throw new Error(`${p} → ${r.status}`); } });
await step("revalidate webhook refuses calls without the secret", async () => { for (const h of [{}, { authorization: "Bearer wrong" }]) { const r = await get("/api/revalidate", { method: "POST", headers: { "content-type": "application/json", ...h }, body: '{"tags":["settings"]}' }); if (r.status !== 401) throw new Error(String(r.status)); } });
await step("draft preview refuses unsigned links", async () => { const r = await get(`/api/preview?path=/en/about&exp=${Date.now() + 60000}&sig=x`); if (r.status !== 403) throw new Error(String(r.status)); });
await browser.close(); console.log(`\n${passes} passed, ${fails.length} failed`); if (fails.length) process.exit(1);
