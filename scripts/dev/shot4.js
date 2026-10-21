const { chromium } = require("playwright-core");
(async () => {
  const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  let c = await b.newContext({ viewport: { width: 1440, height: 900 } }), p = await c.newPage();
  p.on("pageerror", e => console.log("ERR", e.message));
  await p.goto("http://localhost:3000/en", { waitUntil: "networkidle" }); await p.waitForTimeout(2500);
  await p.screenshot({ path: "../previews/v4-hero-desktop.png" });
  await c.close();
  // full-page captures with reduced motion (static layout, everything visible)
  c = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }); p = await c.newPage();
  await p.goto("http://localhost:3000/en", { waitUntil: "networkidle" });
  for (let y = 0; y < 12000; y += 800) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(120); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800);
  await p.screenshot({ path: "../previews/v4-home-desktop-1440-full.png", fullPage: true });
  c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: "reduce" }); p = await c.newPage();
  await p.goto("http://localhost:3000/en", { waitUntil: "networkidle" });
  for (let y = 0; y < 16000; y += 800) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(100); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800);
  await p.screenshot({ path: "../previews/v4-mobile-390-full.png", fullPage: true });
  await b.close();
})();
