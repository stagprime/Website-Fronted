import { a } from "./posts/a"; import { b } from "./posts/b"; import { c } from "./posts/c"; import { d } from "./posts/d"; import { e } from "./posts/e"; import { f } from "./posts/f"; import { g } from "./posts/g"; import { x1 } from "./posts/x1"; import { x2 } from "./posts/x2"; import { x3 } from "./posts/x3"; import { x4 } from "./posts/x4"; import { x5 } from "./posts/x5"; import { x6 } from "./posts/x6"; import { x7 } from "./posts/x7"; import { x8 } from "./posts/x8"; import { x9 } from "./posts/x9"; import { x10 } from "./posts/x10";
export type Post = { slug: string; cat: string; svc: string; kw: string; t: string; d: string; body: string; faq?: string[][]; cornerstone?: boolean; date?: string };
// Publication dates are set when the site goes live (ISO). Content is evergreen and reviewed on update.
const XS = [x1, x2, x3, x4, x5, x6, x7, x8, x9, x10];
/** Inserts the expansion section before the article's closing "how we help" section (its last H2). */
function expand(slug: string, body: string) { const x = XS.map(m => m[slug]).filter(Boolean).join("\n\n"); if (!x) return body; const i = body.lastIndexOf("\n## "); return i < 0 ? `${body}\n\n${x}` : `${body.slice(0, i)}\n\n${x}\n${body.slice(i)}`; }
const PUBLISHED = "2026-10-21";
export const posts: Post[] = [...d, ...a, ...b, ...c, ...e, ...f, ...g].map(p => ({ ...p, body: expand(p.slug, p.body), date: PUBLISHED }));
export const postImg = (cat: string) => ({ "Digital Marketing": "svc-digital-marketing", "Design & Development": "svc-design-development", "Amazon & YouTube Automation": "svc-amazon-youtube-automation", "Print-on-Demand": "venture-pod-merch", "AI & Animation": "svc-ai-animation", "Writing & Consulting": "svc-writing-consulting", "Software (SaaS)": "svc-saas", "Ready-made Businesses": "store-digital" } as Record<string, string>)[cat] || "page-blog";
export const words = (s: string) => s.split(/\s+/).length;
