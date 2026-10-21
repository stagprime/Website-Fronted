# Admin panel — notes for the next developer

Phase-2 admin lives in this same Next.js app under `app/admin/*` (pages) and `app/api/admin/*` (APIs). It is English-only, not localized, `noindex`, and excluded from the locale middleware and robots.txt.

## Access control
- Roles: `customer` (default), `staff`, `admin` — `Role` enum in `prisma/schema.prisma`, carried in the Auth.js JWT (`auth.ts`).
- `lib/admin.ts`: `requireStaff()` / `requireAdmin()` / `deny()`. **Every** admin page is gated in `app/admin/layout.tsx`, and **every** `/api/admin/*` route must call one of these itself (layouts do not protect APIs).
- Mutating admin APIs also check `sameOrigin()` (`lib/guard.ts`) for CSRF.
- First admin: `npm run db:seed` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Promote others with SQL: `UPDATE "User" SET role='staff' WHERE email='…';` (a users screen is a good next feature).

## What exists
| Area | Page | API | Notes |
|---|---|---|---|
| Overview | `/admin` | — | counts only |
| Live chat inbox | `/admin/chat` (`Inbox.tsx`) | `/api/admin/chat`, `/api/admin/chat/stream` (SSE) | reply takes over from AI (`status=human`); close/reopen; optional email copy |
| SEO | `/admin/seo` (`SeoAdmin.tsx`) | `/api/admin/seo` | analyzer (`lib/seo-analyze.ts`), per-path+locale overrides in `SeoRecord`, applied by `seoMeta()` in `lib/seo.ts`, saved changes call `revalidatePath` |
| Redirects | `/admin/seo#redirects` | `/api/admin/redirects` | `Redirect` table; applied by `app/[locale]/[...rest]/page.tsx` for unmatched URLs (301/302; 410 shows the 404 page) |

Staff can read/analyze; only admins can save SEO overrides and redirects.

## Data model hooks already in place
- Orders: `Order`, `OrderEvent` (status timeline), `OrderFile` (delivery/download/attachment), `Message` — customer side is `/account`; staff can already change status/reply via `POST /api/orders` with `action=status|message` (an orders screen just needs UI).
- Blog: `BlogPost` (DB posts override code posts in `content/posts*`); `/api/blog` uses a bearer token — an editor UI can call the same Prisma model.
- Chat: `ChatConversation`, `ChatMessage`; realtime bus in `lib/chat.ts` (single process; swap for Postgres LISTEN/NOTIFY or Redis to scale).
- Settings: `Setting` key/value table (unused yet — good for robots.txt text, banner toggles, AI prompt).

## Suggested next features
1. Orders board (filter by status, change status, upload delivery files via `/api/orders`).
2. Users & roles screen.
3. Blog editor (markdown + SEO fields + schedule) on top of `BlogPost`.
4. Store/product management (products are code-defined in `content/site.ts` and priced server-side in `lib/catalog.ts`).
5. Editable robots.txt / llms.txt via `Setting`.

## Conventions
- Server components for pages; small client components for interactive parts, colocated in the page folder.
- Tailwind with the site tokens (`navy-*`, `sky-brand`, `blue-brand`).
- Validate every input on the server, cap string lengths, never trust client prices (`lib/catalog.ts`).

## Settings / content layer (for "edit everything without code")
- **Layer:** `lib/settings.ts`. Code defaults (`DEFAULTS`) are overridden by rows in the Prisma `Setting` table (`key` = setting name, `value` = JSON). Read with `await getSetting("contact")` / `getSettings()` in server components. Cached (tag `settings`, 5 min) and invalidated on save.
- **API:** `app/api/admin/settings/route.ts`. `GET` (staff) returns effective values, defaults and overridden keys. `PUT {key, value}` or `PUT {key, reset:true}` (admin, same-origin) saves and revalidates the whole site.
- **Keys available now:** brand, contact, socials, profiles, services, products, storeCats, pricing, faqs, process, ventures, portfolio, partners, jobAreas, tracking.
- **Already editable in the DB:** blog posts (`BlogPost`, `/api/blog`), SEO title/description/OG/noindex per URL (`SeoRecord`, `/admin/seo`), redirects (`Redirect`), chat. The contact page reads `contact` and `services` through the layer.

### Data layer getters
`lib/content.ts`: getContact, getServices, getProducts, getStoreCats, getPricing, getFaqs, getVentures, getPortfolio, getPartners, getNav, getGigs, getTeam, getBrand, getTracking, and so on. Each is cached with tags `settings` + `content:<key>` and falls back to the content files. Switch a getter to the CMS tables from `cms-data-model.md` later; callers stay unchanged.

### Translations use stable keys
`lib/tr/en.json` maps a stable id (`ui.<slug>.<hash6>`, the migration key from cms-data-model.md) to its English text. `lib/tr/<l>.json` maps the same ids to translations. `Tk("ui.…")` looks up by key. Legacy `T("English")` resolves English → id through `en.json`, so once a UiString table exists, editing English there will not break the other languages. Changing a `T("…")` literal in code creates a new key: run `npm run i18n:keys`, then `python scripts/i18n-translate.py <l> ui`, then `npm run i18n:rekey`.

### Still hard-coded (callers still import content files directly; move them to `lib/content.ts` getters next)
| Content | Where it lives now | Read by |
|---|---|---|
| Contact info (phone, WhatsApp, Telegram, email) | `lib/i18n.ts` `CONTACT` | Header, Footer, `components/ui.tsx` CTA, home, `lib/llms.ts`, Organization JSON-LD in `app/[locale]/layout.tsx` (also has phone and `sameAs` inline) |
| Services, products, store categories, pricing, FAQs, ventures, portfolio, partners, socials | `content/site.ts` | Most `app/[locale]/**` pages, `components/Store.tsx`, `lib/catalog.ts`, `lib/sitemap.ts`, `lib/llms.ts`, `lib/routes.ts` |
| Gig packages and prices | `content/gigs.ts` | services/[slug], pricing, checkout (`lib/catalog.ts`; server-side price lookup must stay server-side) |
| Menus / mega menu | `lib/nav.ts` | `components/Header.tsx`, Footer |
| Team / people | `content/team.ts`, `lib/people.ts` | About, Team, blog author |
| Page hero text and section copy | inline JSX in each `app/[locale]/**/page.tsx` (strings wrapped in `T()`) | the pages themselves |
| Legal pages (privacy, terms, refund) | arrays at the top of each page file | the pages themselves |
| Static blog posts | `content/posts.ts`, `content/posts/*.ts` (DB posts override them by slug) | `lib/blog.ts` |
| Translations | `lib/tr/<locale>.json`, `content/posts/i18n/<locale>.json` | `lib/loc.ts`, `lib/posti18n.ts`. Suggested: a `Translation` table (locale, key, value) loaded the same way |
| Tracking IDs | env vars (`NEXT_PUBLIC_GA4_ID`, etc.) | `lib/analytics.ts`. The `tracking` setting key exists but is not yet read |
| Brand name / logo | `components/Logo.tsx`, layout metadata | Header, Footer, metadata. The `brand` key exists but is not yet read |

Notes: Client components (Header, Store, Launcher) can't await. Load settings in the server parent (layout/page) and pass them as props. Keep price checks in `lib/catalog.ts` server-side so admins can change prices without the client being trusted.
