import Inbox from "./Inbox";
import { db } from "@/lib/db";
import { staff, can } from "@/lib/rbac";
import { getSettings } from "@/lib/settings";
import { aiKey } from "@/lib/ai";
export const metadata = { title: "Live chat inbox" };
export default async function ChatAdmin() {
  const who = await staff(); if (!who || !can(who.role, "chat.use")) return null; const s = await getSettings();
  const team = await db.user.findMany({ where: { role: { in: ["owner", "admin", "editor", "support", "staff"] as never[] }, disabled: false }, select: { id: true, name: true, email: true } });
  return <><h1 className="mb-4 font-display text-2xl font-bold text-white">Live chat inbox</h1><Inbox me={who?.id || ""} team={team.map(t => ({ id: t.id, label: t.name || t.email }))} canned={s.chat.canned || []} ai={aiKey()} /></>;
}
