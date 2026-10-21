// CSRF defence for JSON/form API routes: require same-origin requests (Origin/Referer must match Host).
export function sameOrigin(req: Request) {
  const o = req.headers.get("origin") || req.headers.get("referer"); if (!o) return false;
  try { const host = req.headers.get("x-forwarded-host") || req.headers.get("host"); return new URL(o).host === host; } catch { return false; }
}
