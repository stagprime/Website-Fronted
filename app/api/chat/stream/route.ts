import { cookies } from "next/headers";
import { bus, sse, CHAT_COOKIE, type ChatEvent } from "@/lib/chat";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
/** Visitor SSE stream for the conversation in the httpOnly chat cookie. */
export async function GET() {
  const id = (await cookies()).get(CHAT_COOKIE)?.value; if (!id) return new Response("No conversation", { status: 404 });
  return sse(send => { const h = (e: ChatEvent) => send(e); bus.on(`c:${id}`, h); return () => bus.off(`c:${id}`, h); });
}
