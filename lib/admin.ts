/** Admin helpers. All /admin pages and /api/admin routes must call requireStaff()/requireAdmin(). */
import { auth } from "@/auth";
export const STAFF_ROLES = ["admin", "staff"];
export async function requireStaff() { const s = await auth().catch(() => null); return s?.user && STAFF_ROLES.includes(s.user.role) ? s : null; }
export async function requireAdmin() { const s = await auth().catch(() => null); return s?.user?.role === "admin" ? s : null; }
export const deny = () => Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
