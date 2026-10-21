import { T, TT } from "@/lib/loc";
import { pageDoc, txt } from "@/lib/cms/page";
import Md from "@/components/Md";
/** Legal page body: Admin → Pages → <page> → "Page body" rich-text block (per locale) or the code default sections. */
export function LegalBody({ pageKey, items }: { pageKey: string; items: [string, string][] }) {
  const b = pageDoc(pageKey)?.find(s => s.settings?.position === "body" && s.type === "richText");
  if (b && b.visible && (b.content?.en?.body || b.content?.[Object.keys(b.content)[0]]?.body)) return <Md src={txt(b, "body", "")} />;
  return <>{items.map(([h, p]) => <section key={h}><h2>{TT(h)}</h2><p>{T(p)}</p></section>)}</>;
}
