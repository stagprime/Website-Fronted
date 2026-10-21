/** @type {import('next').NextConfig} */
const security = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];
module.exports = {
  reactStrictMode: true, output: "standalone",
  // Serve all metadata in <head> for every user agent (no streamed metadata) so every crawler/tool sees title, description, canonical.
  htmlLimitedBots: /.*/,
  // (inlineCss tried and dropped: it put 64 KB of CSS into every HTML response twice — HTML 182 KB → 309 KB.)
  poweredByHeader: false, trailingSlash: false, compress: true,
  images: { formats: ["image/avif", "image/webp"], minimumCacheTTL: 31536000 },
  // One indexable host: apex → www in a single 308 (Nginx does the same at the edge).
  async redirects() {
    return [{ source: "/:path*", has: [{ type: "host", value: "stagprime.com" }], destination: "https://www.stagprime.com/:path*", permanent: true }];
  },
  async headers() {
    return [
      // Any other host (test VPS IP, staging domains) is served noindex so it can never compete with www.stagprime.com.
      { source: "/:path*", missing: [{ type: "host", value: "(www\\.stagprime\\.com|127\\.0\\.0\\.1|localhost)(:\\d+)?" }], headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/:path*", headers: security },
      { source: "/img/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/:f(emblem.svg|logo.svg|logo-wide.svg|og.jpg)", headers: [{ key: "Cache-Control", value: "public, max-age=604800" }] },
    ];
  },
};
