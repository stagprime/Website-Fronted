// Final screenshots → previews/final-*.png (desktop 1440 + mobile 390). Dev-only; needs a local server and a seeded dev admin.
const { chromium } = require("playwright-core");
const B = "http://localhost:3000", O = __dirname + "/../../previews/";
const pages = [["home", "/en"], ["service", "/en/services/design-development"], ["store", "/en/store"], ["sentinel", "/en/stag-sentinel"], ["blog", "/en/blog"], ["bn-home", "/bn"], ["ar-rtl-home", "/ar"], ["fr-home", "/fr"]];
(async () => {
  const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  for (const [dev, w, h, m] of [["desktop", 1440, 900, false], ["mobile", 390, 844, true]]) {
    const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m, reducedMotion: "reduce" });
    await c.addCookies([{ name: "sp_consent", value: "necessary", url: B }]);
    const p = await c.newPage();
    for (const [n, u] of pages) { await p.goto(B + u, { waitUntil: "load" }); await p.waitForTimeout(1200); await p.screenshot({ path: `${O}final-${n}-${dev}.png`, fullPage: !m }); }
    await p.goto(B + "/en/login"); await p.fill("#ae", process.env.SHOT_EMAIL); await p.fill("#ap", process.env.SHOT_PASS);
    await Promise.all([p.waitForURL(/account|admin/, { timeout: 15000 }).catch(() => {}), p.press("#ap", "Enter")]); await p.waitForTimeout(1500);
    await p.goto(B + "/en/account", { waitUntil: "load" }); await p.waitForTimeout(1000); await p.screenshot({ path: `${O}final-dashboard-${dev}.png`, fullPage: !m });
    for (const a of ["admin", "admin/chat", "admin/seo"]) { await p.goto(`${B}/${a}`, { waitUntil: "load" }); await p.waitForTimeout(1000); await p.screenshot({ path: `${O}final-${a.replace("/", "-")}-${dev}.png`, fullPage: !m }); }
    if (!m) { await p.goto(B + "/en"); await p.waitForTimeout(800); const l = p.locator('button[aria-label*="hat" i]').first(); if (await l.count()) { await l.click(); await p.waitForTimeout(1200); await p.screenshot({ path: `${O}final-chat-widget-${dev}.png` }); } }
    await c.close();
  }
  await b.close();
})();
