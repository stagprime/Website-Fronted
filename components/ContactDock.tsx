import { S } from "@/lib/site";
import { getLoc, T } from "@/lib/loc";
import { chatT } from "@/lib/chatkeys";
import ChatLauncher from "./chat/Launcher";
/** One bottom-right launcher: live chat + WhatsApp / Telegram / call (replaces the old floating bar). */
export default function ContactDock() {
  const { contact: CONTACT, chat } = S(); if (!chat.enabled) return null;
  return <ChatLauncher greeting={chat.greeting ? T(chat.greeting) : ""} t={chatT()} locale={getLoc()} contact={{ whatsapp: chat.showWhatsapp ? CONTACT.whatsapp : "", telegram: chat.showTelegram ? CONTACT.telegram : "", tel: chat.showCall ? CONTACT.tel : "", phone: CONTACT.phone }} />;
}
