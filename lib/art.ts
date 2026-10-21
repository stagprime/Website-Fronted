import fs from "fs"; import path from "path";
import real from "@/content/real-images.json";
// AI art lives in /public/img/ai/<name>.webp — returns null if not yet added, so the UI falls back to a gradient.
export function ai(name: string): string | null {
  return fs.existsSync(path.join(process.cwd(), "public/img/ai", `${name}.webp`)) ? `/img/ai/${name}.webp` : null;
}
export type Real = (typeof real)[number];
export const merch = real.filter(r => r.web.includes("/merch-"));
export const vpnShots = real.filter(r => r.web.includes("play-shot"));
export const vpn = (n: string) => real.find(r => r.web.includes(n))!;
export const storeOf = (link: string) => link.includes("zazzle") ? "Zazzle" : link.includes("creator-spring") ? "Creator-Spring" : "Store";
