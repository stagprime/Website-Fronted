/** Post-login redirect target: only same-origin relative paths ("/x…"). Rejects "//host", "/\host", schemes, control chars. */
export function safeNext(raw: string | null | undefined, fallback: string): string {
  const v = (raw || "").trim();
  if (!v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\") || /[\u0000-\u001f\u007f\\]/.test(v) || v.length > 512) return fallback;
  try { const u = new URL(v, "http://x.invalid"); if (u.origin !== "http://x.invalid") return fallback; return u.pathname + u.search + u.hash; } catch { return fallback; }
}
