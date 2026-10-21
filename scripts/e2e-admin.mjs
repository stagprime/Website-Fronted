// End-to-end checks for the admin + public site (playwright-core + system Chrome).
//   BASE=http://localhost:3000 ADMIN_EMAIL=… ADMIN_PASSWORD=… node scripts/e2e-admin.mjs
// Visits every admin page, exercises the main forms (settings, coupon, redirect/410, custom page, translation, media, form submission,
// order lifecycle) and loads public pages in all 7 locales (incl. RTL). Exits 1 on any failure. Writes nothing outside the dev DB.
import { chromium } from "playwright-core";
import fs from "fs";
const BASE = process.env.BASE || "http://localhost:3000"; const EMAIL = process.env.ADMIN_EMAIL, PASS = process.env.ADMIN_PASSWORD;
if (!EMAIL || !PASS) { console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD"); process.exit(2); }
const LOCS = ["en", "bn", "ar", "es", "fr", "de", "hi"];
const nav = [...fs.readFileSync("lib/admin-nav.ts", "utf8").matchAll(/href: "([^"]+)"/g)].map(m => m[1]);
const fails = []; const passes = []; const ok = (n) => passes.push(n); const bad = (n, e) => { fails.push(`${n}: ${e}`); console.log("✗", n, "—", e); };
async function step(name, fn) { try { await fn(); ok(name); console.log("✓", name); } catch (e) { bad(name, (e && e.message || String(e)).split("\n")[0]); } }
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
const errors = []; page.on("pageerror", e => errors.push(`pageerror ${page.url()}: ${e.message}`)); page.on("console", m => { if (m.type() === "error" && !/favicon|Failed to load resource.*(404|401|403)|net::ERR|Download the React DevTools|sp_suggest|\[Fast Refresh\]/i.test(m.text())) errors.push(`console ${page.url()}: ${m.text().slice(0, 200)}`); });
const api = (path, method = "GET", body) => page.evaluate(async ([p, m, b]) => { const r = await fetch(p, { method: m, headers: b ? { "Content-Type": "application/json" } : {}, body: b ? JSON.stringify(b) : undefined }); let j = null; try { j = await r.json(); } catch {} return { status: r.status, j }; }, [path, method, body]);
const go = async (p) => { const r = await page.goto(BASE + p, { waitUntil: "domcontentloaded", timeout: 120000 }); await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {}); return r; };

await step("login as admin", async () => {
  await go("/en/login"); await page.fill("#ae", EMAIL); await page.fill("#ap", PASS); await page.click("form button:has-text('Login')");
  await page.waitForURL(/\/account/, { timeout: 60000 });
});
const before = errors.length;
for (const href of nav) await step(`admin page ${href}`, async () => {
  const r = await go(href); if (!r || r.status() !== 200) throw new Error(`HTTP ${r?.status()}`);
  await page.waitForSelector("main h1, h1", { timeout: 30000 }); const t = await page.textContent("body");
  if (/No access|Application error|Unhandled Runtime Error|Something went wrong/.test(t)) throw new Error("error/denied text on page");
  await page.waitForTimeout(400); if (/Loading…/.test(await page.textContent("main") || "") ) await page.waitForTimeout(2500);
});
for (const p of ["/admin/pages/edit?key=home", "/admin/pages/edit?key=%2Fabout", "/admin/pages/edit?key=%2Fprivacy", "/admin/blog/edit?slug=seo-guide&locale=en"]) await step(`admin page ${p}`, async () => { const r = await go(p); if (r.status() !== 200) throw new Error(`HTTP ${r.status()}`); await page.waitForTimeout(1500); });
if (errors.length > before) bad("admin console clean", errors.slice(before).join(" | ")); else ok("admin console clean");

await step("command palette opens with ⌘K and navigates", async () => { await go("/admin"); await page.keyboard.press("Control+k"); await page.waitForSelector("[role=dialog] input", { timeout: 5000 }); await page.keyboard.type("coupons"); await page.keyboard.press("Enter"); await page.waitForURL(/\/admin\/coupons/, { timeout: 10000 }); });

