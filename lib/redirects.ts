/**
 * In-memory redirect map for the Node.js middleware (single process, see ecosystem.config.js).
 * Refreshed from the `Redirect` table every 60 s, or immediately after an admin change (bumpRedirects()).
 */
type R = { id: string; to: string; code: number };
const g = globalThis as unknown as { __spRedir?: { at: number; ver: number; map: Map<string, R> }; __spRedirVer?: number };
export function bumpRedirects() { g.__spRedirVer = (g.__spRedirVer || 0) + 1; }
async function load() {
  const ver = g.__spRedirVer || 0;
  if (g.__spRedir && g.__spRedir.ver === ver && Date.now() - g.__spRedir.at < 60_000) return g.__spRedir.map;
  const map = new Map<string, R>();
  try {
    if (process.env.DATABASE_URL || process.env.SP_SQLITE === "1") {
      const { db } = await import("./db");
      for (const r of await db.redirect.findMany({ select: { id: true, from: true, to: true, code: true } })) map.set(r.from.replace(/\/+$/, "") || "/", r);
    }
  } catch { /* DB unavailable → no redirects */ }
  g.__spRedir = { at: Date.now(), ver, map }; return map;
}
/** Match "/de/old" or "/old" (locale-less rules apply to every locale). */
export async function findRedirect(pathname: string, locales: readonly string[]) {
  const map = await load(); if (!map.size) return null;
  const p = pathname.replace(/\/+$/, "") || "/"; const seg = p.split("/")[1]; const loc = locales.includes(seg) ? seg : null;
  const bare = loc ? (p.slice(loc.length + 1) || "/") : p;
  const r = map.get(p) || map.get(bare); if (!r) return null;
  let to = r.to;
  if (to.startsWith("/") && loc && !/^\/[a-z]{2}(\/|$)/.test(to)) to = `/${loc}${to === "/" ? "" : to}`;
  return { ...r, to };
}
export async function countHit(id: string) { try { const { db } = await import("./db"); await db.redirect.update({ where: { id }, data: { hits: { increment: 1 } } }); } catch { /* ignore */ } }
export const GONE_HTML = (home: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>410 — Gone | Stag Prime</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#061733;color:#cbd5e1;font-family:system-ui,sans-serif;text-align:center;padding:2rem}h1{color:#fff;font-size:3rem;margin:.2em 0}a{color:#48BDED}</style></head><body><main><p>410</p><h1>This page is gone.</h1><p>The content was removed permanently.</p><p><a href="${home}">Go to the homepage →</a></p></main></body></html>`;
