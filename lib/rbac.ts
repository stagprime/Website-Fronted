/**
 * Role-based access control for the admin. Roles: owner > admin > editor | support (staff is a legacy alias of support).
 * The role is re-read from the DB on every admin request (cached 30 s) so demotions / disabling take effect immediately.
 */
import { auth } from "@/auth";
export const STAFF = ["owner", "admin", "editor", "support", "staff"] as const;
export type StaffRole = "owner" | "admin" | "editor" | "support";
export const normRole = (r?: string | null): StaffRole | "customer" => (r === "staff" ? "support" : (["owner", "admin", "editor", "support"].includes(r || "") ? r as StaffRole : "customer"));

export const PERMS = {
  "dashboard.view": ["owner", "admin", "editor", "support"],
  "content.edit": ["owner", "admin", "editor"],        // pages, menus, blog, media, translations, content lists
  "seo.edit": ["owner", "admin", "editor"],
  "catalog.edit": ["owner", "admin"],                  // products, gigs, prices, coupons, Stripe sync
  "orders.view": ["owner", "admin", "editor", "support"],
  "orders.update": ["owner", "admin", "support"],
  "orders.refund": ["owner", "admin"],
  "customers.view": ["owner", "admin", "support"],
  "customers.edit": ["owner", "admin"],
  "chat.use": ["owner", "admin", "support"],
  "chat.settings": ["owner", "admin"],
  "forms.view": ["owner", "admin", "editor", "support"],
  "forms.edit": ["owner", "admin", "editor"],
  "emails.edit": ["owner", "admin"],
  "settings.edit": ["owner", "admin"],                 // branding, contact, tracking, consent, global settings
  "html.edit": ["owner", "admin"],                     // raw HTML blocks / custom CSS
  "users.manage": ["owner"],                           // staff roles
  "audit.view": ["owner", "admin"],
  "backups.manage": ["owner"],
} as const satisfies Record<string, readonly StaffRole[]>;
export type Perm = keyof typeof PERMS;
export const can = (role: string | undefined | null, p: Perm) => (PERMS[p] as readonly string[]).includes(normRole(role));
export const isStaff = (role?: string | null) => normRole(role) !== "customer";

type Who = { id: string; email: string; name: string | null; role: StaffRole };
const cache = (globalThis as unknown as { __spRole?: Map<string, { at: number; who: Who | null }> });
cache.__spRole ??= new Map();
export function forgetRole(userId?: string) { if (userId) cache.__spRole!.delete(userId); else cache.__spRole!.clear(); }
/** Current staff member (fresh role from DB), or null. */
export async function staff(): Promise<Who | null> {
  const s = await auth().catch(() => null); const id = s?.user?.id; if (!id) return null;
  const hit = cache.__spRole!.get(id); if (hit && Date.now() - hit.at < 30_000) return hit.who;
  let who: Who | null = null;
  try { const { db } = await import("@/lib/db"); const u = await db.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true, disabled: true } });
    const r = normRole(u?.role); if (u && !u.disabled && r !== "customer") who = { id: u.id, email: u.email, name: u.name, role: r }; } catch { who = null; }
  cache.__spRole!.set(id, { at: Date.now(), who }); return who;
}
export async function requirePerm(p: Perm) { const w = await staff(); return w && can(w.role, p) ? w : null; }