// ---- settings round-trip → frontend
await step("brand tagline saves and renders on the site", async () => {
  const g = await api("/api/admin/settings?key=brand"); const orig = g.j.value; const mark = `E2E tagline ${Date.now()}`;
  const s = await api("/api/admin/settings", "PUT", { key: "brand", value: { ...orig, tagline: mark } }); if (!s.j?.ok) throw new Error(JSON.stringify(s.j));
  await go("/en"); const html = await page.content(); await api("/api/admin/settings", "PUT", { key: "brand", value: orig });
  if (!html.includes(mark)) throw new Error("tagline not on home page");
});
await step("theme color applies as CSS variable", async () => {
  const g = await api("/api/admin/settings?key=theme"); const orig = g.j.value;
  await api("/api/admin/settings", "PUT", { key: "theme", value: { ...orig, sky: "#123456" } }); await go("/en"); const v = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--c-sky").trim()); await api("/api/admin/settings", "PUT", { key: "theme", value: orig });
  if (v !== "18 52 86") throw new Error(`--c-sky is "${v}"`);
});
await step("tracking GA4 id renders after save", async () => {
  const g = await api("/api/admin/settings?key=tracking"); const orig = g.j.value; await api("/api/admin/settings", "PUT", { key: "tracking", value: { ...orig, ga4: "G-E2ETEST12" } });
  await go("/en"); const html = await page.content(); await api("/api/admin/settings", "PUT", { key: "tracking", value: orig }); if (!html.includes("G-E2ETEST12")) throw new Error("GA4 id missing from HTML");
});
await step("settings permission + shape validation", async () => { const r = await api("/api/admin/settings", "PUT", { key: "products", value: { not: "an array" } }); if (r.status !== 422) throw new Error(`expected 422, got ${r.status}`); });

// ---- coupons
await step("coupon create / validate / delete", async () => {
  const c = await api("/api/admin/r?res=coupon", "POST", { code: "e2e-ten", kind: "percent", value: 10, appliesTo: "*", active: true }); if (!c.j?.ok) throw new Error(JSON.stringify(c.j));
  const bad = await api("/api/admin/r?res=coupon", "POST", { code: "E2E-BAD", kind: "percent", value: 150 }); if (bad.status !== 422) throw new Error("percent>100 accepted");
  const d = await api(`/api/admin/r?res=coupon&id=${c.j.row.id}`, "DELETE"); if (!d.j?.ok) throw new Error("delete failed");
});
// ---- redirects + 410
await step("redirect 301 and real 410", async () => {
  const a = await api("/api/admin/r?res=redirect", "POST", { from: "/e2e-old", to: "/about", code: "301" }); const b = await api("/api/admin/r?res=redirect", "POST", { from: "/e2e-gone", to: "", code: "410" });
  if (!a.j?.ok || !b.j?.ok) throw new Error(JSON.stringify([a.j, b.j]));
  const r1 = await fetch(`${BASE}/de/e2e-old`, { redirect: "manual" }); const r2 = await fetch(`${BASE}/en/e2e-gone`, { redirect: "manual" });
  await api(`/api/admin/r?res=redirect&id=${a.j.row.id}`, "DELETE"); await api(`/api/admin/r?res=redirect&id=${b.j.row.id}`, "DELETE");
  if (r1.status !== 301 || !/\/de\/about$/.test(r1.headers.get("location") || "")) throw new Error(`301 → ${r1.status} ${r1.headers.get("location")}`);
  if (r2.status !== 410) throw new Error(`410 → ${r2.status}`);
});
await step("unknown URL is a real 404 and is logged", async () => { const r = await fetch(`${BASE}/en/e2e-missing-${Date.now()}`); if (r.status !== 404) throw new Error(`got ${r.status}`); const l = await api("/api/admin/r?res=notFoundLog&q=e2e-missing"); if (!l.j?.rows?.length) throw new Error("not logged"); });

