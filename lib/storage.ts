/**
 * File storage abstraction (local disk driver). Public media live under <UPLOADS_DIR>/media and are served by /media/<key>;
 * private files (deliveries, downloads) are only served through authorised routes. Swap `driver` for S3/OCI later without schema changes.
 */
import fs from "fs/promises"; import path from "path"; import crypto from "crypto";
const root = () => process.env.UPLOADS_DIR || path.join(process.cwd(), "data", "uploads");
export const mediaDir = () => path.join(root(), "media");
export const ALLOWED = /\.(png|jpe?g|webp|gif|svg|avif|ico|pdf|zip|mp4|webm|woff2?|ttf|otf|txt|csv|docx?|xlsx?)$/i;
export const MAX_BYTES = 25 * 1024 * 1024;
const safe = (n: string) => n.normalize("NFKD").replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").replace(/^[-.]+/, "").slice(-90) || "file";
export const driver = {
  async put(name: string, buf: Buffer, folder = "") {
    const key = `${folder ? folder.replace(/[^\w/-]/g, "").replace(/^\/+|\/+$/g, "") + "/" : ""}${new Date().toISOString().slice(0, 7)}/${crypto.randomBytes(4).toString("hex")}-${safe(name)}`;
    const p = path.join(mediaDir(), key); await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, buf); return key;
  },
  async get(key: string) { const p = resolve(key); return p ? fs.readFile(p) : null; },
  async del(key: string) { const p = resolve(key); if (p) await fs.rm(p, { force: true }); },
};
/** Resolve a storage key safely inside the media dir (no path traversal). */
export function resolve(key: string) { const base = mediaDir(); const p = path.resolve(base, key); return p.startsWith(base + path.sep) ? p : null; }
export const mimeOf = (n: string) => ({ png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", svg: "image/svg+xml", avif: "image/avif", ico: "image/x-icon", pdf: "application/pdf", zip: "application/zip", mp4: "video/mp4", webm: "video/webm", woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf", otf: "font/otf", txt: "text/plain", csv: "text/csv" } as Record<string, string>)[n.split(".").pop()!.toLowerCase()] || "application/octet-stream";
/** Read PNG/JPEG/WebP/GIF dimensions from the header (no image library needed). */
export function imageSize(b: Buffer): { width: number; height: number } | null {
  try {
    if (b[0] === 0x89 && b.toString("ascii", 1, 4) === "PNG") return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    if (b.toString("ascii", 0, 3) === "GIF") return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
    if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") { const f = b.toString("ascii", 12, 16);
      if (f === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) }; if (f === "VP8L") { const n = b.readUInt32LE(21); return { width: (n & 0x3fff) + 1, height: ((n >> 14) & 0x3fff) + 1 }; } if (f === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff }; }
    if (b[0] === 0xff && b[1] === 0xd8) { let i = 2; while (i < b.length) { if (b[i] !== 0xff) return null; const m = b[i + 1]; const len = b.readUInt16BE(i + 2); if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) }; i += 2 + len; } }
  } catch { /* unknown */ }
  return null;
}
