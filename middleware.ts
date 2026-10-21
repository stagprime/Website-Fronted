import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, geoLocale } from "./lib/i18n";
import { findRedirect, countHit, GONE_HTML } from "./lib/redirects";
const BOT = /bot|crawler|spider|crawling|google|bing|slurp|duckduck|yandex|baidu|facebookexternalhit|lighthouse|semrush|ahrefs/i;
const has = (l?: string | null): l is string => !!l && (locales as readonly string[]).includes(l);
function accept(req: NextRequest) {
  return (req.headers.get("accept-language") || "").split(",").map(s => { const [t, q] = s.trim().split(";q="); return { l: t.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 }; })
    .sort((a, b) => b.q - a.q).map(x => x.l).find(has);
}
const geo = (req: NextRequest) => { const c = (req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "").toUpperCase(); return geoLocale[c]; };
/** Public origin as the visitor sees it (behind Nginx/PM2 req.url is the internal localhost:3000). */
function pub(path: string, req: NextRequest) {
  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host).split(",")[0].trim();
  const proto = (req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "")).split(",")[0].trim();
  return new URL(path, `${proto}://${host}`);
}
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) { const h = new Headers(req.headers); h.set("x-sp-path", pathname); return NextResponse.next({ request: { headers: h } }); }
  const bot = BOT.test(req.headers.get("user-agent") || "");
  const seg = pathname.split("/")[1];
  // Redirect manager (Admin → SEO → Redirects): 301/302/307/308 redirect, 410 Gone with a real 410 status.
  const r = await findRedirect(pathname, locales);
  if (r) { void countHit(r.id);
    if (r.code === 410 || r.code === 451) return new NextResponse(GONE_HTML(`/${has(seg) ? seg : defaultLocale}`), { status: r.code, headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" } });
    return NextResponse.redirect(pub(r.to, req), [301, 302, 307, 308].includes(r.code) ? r.code : 301); }
  if (has(seg)) {
    // Locale already in URL: never redirect. Only set a *suggestion* cookie for the banner (humans without a saved choice).
    const res = NextResponse.next();
    if (!bot && !req.cookies.get("NEXT_LOCALE")) { const a = accept(req); const sug = a && a !== seg ? a : geo(req); if (sug && sug !== seg) res.cookies.set("sp_suggest", sug, { path: "/", maxAge: 86400, sameSite: "lax" }); }
    return res;
  }
  // Unprefixed URL. Bots get the default locale content via rewrite (no redirect); humans: cookie > Accept-Language > geo > default.
  if (bot) return NextResponse.rewrite(new URL(`/${defaultLocale}${pathname === "/" ? "" : pathname}${req.nextUrl.search}`, req.url));
  const c = req.cookies.get("NEXT_LOCALE")?.value;
  const locale = (has(c) && c) || accept(req) || defaultLocale;
  const res = NextResponse.redirect(pub(`/${locale}${pathname === "/" ? "" : pathname}${req.nextUrl.search}`, req), 307);
  const g = geo(req); if (!c && g && g !== locale) res.cookies.set("sp_suggest", g, { path: "/", maxAge: 86400, sameSite: "lax" });
  return res;
}
export const config = { runtime: "nodejs", matcher: ["/((?!_next|api|img|rss.xml|llms.txt|llms-full.txt|sitemap|sitemap.xml|robots.txt|.*\\..*).*)"] };
