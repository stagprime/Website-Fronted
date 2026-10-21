import { CONTACT } from "@/lib/i18n";
import { getLoc } from "@/lib/loc";
import { chatT } from "@/lib/chatkeys";
import ChatLauncher from "./chat/Launcher";
/** One bottom-right launcher: live chat + WhatsApp / Telegram / call (replaces the old floating bar). */
export default function ContactDock() {
  return <ChatLauncher t={chatT()} locale={getLoc()} contact={{ whatsapp: CONTACT.whatsapp, telegram: CONTACT.telegram, tel: CONTACT.tel, phone: CONTACT.phone }} />;
}
