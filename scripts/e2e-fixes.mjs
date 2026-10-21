// E2E checks for the review fixes: proxy-seen IP in the audit log, login ?next=, llms.txt with admin posts,
// editable About/Contact/Careers/Blog/legal sections + hero images, translated 404 titles. (Prod-only 404 of the e2e route is checked by scripts/prod-check.mjs.)
//   ADMIN_EMAIL=… ADMIN_PASSWORD=… node scripts/e2e-fixes.mjs
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:3000"; const EMAIL = process.env.ADMIN_EMAIL, PASS = process.env.ADMIN_PASSWORD;
if (!EMAIL || !PASS) { console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD"); process.exit(2); }
let passes = 0; const fails = [];
async function step(name, fn) { try { await fn(); passes++; console.log("✓", name); } catch (e) { fails.push(name); console.log("✗", name, "—", (e?.message || String(e)).split("\n")[0]); } }
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const login = async (page) => { await page.fill("#ae", EMAIL); await page.fill("#ap", PASS); await page.click("form button:has-text('Login')"); };
const fresh = async () => { const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); return { ctx, page: await ctx.newPage() }; };

// ---- 2. login ?next=
await step("anonymous /admin/coupons → login?next=/admin/coupons → back to /admin/coupons", async () => {
  const { ctx, page } = await fresh(); await page.goto(BASE + "/admin/coupons", { waitUntil: "networkidle", timeout: 120000 });
  const u = new URL(page.url()); if (!u.pathname.endsWith("/login") || u.searchParams.get("next") !== "/admin/coupons") throw new Error(`landed on ${page.url()}`);
  await login(page); await page.waitForURL(u => new URL(u).pathname === "/admin/coupons", { timeout: 60000 }); await ctx.close(); });
for (const evil of ["//evil.example", "https://evil.example/", "/\\evil.example", "javascript:alert(1)"]) await step(`login ignores unsafe next=${evil}`, async () => {
  const { ctx, page } = await fresh(); await page.goto(`${BASE}/en/login?next=${encodeURIComponent(evil)}`, { waitUntil: "networkidle", timeout: 120000 });
  await login(page); await page.waitForURL(u => new URL(u).pathname.startsWith("/en/account"), { timeout: 60000 }); if (!page.url().startsWith(BASE)) throw new Error(page.url()); await ctx.close(); });

// admin session for the rest
const { page } = await fresh(); await page.goto(BASE + "/en/login?next=/admin", { waitUntil: "networkidle", timeout: 120000 }); await login(page); await page.waitForURL(u => new URL(u).pathname === "/admin", { timeout: 60000 }); await page.waitForLoadState("networkidle").catch(() => {});
const api = (p, m = "GET", b, h = {}) => page.evaluate(async ([p, m, b, h]) => { const r = await fetch(p, { method: m, headers: { ...(b ? { "Content-Type": "application/json" } : {}), ...h }, body: b ? JSON.stringify(b) : undefined }); let j = null; try { j = await r.json(); } catch {} return { status: r.status, j }; }, [p, m, b, h]);
const html = async (p) => { const r = await fetch(BASE + p); return { status: r.status, text: await r.text() }; };
const go = async (p) => { await page.goto(BASE + p, { waitUntil: "domcontentloaded", timeout: 120000 }); await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {}); return page.content(); };

// ---- 1. audit IP = proxy-seen
await step("audit log stores the last X-Forwarded-For hop, not the spoofed first one", async () => {
  const g = await api("/api/admin/settings?key=llms"); const v = g.j.value;
  await api("/api/admin/settings", "PUT", { key: "llms", value: v }, { "X-Forwarded-For": "6.6.6.6, 198.51.100.23" });
  const a = await api("/api/admin/audit?entity=setting&q=setting.update"); const row = a.j?.rows?.[0]; if (!row) throw new Error(JSON.stringify(a).slice(0, 200)); if (row.ip !== "198.51.100.23") throw new Error(`ip=${row.ip}`); });
