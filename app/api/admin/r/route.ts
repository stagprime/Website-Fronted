import { db } from "@/lib/db";
import { route, ok, fail } from "@/lib/api";
import { can } from "@/lib/rbac";
import { RES, coerce } from "@/lib/resources";
import { audit, snapshot } from "@/lib/audit";
export const runtime = "nodejs";
type Delegate = { findMany: (a: unknown) => Promise<Record<string, unknown>[]>; findUnique: (a: unknown) => Promise<Record<string, unknown> | null>; create: (a: unknown) => Promise<Record<string, unknown>>; update: (a: unknown) => Promise<Record<string, unknown>>; delete: (a: unknown) => Promise<unknown>; deleteMany: (a: unknown) => Promise<{ count: number }>; count: (a?: unknown) => Promise<number> };
const model = (m: string) => (db as unknown as Record<string, Delegate>)[m];
const idKey = (res: string) => (res === "notFoundLog" ? "path" : "id");
const pick = (url: URL) => { const res = url.searchParams.get("res") || ""; return RES[res] ? { res, r: RES[res] } : null; };
/** GET ?res=&q=&id= list or one row. */
export const GET = route("dashboard.view", async ({ url, who }) => {
  const p = pick(url); if (!p) return fail("Unknown resource", 404); if (!can(who.role, p.r.read)) return fail("Forbidden", 403);
  const id = url.searchParams.get("id"); const m = model(p.r.model);
  if (id) { const row = await m.findUnique({ where: { [idKey(p.res)]: id } }); return row ? ok({ row }) : fail("Not found", 404); }
  const q = url.searchParams.get("q") || ""; const extra: Record<string, unknown> = {};
  for (const [k, v] of url.searchParams) if (k.startsWith("f_")) extra[k.slice(2)] = v;
  const where = { ...extra, ...(q && p.r.search && { OR: p.r.search.map(f => ({ [f]: { contains: q } })) }) };
  const rows = await m.findMany({ where, orderBy: p.r.order, take: Math.min(2000, Number(url.searchParams.get("take")) || 500) });
  return ok({ rows, total: await m.count({ where }) });
});
export const POST = route("dashboard.view", async ({ url, who, body, ip }) => {
  const p = pick(url); if (!p) return fail("Unknown resource", 404); if (!can(who.role, p.r.write)) return fail("Forbidden", 403); if (p.r.create === false) return fail("Rows of this type are created automatically", 405);
  const d = coerce(p.r, body, false); if (typeof d === "string") return fail(d);
  if (p.r.unique && await model(p.r.model).findUnique({ where: { [p.r.unique]: d[p.r.unique] } }).catch(() => null)) return fail(`${p.r.unique} “${d[p.r.unique]}” already exists`, 409);
  const row = await model(p.r.model).create({ data: d }); p.r.after?.(); await audit(who, `${p.res}.create`, p.res, String(row.id ?? row.path), d, ip); return ok({ row });
});
export const PUT = route("dashboard.view", async ({ url, who, body, ip }) => {
  const p = pick(url); if (!p) return fail("Unknown resource", 404); if (!can(who.role, p.r.write)) return fail("Forbidden", 403);
  const id = String(body.id || ""); const m = model(p.r.model); const prev = await m.findUnique({ where: { [idKey(p.res)]: id } }); if (!prev) return fail("Not found", 404);
  const d = coerce(p.r, body, true); if (typeof d === "string") return fail(d);
  const check = p.r.check?.({ ...prev, ...d, code: String(d.code ?? prev.code ?? "") }); if (check) return fail(check);
  if (p.r.unique && d[p.r.unique] && d[p.r.unique] !== prev[p.r.unique] && await m.findUnique({ where: { [p.r.unique]: d[p.r.unique] } })) return fail(`${p.r.unique} already exists`, 409);
  await snapshot(p.res, id, prev, who.email);
  const row = await m.update({ where: { [idKey(p.res)]: id }, data: d }); p.r.after?.(); await audit(who, `${p.res}.update`, p.res, id, d, ip); return ok({ row });
});
/** DELETE ?res=&id= (or &all=1 for notFoundLog / archived submissions). */
export const DELETE = route("dashboard.view", async ({ url, who, ip }) => {
  const p = pick(url); if (!p) return fail("Unknown resource", 404); if (!can(who.role, p.r.write)) return fail("Forbidden", 403);
  const m = model(p.r.model);
  if (url.searchParams.get("all") === "1") { if (p.res === "notFoundLog") { const r = await m.deleteMany({}); await audit(who, "notFoundLog.clear", p.res, null, r.count, ip); return ok({ count: r.count }); } if (p.res === "formSubmission") { const r = await m.deleteMany({ where: { status: "archived" } }); await audit(who, "formSubmission.purge", p.res, null, r.count, ip); return ok({ count: r.count }); } return fail("Not allowed"); }
  const id = url.searchParams.get("id") || ""; const prev = await m.findUnique({ where: { [idKey(p.res)]: id } }); if (!prev) return fail("Not found", 404);
  await snapshot(p.res, id, prev, who.email); await m.delete({ where: { [idKey(p.res)]: id } }); p.r.after?.(); await audit(who, `${p.res}.delete`, p.res, id, prev, ip);
  return ok({ restore: prev });
});
