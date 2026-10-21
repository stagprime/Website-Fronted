// Broken-link crawler: node scripts/crawl.mjs [base=http://127.0.0.1:3000]
// Seeds from every sitemap, follows internal <a href> links on every page (all locales), checks each unique URL once,
// and reports non-2xx/3xx targets with the pages linking to them. Also flags missing/duplicate H1s.
const base = process.argv[2] || "http://127.0.0.1:3000";
const seen = new Map(), refs = new Map(), queue = [], h1 = [];
const add = (u, from) => { try { const x = new URL(u, base); if (x.origin !== new URL(base).origin) return; x.hash = ""; const k = x.pathname + x.search; if (!refs.has(k)) refs.set(k, new Set()); if (from) refs.get(k).add(from); if (!seen.has(k)) { seen.set(k, null); queue.push(k); } } catch {} };
const idx = await (await fetch(base + "/sitemap.xml")).text();
for (const sm of idx.matchAll(/<loc>([^<]+)<\/loc>/g)) { const t = await (await fetch(sm[1].replace(/^https?:\/\/[^/]+/, base))).text(); for (const m of t.matchAll(/<loc>([^<]+)<\/loc>/g)) if (!/\.(webp|jpg|png|svg)$/.test(m[1])) add(m[1].replace(/^https?:\/\/[^/]+/, ""), "sitemap"); }
["/", "/robots.txt", "/rss.xml", "/llms.txt", "/llms-full.txt"].forEach(u => add(u, "seed"));
let n = 0;
async function work() {
  while (queue.length) {
    const k = queue.shift(); let r;
    try { r = await fetch(base + k, { redirect: "manual", headers: { "User-Agent": "Mozilla/5.0 SPCrawler", Cookie: "NEXT_LOCALE=en" } }); } catch (e) { seen.set(k, "ERR"); continue; }
    seen.set(k, r.status); n++;
    if (r.status >= 300 && r.status < 400) { const loc = r.headers.get("location"); if (loc) add(loc, k); continue; }
    if (!(r.headers.get("content-type") || "").includes("text/html")) continue;
    const html = await r.text(); const c = (html.match(/<h1[\s>]/g) || []).length; if (c !== 1 && r.status === 200) h1.push(`${k} (${c} H1)`);
    for (const m of html.matchAll(/<a\b[^>]*href="([^"#][^"]*)"/g)) { const h = m[1].replace(/&amp;/g, "&"); if (/^(mailto:|tel:|https?:\/\/(?!127\.0\.0\.1|localhost))/.test(h)) continue; add(h, k); }
    for (const m of html.matchAll(/<(?:img|source)\b[^>]*(?:src|srcSet)="(\/[^"\s]+)/g)) add(m[1].replace(/&amp;/g, "&"), k);
  }
}
await Promise.all(Array.from({ length: 8 }, work));
const bad = [...seen].filter(([, s]) => s === "ERR" || s >= 400);
console.log(`checked ${n} URLs; broken ${bad.length}`);
for (const [k, s] of bad) console.log(`${s} ${k}  ← ${[...(refs.get(k) || [])].slice(0, 3).join(", ")}`);
if (h1.length) console.log(`H1 issues (${h1.length}):\n` + h1.slice(0, 40).join("\n"));
