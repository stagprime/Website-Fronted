/**
 * Client IP as seen by our own reverse proxy (Nginx sets X-Real-IP and appends to X-Forwarded-For).
 * The FIRST X-Forwarded-For entry is client-controlled and must never be trusted; the LAST hop is the one our proxy saw.
 * Used for rate limits, audit log, chat/forms/account abuse checks and Meta CAPI.
 */
type HeaderLike = { get(name: string): string | null } | undefined | null;
export function clientIp(h: HeaderLike, fallback = "local"): string {
  const real = h?.get?.("x-real-ip")?.trim(); if (real) return real.slice(0, 64);
  const xff = (h?.get?.("x-forwarded-for") || "").split(",").map(x => x.trim()).filter(Boolean);
  return (xff[xff.length - 1] || fallback).slice(0, 64);
}
