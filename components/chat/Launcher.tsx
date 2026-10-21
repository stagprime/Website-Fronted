"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { track } from "@/lib/analytics";
// The panel (and its SSE logic) is only downloaded when the visitor opens chat → no Lighthouse cost.
const Panel = dynamic(() => import("./Panel"), { ssr: false });
export type ChatProps = { t: Record<string, string>; locale: string; contact: { whatsapp: string; telegram: string; tel: string; phone: string } };
const I = {
  chat: <path d="M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2H8l-4 4V6a2 2 0 012-2z" />,
  wa: <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.8-1.1-4.6-4-4.8-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z" />,
  tg: <path d="M21.9 4.3l-3 14.3c-.2 1-.8 1.3-1.7.8l-4.6-3.4-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L7.2 12.5l-4.6-1.4c-1-.3-1-1 .2-1.5l17.9-6.9c.8-.3 1.6.2 1.2 1.6z" />,
  call: <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z" />,
  x: <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />,
};
export default function ChatLauncher(p: ChatProps) {
  const { t, contact } = p;
  const [menu, setMenu] = useState(false); const [chat, setChat] = useState(false); const [unread, setUnread] = useState(0);
  // Unread badge: if a conversation exists (non-httpOnly hint cookie), listen for agent/AI replies while the panel is closed.
  useEffect(() => {
    if (chat || !document.cookie.includes("sp_chat_on=1")) return;
    const es = new EventSource("/api/chat/stream");
    es.onmessage = ev => { try { const e = JSON.parse(ev.data); if (e.type === "message" && e.data.sender !== "visitor") setUnread(u => u + 1); } catch { /* ignore */ } };
    return () => es.close();
  }, [chat]);
  const open = () => { setChat(true); setMenu(false); setUnread(0); };
  const c = (label: string) => () => track("Contact", { method: label });
  const item = "group flex items-center gap-3 rounded-full ps-4 pe-1.5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-black/40 transition hover:scale-[1.03]";
  return (
    <div className="contact-dock fixed z-[60] bottom-4 end-4 flex flex-col items-end gap-3">
      {chat && <Panel {...p} onClose={() => setChat(false)} />}
      {menu && !chat && <div id="sp-dock" className="flex flex-col items-end gap-2.5" role="menu" aria-label={t["Contact options"]}>
        <button role="menuitem" onClick={open} className={`${item} bg-blue-brand`}>{t["Live chat"]}<span className="grid place-items-center w-9 h-9 rounded-full bg-white/15"><svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">{I.chat}</svg></span></button>
        <a role="menuitem" href={contact.whatsapp} target="_blank" rel="noopener" onClick={c("whatsapp")} className={`${item} bg-[#178a3e]`}>{t["Chat on WhatsApp"]}<span className="grid place-items-center w-9 h-9 rounded-full bg-white/15"><svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">{I.wa}</svg></span></a>
        <a role="menuitem" href={contact.telegram} target="_blank" rel="noopener" onClick={c("telegram")} className={`${item} bg-[#1b6fa0]`}>{t["Message on Telegram"]}<span className="grid place-items-center w-9 h-9 rounded-full bg-white/15"><svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">{I.tg}</svg></span></a>
        <a role="menuitem" href={contact.tel} onClick={c("call")} className={`${item} bg-navy-800 border border-white/15`}>{t["Call"]} <span dir="ltr">{contact.phone}</span><span className="grid place-items-center w-9 h-9 rounded-full bg-white/15"><svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">{I.call}</svg></span></a>
      </div>}
      {!chat && <button onClick={() => setMenu(m => !m)} aria-expanded={menu} aria-controls="sp-dock" aria-label={menu ? t["Close chat"] : t["Chat with us"]}
        className="relative grid place-items-center w-14 h-14 rounded-full bg-gradient-to-br from-sky-brand to-blue-brand text-white shadow-xl shadow-black/50 hover:scale-105 transition pulse-ring">
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden>{menu ? I.x : I.chat}</svg>
        {unread > 0 && <span className="absolute -top-1 -end-1 min-w-5 h-5 px-1 rounded-full bg-[#D33F49] text-[11px] font-bold grid place-items-center" aria-label={`${unread} ${t["unread messages"]}`}>{unread}</span>}
      </button>}
    </div>
  );
}
