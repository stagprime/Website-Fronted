/** AI first-responder. Any OpenAI-compatible API: OPENAI_API_KEY (+ optional OPENAI_BASE_URL, OPENAI_MODEL). Disabled when no key. */
import { llms } from "./llms";
import { CONTACT } from "./i18n";
export const aiEnabled = () => !!process.env.OPENAI_API_KEY;
const NAMES: Record<string, string> = { en: "English", bn: "Bengali", ar: "Arabic", es: "Spanish", fr: "French", de: "German", hi: "Hindi" };
export async function aiReply(history: { sender: string; body: string }[], locale: string): Promise<string | null> {
  if (!aiEnabled()) return null;
  const system = `You are the Stag Prime website assistant. Answer ONLY from the facts below about Stag Prime's services, packages, prices, products, FAQ and Stag Prime Sentinel. Be concise (max 120 words), friendly, and reply in ${NAMES[locale] || "English"}. Never invent prices, clients, statistics or promises. If you don't know, or the visitor wants a person, a custom quote, a refund or anything account-specific, say a team member will follow up and suggest WhatsApp (${CONTACT.whatsapp}) or Telegram (${CONTACT.telegram}). Link pages as full https://www.stagprime.com/${locale}/... URLs.\n\n${llms(true)}`;
  try {
    const r = await fetch(`${process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"}/chat/completions`, {
      method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, signal: AbortSignal.timeout(20000),
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0.3, max_tokens: 400, messages: [{ role: "system", content: system }, ...history.slice(-12).map(m => ({ role: m.sender === "visitor" ? "user" : "assistant", content: m.body }))] }),
    });
    if (!r.ok) return null; const j = await r.json(); return j.choices?.[0]?.message?.content?.trim() || null;
  } catch { return null; }
}
