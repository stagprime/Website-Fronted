const { chromium } = require("playwright-core");
(async () => {
  const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }); const p = await c.newPage();
  await p.goto("http://localhost:3000/en", { waitUntil: "load" }); await p.waitForTimeout(1000);
  for (const [m, item] of [["Services", "Design & Development"], ["Ventures", "Stag VPN"]]) {
    await p.hover(`nav >> text=${m}`); await p.waitForTimeout(400);
    await p.hover(`header li a:has-text("${item}")`); await p.waitForTimeout(400);
    await p.screenshot({ path: `../previews/v3-megamenu-${m.toLowerCase()}-desktop.png` });
  }
  await b.close();
})();
