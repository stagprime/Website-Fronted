# Deploying stagprime.com (Ubuntu 22.04 / 24.04, Node 20, PostgreSQL, PM2, Nginx)

The app is a Next.js 15 **standalone** build run by PM2 as `node .next/standalone/server.js` behind Nginx with Let's Encrypt SSL.
Everything optional (Stripe, mail, AI chat, tracking) is switched on by environment variables — see `.env.example` for the full list.

## 1. Server packages
```bash
sudo apt update && sudo apt install -y nginx postgresql git unzip build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs
sudo npm i -g pm2
sudo apt install -y certbot python3-certbot-nginx
# optional brotli: sudo apt install -y libnginx-mod-http-brotli-filter libnginx-mod-http-brotli-static
```

## 2. PostgreSQL
```bash
sudo -u postgres psql -c "CREATE USER stagprime WITH PASSWORD 'CHANGE_ME_STRONG';"
sudo -u postgres psql -c "CREATE DATABASE stagprime OWNER stagprime;"
```
`DATABASE_URL=postgresql://stagprime:CHANGE_ME_STRONG@127.0.0.1:5432/stagprime`

## 3. Upload and install
```bash
sudo mkdir -p /var/www/stagprime && sudo chown $USER /var/www/stagprime
cd /var/www/stagprime
unzip ~/stagprime-site.zip        # or: git clone https://github.com/stagprime/Website-Fronted.git .
cp .env.example .env && nano .env # fill AUTH_SECRET, DATABASE_URL, STRIPE_*, mail, etc.
npm ci                            # runs `prisma generate` (PostgreSQL client) via postinstall
set -a; . ./.env; set +a
npm run db:migrate                # prisma migrate deploy (prisma/migrations)
npm run db:seed                   # creates the admin from ADMIN_EMAIL/ADMIN_PASSWORD + download records
npm run build                     # next build + copies public/ and .next/static into .next/standalone
mkdir -p data/downloads data/orders
```
Put the digital product files in `data/downloads/` (names in `prisma/seed.mjs`). Remove `ADMIN_PASSWORD` from `.env` after seeding.

## 4. PM2
```bash
set -a; . ./.env; set +a
pm2 start ecosystem.config.js     # runs: node .next/standalone/server.js on 127.0.0.1:3000
pm2 save && pm2 startup           # follow the printed command so it starts on boot
pm2 logs stagprime
```
Keep **one instance** (fork mode): live chat uses an in-process event bus (see `lib/chat.ts` to switch to Postgres LISTEN/NOTIFY or Redis before scaling).
Run the app from the project root so `data/` and `content/posts/i18n` resolve; the ecosystem file sets `cwd` for you.

## 5. Nginx + SSL
```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/stagprime.com
sudo ln -s /etc/nginx/sites-available/stagprime.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d stagprime.com -d www.stagprime.com
```
The config redirects to `https://www.stagprime.com`, gzips (brotli lines ready), caches `/_next/static` and `/img` for a year, sets 12 MB upload limit,
and disables buffering for the chat SSE streams (`/api/chat/stream`, `/api/admin/chat/stream`). HSTS and security headers come from `next.config.js`.

## 6. Stripe
1. Dashboard → Developers → API keys → put the secret key in `STRIPE_SECRET_KEY`.
2. Webhooks → Add endpoint `https://www.stagprime.com/api/stripe/webhook`, events `checkout.session.completed` and `checkout.session.async_payment_succeeded` → copy the signing secret to `STRIPE_WEBHOOK_SECRET`.
3. For Sentinel subscriptions create a recurring Price and set `STRIPE_PRICE_STAG_SENTINEL`.
The webhook stores orders (service orders start as *Pending* with a requirements form), attaches downloads, emails customer + team and sends the Meta CAPI `Purchase` (deduplicated with the browser event by the session id).

## 7. Mail
Set `RESEND_API_KEY` **or** `SMTP_*`. Without either, form submissions go to `data/submissions.jsonl` and transactional mail (verification, reset, order updates) to `data/outbox.jsonl`.

## 8. Live chat
Works out of the box (guest name + email or logged-in user). Agents reply at `/admin/chat` (admin/staff role); while an agent has the inbox open they count as online.
Set `OPENAI_API_KEY` (+ optional `OPENAI_BASE_URL`, `OPENAI_MODEL`) to enable the AI first-responder. With no AI and no agent online, the widget becomes a lead form.

## 9. Tracking & consent
Set any of `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA4_ID`, `META_PIXEL_ID` (+ `META_CAPI_TOKEN`), `NEXT_PUBLIC_GOOGLE_ADS_ID` (+ labels), `NEXT_PUBLIC_TIKTOK_PIXEL_ID`, `NEXT_PUBLIC_LINKEDIN_PARTNER_ID`.
Scripts load only after cookie consent (Google Consent Mode v2 defaults to denied). Events: PageView, ViewContent, InitiateCheckout, Purchase, Lead, CompleteRegistration, Contact.
`NEXT_PUBLIC_*` values are baked in at build time — rebuild after changing them.

## 10. SEO operations
- Verification meta: `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`, `YANDEX_VERIFICATION`, `PINTEREST_VERIFICATION`, `FACEBOOK_DOMAIN_VERIFICATION`, `NAVER_VERIFICATION`, `BAIDU_VERIFICATION`.
- Submit `https://www.stagprime.com/sitemap.xml` to Google Search Console, Bing Webmaster Tools and Yandex Webmaster.
- IndexNow: set `INDEXNOW_KEY` and create `public/<key>.txt` containing the key; publishing through `/api/blog` pings IndexNow.
- `/admin/seo`: page analyzer, per-locale meta overrides and the 301/302/410 redirect manager.
- `AI_CRAWLERS=block` disallows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot.

## 11. Blog publishing API
```bash
curl -X POST https://www.stagprime.com/api/blog -H "Authorization: Bearer $BLOG_API_TOKEN" -H "Content-Type: application/json" \
  -d '{"slug":"my-post","locale":"en","title":"…≤60","description":"…≤155","category":"Digital Marketing","service":"digital-marketing","keyword":"target kw","body":"## Markdown…","faq":[["Q","A"]],"status":"scheduled","publishAt":"2026-11-01T09:00:00Z"}'
```
`GET /api/blog` lists posts; `DELETE /api/blog?slug=&locale=` unpublishes. Scheduled posts go live at `publishAt` (pages revalidate every 5 minutes).

## 12. Updating
```bash
cd /var/www/stagprime && git pull   # or unzip a new build
npm ci && set -a && . ./.env && set +a && npm run db:migrate && npm run build && pm2 reload stagprime
```

## 13. Backups
```bash
pg_dump -U stagprime -h 127.0.0.1 stagprime | gzip > ~/backups/stagprime-$(date +%F).sql.gz
tar czf ~/backups/stagprime-data-$(date +%F).tgz /var/www/stagprime/data
```

## Optional: Docker
`docker compose up -d --build` (set `POSTGRES_PASSWORD` and the rest in `.env`; Nginx still terminates SSL in front of `127.0.0.1:3000`).

## Environment variables
See `.env.example` — every variable the code reads is listed there with a comment.
