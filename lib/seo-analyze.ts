/** Lightweight on-page SEO analyzer used by /admin/seo. Fetches a rendered page and scores common checks (0–100). */
export type Check = { id: string; ok: boolean; msg: string; weight: number };
const get = (re: RegExp, s: string) => (s.match(re)?.[1] || "").trim();
export async function analyze(url: string, focusKw?: string) {
  const r = await fetch(url, { headers: { "User-Agent": "StagPrimeSEO/1.0 (+admin)" }, cache: "no-store", signal: AbortSignal.timeout(15000) });
  const html = await r.text(); const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const title = get(/<title[^>]*>([^<]*)<\/title>/i, html), desc = get(/<meta name="description" content="([^"]*)"/i, html);
  const h1 = (html.match(/<h1[\s>]/gi) || []).length, canonical = get(/<link rel="canonical" href="([^"]*)"/i, html);
  const hreflang = (html.match(/hreflang="/g) || []).length, imgs = html.match(/<img\b[^>]*>/gi) || [];
  const noAlt = imgs.filter(i => !/\balt="/.test(i)).length, ld = (html.match(/application\/ld\+json/g) || []).length;
  const words = text.split(" ").length, kw = (focusKw || "").toLowerCase(), robots = get(/<meta name="robots" content="([^"]*)"/i, html);
  const checks: Check[] = [
    { id: "status", ok: r.status === 200, msg: `HTTP ${r.status}`, weight: 15 },
    { id: "title", ok: title.length >= 20 && title.length <= 65, msg: `Title ${title.length} chars (aim 30–60)`, weight: 12 },
    { id: "desc", ok: desc.length >= 70 && desc.length <= 160, msg: `Meta description ${desc.length} chars (aim 70–155)`, weight: 10 },
    { id: "h1", ok: h1 === 1, msg: `${h1} H1 tag(s) (need exactly 1)`, weight: 10 },
    { id: "canonical", ok: !!canonical, msg: canonical ? `Canonical ${canonical}` : "Missing canonical", weight: 8 },
    { id: "hreflang", ok: hreflang >= 8, msg: `${hreflang} hreflang links (7 locales + x-default)`, weight: 8 },
    { id: "alt", ok: noAlt === 0, msg: `${noAlt} of ${imgs.length} images missing alt`, weight: 8 },
    { id: "schema", ok: ld > 0, msg: `${ld} JSON-LD blocks`, weight: 8 },
    { id: "words", ok: words >= 300, msg: `${words} words on page`, weight: 8 },
    { id: "index", ok: !/noindex/.test(robots), msg: robots ? `robots: ${robots}` : "Indexable", weight: 5 },
    ...(kw ? [{ id: "kw-title", ok: title.toLowerCase().includes(kw), msg: `Focus keyword ${title.toLowerCase().includes(kw) ? "in" : "not in"} title`, weight: 4 }, { id: "kw-body", ok: text.toLowerCase().includes(kw), msg: `Focus keyword ${text.toLowerCase().includes(kw) ? "found" : "not found"} in content`, weight: 4 }] : []),
  ];
  const total = checks.reduce((a, c) => a + c.weight, 0), score = Math.round(checks.filter(c => c.ok).reduce((a, c) => a + c.weight, 0) / total * 100);
  return { url, score, title, desc, checks };
}
