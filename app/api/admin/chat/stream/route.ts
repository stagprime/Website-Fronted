import { bus, sse, agentsOnline, type ChatEvent } from "@/lib/chat";
import { requirePerm, deny } from "@/lib/admin";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
/** Agent SSE stream: all chat events. While connected, the agent counts as "online" for the widget. */
export async function GET() {
  const s = await requirePerm("chat.use"); if (!s) return deny(); const key = `${s.id}:${Math.random()}`;
  return sse(send => { const h = (e: ChatEvent) => send(e); bus.on("admin", h); agentsOnline.add(key); return () => { bus.off("admin", h); agentsOnline.delete(key); }; });
}