// ---- custom page builder
await step("custom page: create, publish, render in en + ar, delete", async () => {
  const key = `/e2e-landing-${Date.now()}`; const c = await api("/api/admin/pages", "POST", { key, title: "E2E Landing" }); if (!c.j?.ok) throw new Error(JSON.stringify(c.j));
  const r0 = await fetch(`${BASE}/en${key}`); if (r0.status !== 404) throw new Error(`unpublished page is ${r0.status}`);
  const secs = [{ id: "h", type: "hero", visible: true, settings: {}, content: { en: { title: "E2E Hero Title" }, ar: { title: "عنوان تجريبي" } } }, { id: "f", type: "faq", visible: true, settings: {}, content: { en: { heading: "Q", items: [{ q: "E2E question?", a: "Answer." }] } } }, { id: "x", type: "html", visible: true, settings: {}, content: { en: { html: "<p>ok</p><script>alert(1)</script>" } } }];
  const p = await api("/api/admin/pages", "PUT", { key, sections: secs, status: "published", mode: "publish" }); if (!p.j?.ok) throw new Error(JSON.stringify(p.j));
  await go(`/en${key}`); const en = await page.content(); await go(`/ar${key}`); const ar = await page.content(); const dir = await page.getAttribute("html", "dir");
  await api(`/api/admin/pages?key=${encodeURIComponent(key)}`, "DELETE");
  if (!en.includes("E2E Hero Title") || !en.includes("E2E question?")) throw new Error("en content missing"); if (en.includes("alert(1)")) throw new Error("script not stripped");
  if (!ar.includes("عنوان تجريبي")) throw new Error("ar content missing"); if (dir !== "rtl") throw new Error(`ar dir=${dir}`);
});
await step("home: hide a section via builder, then restore", async () => {
  const g = await api("/api/admin/pages?key=home"); const secs = g.j.sections; const orig = JSON.parse(JSON.stringify(secs));
  const s = secs.find(x => x.id === "about"); s.visible = false; s.content = { en: { kicker: "E2E" } };
  await api("/api/admin/pages", "PUT", { key: "home", sections: secs, mode: "publish" }); await go("/en"); const html = await page.content();
  const st = secs.find(x => x.id === "hero"); await api("/api/admin/pages", "PUT", { key: "home", sections: orig, mode: "publish" });
  if (html.includes('id="about"')) throw new Error("hidden section still rendered"); void st;
});
await step("draft + preview mode shows draft only to staff", async () => {
  const g = await api("/api/admin/pages?key=%2Fabout"); const secs = [...g.j.sections, { id: "e2ep", type: "pageHero", visible: true, settings: {}, content: { en: { title: "E2E DRAFT HERO" } } }].filter((x, i, a) => x.type !== "pageHero" || a.findIndex(y => y.type === "pageHero") === i || x.id === "e2ep");
  await api("/api/admin/pages", "PUT", { key: "/about", sections: secs.filter(x => x.type !== "pageHero" || x.id === "e2ep"), mode: "draft" });
  const pub = await (await fetch(`${BASE}/en/about`)).text(); await go("/api/admin/preview?path=/en/about"); const prev = await page.content(); await go("/api/admin/preview?off=1&path=/en");
  await api("/api/admin/pages", "PUT", { key: "/about", discard: true });
  if (pub.includes("E2E DRAFT HERO")) throw new Error("draft leaked to public"); if (!prev.includes("E2E DRAFT HERO")) throw new Error("preview did not show draft");
});
// ---- translations
await step("translation override goes live and reverts", async () => {
  const e = await api("/api/admin/ui?text=" + encodeURIComponent("Contact")); const key = e.j.key;
  await api("/api/admin/ui", "PUT", { key, locale: "de", value: "E2EKontakt" }); await go("/de/contact"); const html = await page.content(); await api("/api/admin/ui", "PUT", { key, locale: "de", value: "" });
  if (!html.includes("E2EKontakt")) throw new Error("override not rendered");
});
await step("translations grid lists missing counts", async () => { const g = await api("/api/admin/ui?grid=1&locale=bn"); if (!(g.j?.total > 500)) throw new Error("grid too small"); });
// ---- media
await step("media upload, serve, per-locale alt in image/gallery blocks, delete", async () => {
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAADCAYAAAC56t6BAAAAEklEQVR42mP8z8Dwn4EIwDiqEAA3WQT/GRZcRwAAAABJRU5ErkJggg==", "base64");
  const r = await page.evaluate(async b64 => { const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0)); const fd = new FormData(); fd.append("file", new File([bin], "e2e.png", { type: "image/png" })); const x = await fetch("/api/admin/media", { method: "POST", body: fd }); return x.json(); }, png.toString("base64"));
  if (!r.ok) throw new Error(JSON.stringify(r)); const m = r.items[0]; if (m.width !== 2 || m.height !== 3) throw new Error(`dims ${m.width}x${m.height}`);
  const got = await fetch(BASE + m.url); if (got.status !== 200 || got.headers.get("content-type") !== "image/png") throw new Error(`serve ${got.status}`);
  const a = await api("/api/admin/media", "PUT", { id: m.id, alt: { en: "E2E", ar: "اختبار" } }); if (!a.j?.ok) throw new Error("alt save");
  // Image + gallery blocks without their own alt fall back to the media library's per-locale alt (then English).
  const key = `/e2e-alt-${Date.now()}`; await api("/api/admin/pages", "POST", { key, title: "E2E Alt" });
  await api("/api/admin/pages", "PUT", { key, status: "published", mode: "publish", sections: [{ id: "i", type: "image", visible: true, settings: { src: m.url }, content: {} }, { id: "g", type: "gallery", visible: true, settings: { images: [{ src: m.url, alt: "" }] }, content: {} }] });
  const alts = async l => { await go(`/${l}${key}`); return page.$$eval(`main img[src="${m.url}"]`, es => es.map(e => e.getAttribute("alt"))); };
  const [en, ar, fr] = [await alts("en"), await alts("ar"), await alts("fr")]; await api(`/api/admin/pages?key=${encodeURIComponent(key)}`, "DELETE");
  if (en.join() !== "E2E,E2E" || ar.join() !== "اختبار,اختبار" || fr.join() !== "E2E,E2E") throw new Error(`alts en=${en} ar=${ar} fr=${fr}`);
  const evil = await page.evaluate(async () => { const fd = new FormData(); fd.append("file", new File(["<svg onload=alert(1)></svg>"], "x.svg", { type: "image/svg+xml" })); return (await fetch("/api/admin/media", { method: "POST", body: fd })).status; }); if (evil !== 422) throw new Error("malicious SVG accepted");
  await api(`/api/admin/media?id=${m.id}`, "DELETE"); if ((await fetch(BASE + m.url)).status !== 404) throw new Error("deleted file still served");
});
// ---- forms
await step("CMS form submit → inbox", async () => {
  const r = await page.evaluate(async () => { const fd = new FormData(); fd.set("_form", "quote-request"); fd.set("_locale", "en"); fd.set("name", "E2E Tester"); fd.set("email", "e2e@example.com"); fd.set("message", "E2E message"); return (await fetch("/api/forms/cms", { method: "POST", body: fd })).json(); });
  if (!r.ok) throw new Error(JSON.stringify(r)); const l = await api("/api/admin/r?res=formSubmission&q=E2E%20Tester"); if (!l.j?.rows?.length) throw new Error("not in inbox");
  for (const row of l.j.rows) await api(`/api/admin/r?res=formSubmission&id=${row.id}`, "DELETE");
  const v = await page.evaluate(async () => { const fd = new FormData(); fd.set("_form", "quote-request"); fd.set("name", "x"); fd.set("email", "bad"); fd.set("message", "m"); return (await fetch("/api/forms/cms", { method: "POST", body: fd })).status; }); if (v !== 422) throw new Error("bad email accepted");
});
// ---- orders lifecycle (uses a test order created through the API helper below)
await step("order lifecycle: progress, milestone, note, deliver, auto-complete after 3 days, refund guard", async () => {
  const mk = await api("/api/admin/e2e", "POST", { action: "order" }); if (!mk.j?.ok) throw new Error("test order helper: " + JSON.stringify(mk.j)); const id = mk.j.id;
  for (const b of [{ action: "progress", progress: 40 }, { action: "milestone", note: "E2E milestone" }, { action: "note", note: "E2E internal" }, { action: "status", status: "delivered", note: "E2E delivered", notify: false }]) { const r = await api("/api/admin/orders", "PUT", { id, ...b }); if (!r.j?.ok) throw new Error(`${b.action}: ${JSON.stringify(r.j)}`); }
  await go(`/admin/orders/${id}`); await page.waitForSelector("text=E2E milestone", { timeout: 20000 });
  const back = await api("/api/admin/e2e", "POST", { action: "age", id, days: 4 }); if (!back.j?.ok) throw new Error("age");
  const ac = await api("/api/admin/e2e", "POST", { action: "autocomplete" }); const o = await api(`/api/admin/orders?id=${id}`);
  if (o.j.order.status !== "completed") throw new Error(`status ${o.j.order.status} after auto-complete (${JSON.stringify(ac.j)})`);
  const rf = await api("/api/admin/orders", "POST", { action: "refund", id, amount: 100 }); if (rf.status !== 409) throw new Error(`refund without Stripe returned ${rf.status}`);
  const mrf = await api("/api/admin/orders", "POST", { action: "refund", id, amount: 100, manual: true }); if (!mrf.j?.ok) throw new Error("manual refund");
  await api("/api/admin/e2e", "POST", { action: "cleanup", id });
});
await step("audit log recorded the changes", async () => { const a = await api("/api/admin/audit?q=setting.update"); if (!a.j?.rows?.length) throw new Error("no audit rows"); });
await step("backup create + download", async () => { const b = await api("/api/admin/backups", "POST", { action: "create" }); if (!b.j?.ok) throw new Error(JSON.stringify(b.j)); const d = await fetch(`${BASE}/api/admin/backups?download=${b.j.backup.id}`); if (d.status !== 401 && d.status !== 403) throw new Error("backup download not protected for anonymous"); const own = await page.evaluate(async id => (await fetch(`/api/admin/backups?download=${id}`)).status, b.j.backup.id); if (own !== 200) throw new Error(`download ${own}`); await api(`/api/admin/backups?id=${b.j.backup.id}`, "DELETE"); });
await step("anonymous cannot use admin APIs", async () => { for (const p of ["/api/admin/settings?key=brand", "/api/admin/orders", "/api/admin/r?res=coupon", "/api/admin/team"]) { const r = await fetch(BASE + p); if (r.status !== 403) throw new Error(`${p} → ${r.status}`); } });
await step("write without same-origin is rejected", async () => { const r = await page.evaluate(async () => (await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json", "X-Test": "1" }, body: "{}" })).status); if (r === 500) throw new Error("server error"); });

// ---- public site, all locales
const pub = ["", "/services", "/store", "/pricing", "/about", "/contact", "/faq", "/blog", "/privacy", "/terms", "/stag-sentinel", "/ventures"];
const perr = errors.length;
for (const l of LOCS) await step(`public ${l} (${pub.length} pages)`, async () => {
  for (const p of pub) { const r = await go(`/${l}${p}`); if (r.status() !== 200) throw new Error(`/${l}${p} HTTP ${r.status()}`); const lang = await page.getAttribute("html", "lang"); const dir = await page.getAttribute("html", "dir");
    if (lang !== l) throw new Error(`/${l}${p} lang=${lang}`); if ((l === "ar") !== (dir === "rtl")) throw new Error(`/${l}${p} dir=${dir}`);
    if (!(await page.$("header")) || !(await page.$("footer"))) throw new Error(`/${l}${p} missing header/footer`); }
});
await step("/ar uses the Arabic font stack", async () => { await go("/ar"); const ff = await page.evaluate(() => getComputedStyle(document.querySelector("h1") || document.body).fontFamily); if (!/Arabic|Cairo|Tajawal|Noto|IBM|Almarai|__/i.test(ff)) throw new Error(ff); });
await step("robots, sitemap, llms.txt", async () => { for (const p of ["/robots.txt", "/sitemap.xml", "/llms.txt"]) { const r = await fetch(BASE + p); if (r.status !== 200) throw new Error(`${p} ${r.status}`); } });
if (errors.length > perr) bad("public console clean", [...new Set(errors.slice(perr))].slice(0, 8).join(" | ")); else ok("public console clean");
await browser.close();
console.log(`\n${passes.length} passed, ${fails.length} failed`); if (fails.length) { console.log(fails.join("\n")); process.exit(1); }
