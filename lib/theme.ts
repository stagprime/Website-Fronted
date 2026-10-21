import type { Settings } from "@/lib/settings";
const KEYS = ["navy950", "navy900", "navy800", "sky", "blue", "red", "green", "lime", "purple", "teal"] as const;
const rgb = (hex: string) => { const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim()); if (!m) return null; const n = parseInt(m[1], 16); return `${n >> 16} ${(n >> 8) & 255} ${n & 255}`; };
const fam = (s: string) => s.replace(/[^\w \-]/g, "").trim();
const safeUrl = (u: string) => /^(\/|https:\/\/)[^"'()\s<>]+$/.test(u) ? u : "";
/** CSS injected by the locale layout: brand color variables, optional custom fonts and custom CSS from Admin → Branding. */
export function themeCss(t: Settings["theme"]): string {
  const vars = KEYS.map(k => { const v = rgb(String(t[k] || "")); return v ? `--c-${k}:${v}` : ""; }).filter(Boolean).join(";");
  const out = [`:root{${vars}}`];
  const ff = (kind: "display" | "body", name: string, url: string) => {
    const f = fam(name || ""); if (!f) return; const u = safeUrl(url || "");
    if (u) out.push(`@font-face{font-family:"${f}";src:url("${u}");font-display:swap}`);
    out.push(`:root{--font-${kind}:"${f}"}`);
  };
  ff("display", t.displayFont, (t as Record<string, string>).displayFontUrl); ff("body", t.bodyFont, (t as Record<string, string>).bodyFontUrl);
  if (t.customCss) out.push(String(t.customCss).replace(/<\/?style/gi, ""));
  return out.join("\n");
}
/** Google Fonts stylesheet for families that have no uploaded file. */
export function googleFontsHref(t: Settings["theme"]): string | null {
  const fams = ([[t.displayFont, (t as Record<string, string>).displayFontUrl], [t.bodyFont, (t as Record<string, string>).bodyFontUrl]] as [string, string][]).filter(([f, u]) => fam(f || "") && !u).map(([f]) => `family=${encodeURIComponent(fam(f))}:wght@400;600;700;800`);
  return fams.length ? `https://fonts.googleapis.com/css2?${fams.join("&")}&display=swap` : null;
}
