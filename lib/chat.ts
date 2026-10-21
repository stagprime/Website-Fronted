/**
 * Live chat core. Real-time delivery uses an in-process event bus + Server-Sent Events.
 * This is correct for a single Node process (PM2 fork mode, 1 instance). For several instances,
 * replace `bus` with Postgres LISTEN/NOTIFY or Redis pub/sub — the publish()/subscribe() API stays the same.
 */
import { EventEmitter } from "events";
import { db } from "./db";
type G = { bus?: EventEmitter; agents?: Set<string> };
const g = globalThis as unknown as G;
export const bus = g.bus ?? (g.bus = new EventEmitter().setMaxListeners(1000));
export const agentsOnline = g.agents ?? (g.agents = new Set<string>());
export type ChatEvent = { type: "message" | "typing" | "status"; conversationId: string; data: unknown };
export const publish = (e: ChatEvent) => { bus.emit(`c:${e.conversationId}`, e); bus.emit("admin", e); };
export async function addMessage(conversationId: string, sender: "visitor" | "ai" | "agent" | "system", body: string, file?: string) {
  const m = await db.chatMessage.create({ data: { conversationId, sender, body, file } });
  await db.chatConversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
  publish({ type: "message", conversationId, data: m }); return m;
}
export const CHAT_COOKIE = "sp_chat";
export function sse(subscribe: (send: (e: unknown) => void) => () => void) {
  const enc = new TextEncoder(); let cleanup = () => {};
  const stream = new ReadableStream({
    start(c) {
      const send = (e: unknown) => { try { c.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`)); } catch { cleanup(); } };
      const hb = setInterval(() => { try { c.enqueue(enc.encode(": ping\n\n")); } catch { cleanup(); } }, 25000);
      const un = subscribe(send); cleanup = () => { clearInterval(hb); un(); };
    },
    cancel() { cleanup(); },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" } });
}