await step("audit log prefers X-Real-IP", async () => {
  const g = await api("/api/admin/settings?key=llms"); await api("/api/admin/settings", "PUT", { key: "llms", value: g.j.value }, { "X-Forwarded-For": "6.6.6.6, 198.51.100.23", "X-Real-IP": "203.0.113.77" });
  const a = await api("/api/admin/audit?entity=setting&q=setting.update"); if (a.j.rows[0].ip !== "203.0.113.77") throw new Error(`ip=${a.j.rows[0].ip}`); });

// ---- 3. llms.txt lists admin-written posts
await step("admin-written blog post appears in llms.txt and llms-full.txt, gone after delete", async () => {
  const slug = `e2e-llms-${Date.now()}`, title = `E2E LLMS Post ${Date.now()}`;
  const r = await api("/api/admin/blog", "PUT", { slug, locale: "en", title, description: "An end-to-end test post that should be listed in llms.txt for AI crawlers.", category: "Guides", body: "## Hi\n\nBody text.", status: "published" }); if (!r.j?.ok) throw new Error(JSON.stringify(r.j));
  const a = (await html("/llms.txt")).text, b = (await html("/llms-full.txt")).text; await api(`/api/admin/blog?slug=${slug}&locale=en`, "DELETE"); const c = (await html("/llms.txt")).text;
  if (!a.includes(title) || !a.includes(`/en/blog/${slug}`)) throw new Error("missing in llms.txt"); if (!b.includes(title)) throw new Error("missing in llms-full.txt"); if (c.includes(title)) throw new Error("still listed after delete"); });

// ---- 4. editable coded pages
const edit = async (key, fn) => { const g = await api(`/api/admin/pages?key=${encodeURIComponent(key)}`); const orig = JSON.parse(JSON.stringify(g.j.sections)); const secs = g.j.sections; fn(secs);
  const p = await api("/api/admin/pages", "PUT", { key, sections: secs, mode: "publish" }); if (!p.j?.ok) throw new Error(JSON.stringify(p.j)); return () => api("/api/admin/pages", "PUT", { key, sections: orig, mode: "publish" }); };
const S = (secs, id) => { const s = secs.find(x => x.id === id); if (!s) throw new Error(`section ${id} not seeded`); return s; };
await step("coded pages are seeded with their built-in sections + hero image", async () => {
  for (const [k, ids] of [["/about", ["stats", "vision", "story", "founder"]], ["/contact", ["form", "offices"]], ["/careers", ["apply", "cards"]], ["/blog", ["posts"]], ["/terms", ["legalMeta"]], ["/privacy", ["legalMeta"]]]) {
    const g = await api(`/api/admin/pages?key=${encodeURIComponent(k)}`); const secs = g.j.sections; if (!g.j.registry.legacy.length) throw new Error(`${k}: no registry`);
    for (const id of ids) S(secs, id); const h = secs.find(x => x.type === "pageHero"); if (!h?.settings?.image) throw new Error(`${k}: hero image not seeded`); }
  const a = (await api("/api/admin/pages?key=%2Fabout")).j.sections; if (S(a, "stats").content.en.items[1].value !== "150+") throw new Error("counters not seeded from current content"); });
await step("About counters + copy + hero image edits go live (en) and copy stays translated (de)", async () => {
  const undo = await edit("/about", secs => { const st = S(secs, "stats"); st.content.en.items = [{ value: "7+", label: "E2E Years" }, { value: "321+", label: "E2E Projects" }]; S(secs, "founder").content.en.role = "E2E Founder Role"; secs.find(x => x.type === "pageHero").settings.image = "/img/ai/page-contact.webp"; });
  const en = await go("/en/about"); const de = (await html("/de/about")).text; await undo();
  if (!en.includes("E2E Projects") || !en.includes("321+") || en.includes("Projects Done")) throw new Error("counters not applied"); if (!en.includes("E2E Founder Role")) throw new Error("founder role");
  if (!en.includes("page-contact")) throw new Error("hero image not applied"); if (!de.includes("E2E Projects")) throw new Error("de should fall back to the English override"); if (de.includes("Vision<") && !de.includes("Vision")) throw new Error("de"); });
