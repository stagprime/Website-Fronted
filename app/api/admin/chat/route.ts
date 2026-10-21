import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff, deny } from "@/lib/admin";
import { addMessage, publish } from "@/lib/chat";
import { sameOrigin } from "@/lib/guard";
import { deliverMail } from "@/lib/mailer";
export const runtime = "nodejs";
/** GET → conversation list, or ?id= → one conversation with messages. */
export async function GET(req: Request) {
  if (!(await requireStaff())) return deny();
  const id = new URL(req.url).searchParams.get("id");
  if (id) return NextResponse.json({ ok: true, conversation: await db.chatConversation.findUnique({ where: { id }, include: { messages: { orderBy: { createdAt: "asc" } } } }) });
  const list = await db.chatConversation.findMany({ orderBy: { updatedAt: "desc" }, take: 100, include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } } });
  return NextResponse.json({ ok: true, conversations: list });
}
/** POST {id, action: reply|close|reopen|typing, body?} */
export async function POST(req: Request) {
  const s = await requireStaff(); if (!s) return deny(); if (!sameOrigin(req)) return deny();
  const b = await req.json().catch(() => ({})); const c = await db.chatConversation.findUnique({ where: { id: String(b.id || "") } });
  if (!c) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (b.action === "typing") { publish({ type: "typing", conversationId: c.id, data: { who: "agent" } }); return NextResponse.json({ ok: true }); }
  if (b.action === "reply") {
    const body = String(b.body || "").trim().slice(0, 4000); if (!body) return NextResponse.json({ ok: false, error: "Empty" }, { status: 422 });
    if (c.status !== "human") await db.chatConversation.update({ where: { id: c.id }, data: { status: "human" } }); // agent takes over from AI
    const m = await addMessage(c.id, "agent", body);
    if (b.email && c.email) await deliverMail(c.email, "Stag Prime replied to your chat", `${body}\n\nContinue the chat on ${process.env.NEXT_PUBLIC_SITE_URL || "https://www.stagprime.com"}`);
    return NextResponse.json({ ok: true, message: m });
  }
  if (b.action === "close" || b.action === "reopen") {
    const status = b.action === "close" ? "closed" : "open"; await db.chatConversation.update({ where: { id: c.id }, data: { status } });
    publish({ type: "status", conversationId: c.id, data: { status } }); return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
