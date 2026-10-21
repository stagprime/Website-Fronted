/**
 * AI helpers. Any OpenAI-compatible API: OPENAI_API_KEY (+ optional OPENAI_BASE_URL, OPENAI_MODEL). Everything is OFF without a key.
 * - aiReply: live-chat first responder, grounded in llms.txt facts + Admin → Chat → Knowledge base; prompt/model from Admin → Chat settings.
 * - aiComplete: admin "AI draft" (translations, SEO meta, blog drafts) — callers must mark results as drafts for human review.
 */
import { llms } from "./llms";
import { getSettings } from "./settings";
export const aiKey = () => !!process.env.OPENAI_API_KEY;
const NAMES: Record<string, string> = { en: "English", bn: "Bengali", ar: "Arabic", es: "Spanish", fr: "French", de: "German", hi: "Hindi" };
export const langName = (l: string) => NAMES[l] || l;
/** True when the key is present AND the chat AI switch (Admin → Chat → Settings) is on. */
export async function aiEnabled() { if (!aiKey()) return false; try { return (await getSettings()).chat.aiEnabled !== false; } catch { return true; } }
async function kb(locale: string) {
  try { const { db, dbReady } = await import("./db"); if (!dbReady()) return "";
    const docs = await db.knowledgeDoc.findMany({ where: { enabled: true, locale: { in: ["en", locale] } }, orderBy: { updatedAt: "desc" }, take: 40 });
    return docs.map(d => `### ${d.title}\n${d.body}`).join("\n\n").slice(0, 24000);
  } catch { return ""; }
}
export async function aiComplete(messages: { role: "system" | "user" | "assistant"; content: string }[], opts: { model?: string; max?: number; temperature?: number } = {}): Promise<string | null> {
  if (!aiKey()) return null;
  try {
    const r = await fetch(`${process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"}/chat/completions`, {
      method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, signal: AbortSignal.timeout(45000),
      body: JSON.stringify({ model: opts.model || process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: opts.temperature ?? 0.3, max_tokens: opts.max ?? 400, messages }),
    });
    if (!r.ok) return null; const j = await r.json(); return j.choices?.[0]?.message?.content?.trim() || null;
  } catch { return null; }
}
export async function aiReply(history: { sender: string; body: string }[], locale: string): Promise<string | null> {
  if (!(await aiEnabled())) return null;
  const s = await getSettings(); const c = s.contact;
  const base = s.chat.systemPrompt?.trim() || `You are the ${s.brand.name} website assistant. Answer ONLY from the facts below about ${s.brand.name}'s services, packages, prices, products, FAQ and Stag Prime Sentinel. Be concise (max 120 words), friendly. Never invent prices, clients, statistics or promises. If you don't know, or the visitor wants a person, a custom quote, a refund or anything account-specific, say a team member will follow up and suggest WhatsApp (${c.whatsapp}) or Telegram (${c.telegram}).`;
  const system = `${base}\nReply in ${langName(locale)}. Link pages as full https://www.stagprime.com/${locale}/... URLs.\n\n${await llms(true)}\n\n## Knowledge base\n${await kb(locale)}`;
  return aiComplete([{ role: "system", content: system }, ...history.slice(-12).map(m => ({ role: (m.sender === "visitor" ? "user" : "assistant") as "user" | "assistant", content: m.body }))], { model: s.chat.aiModel || undefined });
}