await step("About sections can be hidden", async () => {
  const undo = await edit("/about", secs => { S(secs, "founder").visible = false; }); const en = (await html("/en/about")).text; await undo(); const back = (await html("/en/about")).text;
  if (en.includes("Md Tariq Hossain</h2>")) throw new Error("founder still visible"); if (!back.includes("Md Tariq Hossain</h2>")) throw new Error("founder not restored"); });
await step("Contact offices, Careers cards/button and Blog labels are editable", async () => {
  const u1 = await edit("/contact", secs => { S(secs, "offices").content.en.hqTitle = "E2E HQ Title"; });
  const u2 = await edit("/careers", secs => { const c = S(secs, "cards"); c.content.en.items = [{ title: "E2E Role Card", text: "x", icon: "users" }]; S(secs, "apply").content.en.label = "E2E Apply"; });
  const u3 = await edit("/blog", secs => { S(secs, "posts").content.en.leadLabel = "E2E Featured"; });
  const [c, k, b] = [(await html("/en/contact")).text, (await html("/en/careers")).text, (await html("/en/blog")).text]; await u1(); await u2(); await u3();
  if (!c.includes("E2E HQ Title")) throw new Error("contact"); if (!k.includes("E2E Role Card") || k.includes("Internship program") || !k.includes("E2E Apply")) throw new Error("careers"); if (!b.includes("E2E Featured")) throw new Error("blog"); });
await step("Terms/Privacy: draft banner toggle + last-updated date (translated label)", async () => {
  const before = (await html("/en/terms")).text; if (!before.includes("legal-banner") || !before.includes("Last updated: 2026. Template")) throw new Error("default banner/date missing");
  const undo = await edit("/terms", secs => { const m = S(secs, "legalMeta"); m.settings.showBanner = false; m.settings.updated = "1 January 2027"; m.content.en.note = ""; });
  const u2 = await edit("/privacy", secs => { S(secs, "legalMeta").content.en.banner = "E2E banner text"; });
  const en = (await html("/en/terms")).text, de = (await html("/de/terms")).text, pr = (await html("/en/privacy")).text; await undo(); await u2(); const after = (await html("/en/terms")).text;
  if (en.includes("legal-banner")) throw new Error("banner still shown"); if (!en.includes("Last updated: 1 January 2027.")) throw new Error("date not applied");
  if (!de.includes("Zuletzt aktualisiert: 1 January 2027")) throw new Error("de label"); if (!pr.includes("E2E banner text")) throw new Error("privacy banner text"); if (!after.includes("legal-banner")) throw new Error("not restored"); });
await step("admin page builder shows the built-in sections for /about", async () => {
  await go("/admin/pages/edit?key=%2Fabout"); await page.waitForTimeout(1500); const t = await page.textContent("main"); for (const n of ["Counters", "Founder", "Vision & mission"]) if (!t.includes(n)) throw new Error(`missing ${n}`); });

// ---- 5. 404 titles per locale
const T404 = { en: "Page not found", de: "Seite nicht gefunden", ar: "الصفحة غير موجودة", fr: null, es: null, bn: null, hi: null };
for (const l of Object.keys(T404)) await step(`404 title translated (${l})`, async () => {
  for (const p of [`/${l}/zz-nope-${l}`, `/${l}/services/zz-nope`]) { const r = await html(p); if (r.status !== 404) throw new Error(`${p} ${r.status}`); const t = (r.text.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
    if (!t.endsWith("(404) | Stag Prime")) throw new Error(`${p}: ${t}`); if (T404[l] && !t.startsWith(T404[l])) throw new Error(`${p}: ${t}`); if (!T404[l] && t.startsWith("Page not found")) throw new Error(`${p} untranslated: ${t}`); } });

await browser.close();
console.log(`\n${passes} passed, ${fails.length} failed`); if (fails.length) process.exit(1);
