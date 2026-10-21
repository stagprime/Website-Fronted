import { putFile, ordersDir } from "@/lib/files";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { limit } from "@/lib/ratelimit";
import { sameOrigin } from "@/lib/guard";
import { addMessage, publish, agentsOnline, CHAT_COOKIE } from "@/lib/chat";
import { aiEnabled, aiReply } from "@/lib/ai";
import { deliver } from "@/lib/mailer";
import { locales } from "@/lib/i18n";
import { clientIp } from "@/lib/ip";
export const runtime = "nodejs";
const E = (error: string, status = 422) => NextResponse.json({ ok: false, error }, { status });
const okEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
async function current() { const id = (await cookies()).get(CHAT_COOKIE)?.value; return id ? db.chatConversation.findUnique({ where: { id } }) : null; }
const state = async () => ({ ai: await aiEnabled(), agents: agentsOnline.size > 0 });
/** GET → current conversation + messages (also used as polling fallback with ?since=ISO). */
export async function GET(req: Request) {
  const c = await current(); if (!c) return NextResponse.json({ ok: true, conversation: null, ...(await state()) });
  const since = new URL(req.url).searchParams.get("since");
  const messages = await db.chatMessage.findMany({ where: { conversationId: c.id, sender: { not: "note" }, ...(since && { createdAt: { gt: new Date(since) } }) }, orderBy: { createdAt: "asc" }, take: 200 });
  return NextResponse.json({ ok: true, conversation: { id: c.id, status: c.status, name: c.name }, messages, ...(await state()) });
}
export async function POST(req: Request) {
  if (!sameOrigin(req)) return E("Invalid origin", 403);
  const ip = clientIp(req.headers);
  if (!limit(`chat:${ip}`, 40, 600_000)) return E("Too many messages — please wait a moment.", 429);
  const isForm = (req.headers.get("content-type") || "").includes("multipart");
  const b: Record<string, string> = {}; let file: File | null = null;
  if (isForm) { const fd = await req.formData(); fd.forEach((v, k) => { if (typeof v === "string") b[k] = v; else if (k === "file" && v.size) file = v; }); } else { try { Object.assign(b, await req.json()); } catch { return E("Invalid request", 400); } }
  if (b.website) return NextResponse.json({ ok: true }); // honeypot
  const locale = (locales as readonly string[]).includes(b.locale) ? b.locale : "en";
  if (b.action === "offline") { // offline mode → lead
    const name = String(b.name || "").slice(0, 120), email = String(b.email || "").slice(0, 200), message = String(b.message || "").slice(0, 4000);
    if (!name || !okEmail(email) || !message) return E("Please enter your name, a valid email and a message.");
    await deliver(`[stagprime.com] chat (offline) — ${name}`, `name: ${name}\nemail: ${email}\npage: ${b.page || ""}\n\n${message}`, { type: "chat-offline", name, email, message, locale, ip });
    return NextResponse.json({ ok: true, lead: true });
  }
  if (b.action === "start") {
    const s = await auth().catch(() => null);
    const name = String(b.name || s?.user?.name || "").slice(0, 120), email = String(b.email || s?.user?.email || "").slice(0, 200);
    if (!s?.user && (!name || !okEmail(email))) return E("Please enter your name and a valid email.");
    const c = await db.chatConversation.create({ data: { name, email, locale, page: String(b.page || "").slice(0, 300), userId: s?.user?.id } });
    (await cookies()).set(CHAT_COOKIE, c.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 30 * 86400 });
    publish({ type: "status", conversationId: c.id, data: { status: "open", new: true } });
    return NextResponse.json({ ok: true, conversation: { id: c.id, status: c.status, name: c.name }, ...(await state()) });
  }
  const c = await current(); if (!c) return E("Chat session expired — please start again.", 404);
  if (b.action === "typing") { publish({ type: "typing", conversationId: c.id, data: { who: "visitor" } }); return NextResponse.json({ ok: true }); }
  if (b.action === "human") {
    await db.chatConversation.update({ where: { id: c.id }, data: { status: "human" } });
    await addMessage(c.id, "system", agentsOnline.size ? "handoff" : "handoff-offline");
    await deliver(`[stagprime.com] chat — human requested by ${c.name}`, `Conversation ${c.id}\n${c.email}\nOpen /admin/chat to reply.`, { type: "chat-handoff", email: c.email || "", id: c.id });
    return NextResponse.json({ ok: true, agents: agentsOnline.size > 0 });
  }
  if (b.action === "send") {
    const body = String(b.body || "").trim().slice(0, 4000); let saved: string | undefined;
    const f = file as File | null;
    if (f) {
      if (f.size > 8 * 1024 * 1024) return E("Files must be under 8 MB.");
      if (!/\.(pdf|docx?|png|jpe?g|webp|zip|txt)$/i.test(f.name)) return E("File type not allowed.");
      const fn = `${Date.now()}-${f.name.replace(/[^\w.-]/g, "_")}`; await putFile("orders", ordersDir(), `chat/${c.id}/${fn}`, Buffer.from(await f.arrayBuffer())); saved = `chat/${c.id}/${fn}`;
    }
    if (!body && !saved) return E("Write a message first.");
    const m = await addMessage(c.id, "visitor", body || f!.name, saved);
    if (c.status === "open" && await aiEnabled()) { // AI first responder (until a human takes over)
      publish({ type: "typing", conversationId: c.id, data: { who: "ai" } });
      const hist = await db.chatMessage.findMany({ where: { conversationId: c.id, sender: { in: ["visitor", "ai", "agent"] } }, orderBy: { createdAt: "asc" }, take: 30 });
      const a = await aiReply(hist, c.locale); if (a) await addMessage(c.id, "ai", a);
    }
    return NextResponse.json({ ok: true, message: m });
  }
  return E("Unknown action", 400);
}
