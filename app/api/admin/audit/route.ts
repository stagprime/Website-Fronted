import { db } from "@/lib/db";
import { route, ok } from "@/lib/api";
export const runtime = "nodejs";
/** GET ?q=&entity=&actor=&before=ISO → latest 200 entries (cursor by createdAt). ?format=csv exports. */
export const GET = route("audit.view", async ({ url }) => {
  const sp = url.searchParams; const q = sp.get("q") || ""; const entity = sp.get("entity") || ""; const actor = sp.get("actor") || ""; const before = sp.get("before");
  const rows = await db.auditLog.findMany({ where: { ...(entity && { entity }), ...(actor && { actor: { contains: actor } }), ...(before && { createdAt: { lt: new Date(before) } }), ...(q && { OR: [{ action: { contains: q } }, { entityId: { contains: q } }, { diff: { contains: q } }] }) }, orderBy: { createdAt: "desc" }, take: sp.get("format") === "csv" ? 5000 : 200 });
  if (sp.get("format") === "csv") { const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`; return new Response(["createdAt,actor,action,entity,entityId,ip,diff", ...rows.map(r => [r.createdAt.toISOString(), r.actor, r.action, r.entity, r.entityId, r.ip, r.diff].map(esc).join(","))].join("\n"), { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=audit-log.csv" } }); }
  const entities = (await db.auditLog.groupBy({ by: ["entity"], _count: true })).map(e => e.entity);
  return ok({ rows, entities });
});
