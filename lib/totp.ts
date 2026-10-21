/** RFC 6238 TOTP (SHA-1, 30 s, 6 digits) — no dependency. Secret is base32. */
import crypto from "crypto";
const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export function newSecret() { const b = crypto.randomBytes(20); let bits = "", out = ""; for (const x of b) bits += x.toString(2).padStart(8, "0"); for (let i = 0; i + 5 <= bits.length; i += 5) out += A[parseInt(bits.slice(i, i + 5), 2)]; return out; }
function decode(s: string) { let bits = ""; for (const c of s.replace(/=+$/, "").toUpperCase()) { const v = A.indexOf(c); if (v < 0) continue; bits += v.toString(2).padStart(5, "0"); } const out = []; for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2)); return Buffer.from(out); }
export function totp(secret: string, t = Date.now(), step = 30) {
  const c = Buffer.alloc(8); c.writeBigUInt64BE(BigInt(Math.floor(t / 1000 / step)));
  const h = crypto.createHmac("sha1", decode(secret)).update(c).digest(); const o = h[h.length - 1] & 15;
  return String(((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000)).padStart(6, "0");
}
/** Accepts the current code ±1 step for clock drift. */
export function verifyTotp(secret: string, code: string) { const c = code.replace(/\s/g, ""); if (!/^\d{6}$/.test(c)) return false; return [-1, 0, 1].some(d => crypto.timingSafeEqual(Buffer.from(totp(secret, Date.now() + d * 30000)), Buffer.from(c))); }
export const otpauth = (secret: string, email: string, issuer = "Stag Prime") => `otpauth://totp/${encodeURIComponent(`${issuer}:${email}`)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&period=30&digits=6`;
