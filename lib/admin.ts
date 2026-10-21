/** Admin helpers. All /admin pages and /api/admin routes must check a permission (lib/rbac.ts). */
import { staff, requirePerm, can, type Perm } from "@/lib/rbac";
export const STAFF_ROLES = ["owner", "admin", "editor", "support", "staff"];
export async function requireStaff() { const w = await staff(); return w ? { user: w } : null; }
export async function requireAdmin() { const w = await staff(); return w && (w.role === "admin" || w.role === "owner") ? { user: w } : null; }
export const deny = () => Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
export { staff, requirePerm, can };
export type { Perm };
