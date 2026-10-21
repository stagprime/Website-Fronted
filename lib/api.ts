/** Small wrapper for /api/admin/* route handlers: permission check, CSRF (same-origin) for writes, JSON parsing and errors. */
import { NextResponse } from "next/server";
import { requirePerm, type Perm } from "@/lib/rbac";
import { sameOrigin } from "@/lib/guard";
type Who = NonNullable<Awaited<ReturnType<typeof requirePerm>>>;
export class HttpError extends Error { constructor(public status: number, msg: string) { super(msg); } }
export const ok = (data: Record<string, unknown> = {}) => NextResponse.json({ ok: true, ...data });
export const fail = (error: string, status = 422) => NextResponse.json({ ok: false, error }, { status });
export function route(perm: Perm, fn: (ctx: { req: Request; who: Who; body: Record<string, unknown>; url: URL; ip: string | null }) => Promise<Response>) {
  return async (req: Request) => {
    const who = await requirePerm(perm); if (!who) return fail("Forbidden — your role cannot do this.", 403);
    const write = !["GET", "HEAD"].includes(req.method);
    if (write && !sameOrigin(req)) return fail("Invalid origin", 403);
    let body: Record<string, unknown> = {};
    if (write && (req.headers.get("content-type") || "").includes("application/json")) { try { body = await req.json(); } catch { return fail("Invalid JSON", 400); } }
    try { return await fn({ req, who, body, url: new URL(req.url), ip: (req.headers.get("x-forwarded-for") || "").split(",")[0] || null }); }
    catch (e) { if (e instanceof HttpError) return fail(e.message, e.status); console.error("[admin api]", e); return fail((e as Error).message || "Server error", 500); }
  };
}
export const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
export function need(cond: unknown, msg: string): asserts cond { if (!cond) throw new HttpError(422, msg); }
