import { L } from "@/lib/loc";
// Minimal markdown renderer for articles: ## / ### headings, -, 1. lists, **bold**, [links](/path).
function inline(s: string, k: string) {
  const out: React.ReactNode[] = []; const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g; let i = 0, m: RegExpExecArray | null, n = 0;
  while ((m = re.exec(s))) { if (m.index > i) out.push(s.slice(i, m.index)); out.push(m[1] ? <strong key={k + n++} className="text-white">{m[1]}</strong> : <a key={k + n++} href={m[3].startsWith("/") ? L(m[3]) : m[3]} className="text-sky-brand underline underline-offset-4 hover:text-white">{m[2]}</a>); i = re.lastIndex; }
  if (i < s.length) out.push(s.slice(i)); return out;
}
export const slugify = (s: string) => s.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
export function toc(md: string) { return md.split("\n").filter(l => l.startsWith("## ")).map(l => l.slice(3)); }
export default function Md({ src }: { src: string }) {
  const blocks = src.trim().split(/\n\s*\n/);
  return <>{blocks.map((b, i) => {
    const k = `b${i}`; const lines = b.split("\n");
    if (b.startsWith("## ")) return <h2 key={k} id={slugify(b.slice(3))} className="scroll-mt-28">{b.slice(3)}</h2>;
    if (b.startsWith("### ")) return <h3 key={k} className="font-display text-lg font-bold text-white mt-8 mb-2">{b.slice(4)}</h3>;
    if (lines.every(l => l.startsWith("- "))) return <ul key={k}>{lines.map((l, j) => <li key={j}>{inline(l.slice(2), k + j)}</li>)}</ul>;
    if (lines.every(l => /^\d+\. /.test(l))) return <ol key={k} className="list-decimal pl-6 space-y-1">{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\d+\. /, ""), k + j)}</li>)}</ol>;
    return <p key={k}>{inline(b.replace(/\n/g, " "), k)}</p>;
  })}</>;
}
