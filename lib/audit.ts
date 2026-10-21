import { db } from "@/lib/db";
const MAX = 20000;
/** Append to the audit log (never throws). `diff` is stored as JSON text, truncated. */
export async function audit(actor: { id: string; email: string } | null, action: string, entity: string, entityId?: string | null, diff?: unknown, ip?: string | null) {
  try { await db.auditLog.create({ data: { actorId: actor?.id, actor: actor?.email, action, entity, entityId: entityId ?? null, diff: diff === undefined ? null : JSON.stringify(diff).slice(0, MAX), ip: ip ?? null } }); } catch { /* ignore */ }
}
/** Keep a restorable snapshot of an entity before it changes (last 30 per entity). */
export async function snapshot(entity: string, entityId: string, data: unknown, actor?: string) {
  try {
    await db.revision.create({ data: { entity, entityId, data: JSON.stringify(data), actor } });
    const old = await db.revision.findMany({ where: { entity, entityId }, orderBy: { createdAt: "desc" }, skip: 30, select: { id: true } });
    if (old.length) await db.revision.deleteMany({ where: { id: { in: old.map(o => o.id) } } });
  } catch { /* ignore */ }
}
/** Shallow diff of two JSON-able values for the audit log. */
export function diffOf(a: unknown, b: unknown) {
  if (a && b && typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b)) {
    const o: Record<string, [unknown, unknown]> = {}; const A = a as Record<string, unknown>, B = b as Record<string, unknown>;
    for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) if (JSON.stringify(A[k]) !== JSON.stringify(B[k])) o[k] = [A[k], B[k]];
    return o;
  }
  return JSON.stringify(a) === JSON.stringify(b) ? {} : { value: [Array.isArray(a) ? `${a.length} items` : a, Array.isArray(b) ? `${b.length} items` : b] };
}
