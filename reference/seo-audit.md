# Stag Prime — SEO audit (build of 21 Oct 2026)

Scope: the Next.js site in this repository, served from the standalone build on a local server. Status legend: ✅ done · ⚠️ partial / needs your action · ❌ not done.

## 1. Google — helpful content & E-E-A-T
| Item | Status | Where |
|---|---|---|
| Named founder & author (Md Tariq Hossain), Person schema, author on every BlogPosting | ✅ | `lib/people.ts`, About, Team, `blog/[slug]` |
| Company facts, NAP, two LocalBusiness entities (Wyoming LLC + Rajshahi office) in Organization graph | ✅ | `app/[locale]/layout.tsx` JSON-LD |
| Editorial policy page (sources, AI use, corrections, updates) | ✅ | `/editorial-policy` |
| Publish / updated dates on articles | ✅ | Article header + `datePublished/dateModified` |
| No invented clients, stats or reviews; reviews page links to real profiles | ✅ | content review |
| 33 articles, each 1,000+ words, one distinct keyword each, FAQ + internal links to gig/product + CTA | ✅ | `content/posts*` |
| Keywords verified with Semrush | ⚠️ | Semrush API units were exhausted — keywords are best-judgement, labelled unverified in `keyword-map.csv` |

## 2. Technical
| Item | Status | Notes |
|---|---|---|
| One H1 per page | ✅ | crawler: 0 issues across all locales |
| Broken links | ✅ | `scripts/crawl.mjs`: 600 URLs, 0 broken |
| Canonical on every page; hreflang for 7 locales + x-default | ✅ | `lib/seo.ts` |
| Untranslated blog posts: canonical → `/en/…`, hreflang lists only real translations, banner explains | ✅ | `blog/[slug]`, `lib/posti18n.ts`, blog sitemap |
| Bots never redirected by locale detection; humans get cookie > Accept-Language, geo only suggests | ✅ | `middleware.ts` |
| Trailing slash consistency (`trailingSlash:false`), `poweredByHeader` off | ✅ | `next.config.js` |
| HTTPS/HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy | ✅ | `next.config.js` (+ Nginx redirect to https://www) |
| 404 branded page; permanent/temporary/410 redirect manager | ✅ | `[...rest]`, `/admin/seo`. Next.js sends permanent as **308** and temporary as 307; Google treats these the same as 301/302. 410 entries currently render the 404 page with a 404 status |
| robots.txt with private paths blocked, AI crawlers allowed (switchable) | ✅ | `app/robots.ts`, `AI_CRAWLERS` |
| Sitemap index → pages / services / store / blog / images, with hreflang alternates and image entries | ✅ | `/sitemap.xml`, `lib/sitemap.ts` |
| Video sitemap | ⚠️ | ready to add as `sitemap-videos.xml` once real videos exist |
| RSS feed | ✅ | `/rss.xml`, linked via `<link rel=alternate>` |
| gzip / brotli, long cache for static assets | ✅ | `deploy/nginx.conf` (brotli lines need the module) |
| Fonts self-hosted via `next/font` (preloaded, `display:swap`), no render-blocking third-party JS | ✅ | tracking loads only after consent; chat panel lazy-loaded |
| Images: AVIF/WebP via next/image, width/height set, alt text | ✅ | `components/Art.tsx` |
| Pagination | ⚠️ | blog index lists all 33 on one page (fine at this size); add pagination past ~60 posts |

## 3. Structured data
Organization (+ 2 LocalBusiness/ProfessionalService locations, `sameAs` to all public profiles), WebSite + SearchAction, BreadcrumbList (all inner pages), Service + OfferCatalog with real package prices, Product + Offer (store), SoftwareApplication (Sentinel), FAQPage (FAQ, gig, Sentinel, articles), BlogPosting with Person author, AboutPage, speakable (About, Sentinel). HowTo is not used (Google retired HowTo rich results).
⚠️ Validate in Google's Rich Results Test after deploy (needs the public URL).

## 4. Other search engines
Bing/Yandex/Pinterest/Facebook/Naver/Baidu verification meta via env vars ✅ · IndexNow ping on blog publish ✅ (needs `INDEXNOW_KEY` + key file) · DuckDuckGo follows Bing ✅ · Yandex-friendly XML sitemaps ✅.

## 5. AI / answer engines (GEO)
`/llms.txt` and `/llms-full.txt` (services, packages, prices, FAQ, guides) ✅ · concise Q&A blocks on services, gigs, Sentinel and every article ✅ · entity-rich copy and consistent NAP ✅ · speakable schema on key pages ✅ · GPTBot / Google-Extended / PerplexityBot / ClaudeBot allowed by default ✅.

## 6. Internationalisation
7 locales (`en, bn, ar (RTL), es, fr, de, hi`). UI and page copy: 1,215 strings per locale. Top 10 articles fully translated.
⚠️ **Translations were machine-generated (NLLB-200) and need native-speaker review**, especially Bengali and Arabic marketing copy.

## 7. Core Web Vitals / Lighthouse (mobile)
See "Lighthouse results" at the end of this file.

## 8. Off-page actions for you
1. **Google Business Profile** for the Rajshahi office (and a service-area profile if eligible): exact NAP as on the site, categories, services with prices, photos, weekly posts.
2. **Bing Places** and **Apple Business Connect** with identical NAP.
3. **Citations**: Clutch, GoodFirms, DesignRush, Trustpilot, Crunchbase, LinkedIn company page, local Bangladeshi business directories, Wyoming business listings.
4. **Reviews**: ask every completed client for a Google or Trustpilot review; reply to all reviews.
5. **Backlinks**: guest articles on marketing/dev blogs, podcast interviews about building Stag VPN and Sentinel, partner pages (Fiverr/Upwork profiles, merch marketplaces), founder profiles.
6. **Search Console / Bing Webmaster / Yandex**: verify, submit `sitemap.xml`, watch Coverage and Core Web Vitals.
7. **Content**: publish 2–4 posts/month through `/api/blog`; refresh the top 10 articles every 6 months.

## Lighthouse results (mobile, simulated throttling, local standalone server, 21 Oct 2026 ~07:40 Asia/Dhaka)
| Page | Perf | A11y | Best practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| /en | 94 | 96 | 100 | 100 | 3.0 s | 32 ms | 0.008 |
| /en/services/design-development | 93 | 93 | 100 | 100 | 3.1 s | 29 ms | 0.002 |
| /en/store | 93 | 96 | 100 | 92* | 3.1 s | 30 ms | 0.003 |
| /en/stag-sentinel | 95 | 96 | 100 | 100 | 3.0 s | 26 ms | 0.002 |
| /en/blog | 94 | 96 | 100 | 100 | 3.1 s | 31 ms | 0.003 |
| /ar | 86 | 97 | 100 | 100 | 4.0 s | 63 ms | 0.003 |

\* /store is dynamic because it reads `?category`. Next.js 15 streams its metadata into the body for non-bot user agents, so Lighthouse flags "meta description". Googlebot and other crawlers get it in `<head>`, and the tag is present in the HTML. 
Remaining work: /ar LCP is the hero paragraph waiting on the Arabic web font; a subset or `font-display: optional` for Arabic would help. Colour contrast fails on service-colour labels (#1071B2 on navy) and one in-text link without an underline. Footer contrast was fixed after this run. Re-run after deploying behind Nginx with brotli and HTTP/2; real-world numbers will differ.
