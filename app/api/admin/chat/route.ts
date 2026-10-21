import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePerm, deny } from "@/lib/admin";
import { audit } from "@/lib/audit";
import { addMessage, publish } from "@/lib/chat";
import { sameOrigin } from "@/lib/guard";
import { deliverMail } from "@/lib/mailer";
export const runtime = "nodejs";
/** GET → conversation list, or ?id= → one conversation with messages. */
export async function GET(req: Request) {
  if (!(await requirePerm("chat.use"))) return deny();
  const id = new URL(req.url).searchParams.get("id");
  if (id) return NextResponse.json({ ok: true, conversation: await db.chatConversation.findUnique({ where: { id }, include: { messages: { orderBy: { createdAt: "asc" } } } }) });
  const list = await db.chatConversation.findMany({ orderBy: { updatedAt: "desc" }, take: 300, include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } } });
  return NextResponse.json({ ok: true, conversations: list });
}
/** POST {id, action: reply|close|reopen|typing, body?} */
export async function POST(req: Request) {
  const s = await requirePerm("chat.use"); if (!s) return deny(); if (!sameOrigin(req)) return deny();
  const b = await req.json().catch(() => ({})); const c = await db.chatConversation.findUnique({ where: { id: String(b.id || "") } });
  if (!c) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (b.action === "typing") { publish({ type: "typing", conversationId: c.id, data: { who: "agent" } }); return NextResponse.json({ ok: true }); }
  if (b.action === "reply") {
    const body = String(b.body || "").trim().slice(0, 4000); if (!body) return NextResponse.json({ ok: false, error: "Empty" }, { status: 422 });
    if (c.status !== "human") await db.chatConversation.update({ where: { id: c.id }, data: { status: "human" } }); // agent takes over from AI
    const m = await addMessage(c.id, "agent", body); await audit(s, "chat.reply", "chat", c.id, body.slice(0, 120));
    if (b.email && c.email) await deliverMail(c.email, "Stag Prime replied to your chat", `${body}\n\nContinue the chat on ${process.env.NEXT_PUBLIC_SITE_URL || "https://www.stagprime.com"}`);
    return NextResponse.json({ ok: true, message: m });
  }
  if (b.action === "suggest") { const { aiReply, aiKey } = await import("@/lib/ai"); if (!aiKey()) return NextResponse.json({ ok: false, error: "AI is off — set OPENAI_API_KEY." }, { status: 409 });
    const hist = await db.chatMessage.findMany({ where: { conversationId: c.id, sender: { in: ["visitor", "ai", "agent"] } }, orderBy: { createdAt: "asc" }, take: 30 });
    const text = await aiReply(hist, c.locale); return NextResponse.json({ ok: !!text, suggestion: text, error: text ? undefined : "No suggestion (AI switched off in Chat settings?)" }); }
  if (b.action === "assign") { await db.chatConversation.update({ where: { id: c.id }, data: { assigneeId: b.assigneeId ? String(b.assigneeId).slice(0, 40) : null } }); await audit(s, "chat.assign", "chat", c.id, b.assigneeId); return NextResponse.json({ ok: true }); }
  if (b.action === "tags") { const tags = String(b.tags || "").split(",").map((x: string) => x.trim().toLowerCase()).filter(Boolean).slice(0, 10).join(","); await db.chatConversation.update({ where: { id: c.id }, data: { tags: tags || null } }); return NextResponse.json({ ok: true, tags }); }
  if (b.action === "note") { const body = String(b.body || "").trim().slice(0, 4000); if (!body) return NextResponse.json({ ok: false, error: "Empty" }, { status: 422 }); await db.chatMessage.create({ data: { conversationId: c.id, sender: "note", body: `${s.email}: ${body}` } }); return NextResponse.json({ ok: true }); }
  if (b.action === "close" || b.action === "reopen") {
    const status = b.action === "close" ? "closed" : "open"; await db.chatConversation.update({ where: { id: c.id }, data: { status } });
    publish({ type: "status", conversationId: c.id, data: { status } }); return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
