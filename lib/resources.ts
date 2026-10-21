/** Declarative config for simple admin CRUD resources served by /api/admin/r?res=<name>. */
import { revalidateTag } from "next/cache";
import type { Perm } from "./rbac";
import { bumpRedirects } from "./redirects";
type F = { t: "str"; max: number; req?: boolean; re?: RegExp; msg?: string; lower?: boolean; upper?: boolean } | { t: "int"; min?: number; max?: number; req?: boolean } | { t: "bool" } | { t: "date" } | { t: "json"; shape: "array" | "object" } | { t: "enum"; v: string[] };
export type Res = { model: string; read: Perm; write: Perm; fields: Record<string, F>; order: Record<string, "asc" | "desc">; search?: string[]; unique?: string; after?: () => void; check?: (d: Record<string, unknown>) => string | null; create?: boolean };
export const RES: Record<string, Res> = {
  coupon: { model: "coupon", read: "catalog.edit", write: "catalog.edit", order: { createdAt: "desc" }, search: ["code"], unique: "code",
    fields: { code: { t: "str", max: 40, req: true, upper: true, re: /^[A-Z0-9_-]{3,40}$/, msg: "Code: 3–40 letters, numbers, - or _" }, kind: { t: "enum", v: ["percent", "fixed"] }, value: { t: "int", min: 1, max: 10_000_000, req: true }, appliesTo: { t: "str", max: 500 }, maxRedemptions: { t: "int", min: 1 }, startsAt: { t: "date" }, endsAt: { t: "date" }, active: { t: "bool" } },
    check: d => d.kind === "percent" && Number(d.value) > 100 ? "Percent coupons must be 1–100" : d.startsAt && d.endsAt && new Date(String(d.endsAt)) <= new Date(String(d.startsAt)) ? "End must be after start" : null },
  knowledgeDoc: { model: "knowledgeDoc", read: "chat.settings", write: "chat.settings", order: { updatedAt: "desc" }, search: ["title", "body"], fields: { title: { t: "str", max: 200, req: true }, locale: { t: "enum", v: ["en", "bn", "ar", "es", "fr", "de", "hi"] }, body: { t: "str", max: 20000, req: true }, enabled: { t: "bool" } } },
  emailTemplate: { model: "emailTemplate", read: "emails.edit", write: "emails.edit", order: { key: "asc" }, search: ["key", "subject"], fields: { key: { t: "str", max: 60, req: true }, locale: { t: "enum", v: ["en", "bn", "ar", "es", "fr", "de", "hi"] }, subject: { t: "str", max: 300, req: true }, body: { t: "str", max: 20000, req: true }, enabled: { t: "bool" } } },
  form: { model: "form", read: "forms.view", write: "forms.edit", order: { updatedAt: "desc" }, search: ["key", "title"], unique: "key", after: () => revalidateTag("forms"),
    fields: { key: { t: "str", max: 60, req: true, lower: true, re: /^[a-z0-9-]{2,60}$/, msg: "Key: lowercase letters, numbers and dashes" }, title: { t: "str", max: 200, req: true }, fields: { t: "json", shape: "array" }, settings: { t: "json", shape: "object" }, active: { t: "bool" } } },
  formSubmission: { model: "formSubmission", read: "forms.view", write: "forms.view", order: { createdAt: "desc" }, search: ["formKey", "data"], create: false, fields: { status: { t: "enum", v: ["new", "read", "archived"] } } },
  redirect: { model: "redirect", read: "seo.edit", write: "seo.edit", order: { createdAt: "desc" }, search: ["from", "to"], unique: "from", after: bumpRedirects,
    fields: { from: { t: "str", max: 500, req: true, re: /^\/(?!(api|_next|admin)(\/|$))\S*$/, msg: "From must be a site path like /old-page (not /api, /_next, /admin)" }, to: { t: "str", max: 1000 }, code: { t: "enum", v: ["301", "302", "410", "451"] } },
    check: d => !["410", "451"].includes(String(d.code)) && !/^(\/|https?:\/\/)/.test(String(d.to || "")) ? "To must be a path or full URL" : d.from === d.to ? "From and To are the same" : null },
  notFoundLog: { model: "notFoundLog", read: "seo.edit", write: "seo.edit", order: { hits: "desc" }, search: ["path"], create: false, fields: {} },
};
/** Validate & coerce a body against a resource's fields (partial on update). */
export function coerce(r: Res, b: Record<string, unknown>, partial: boolean): Record<string, unknown> | string {
  const out: Record<string, unknown> = {};
  for (const [k, f] of Object.entries(r.fields)) {
    const v = b[k]; if (v === undefined) { if (!partial && "req" in f && f.req) return `${k} is required`; continue; }
    if (f.t === "str") { let s = v == null ? "" : String(v).trim(); if (f.upper) s = s.toUpperCase(); if (f.lower) s = s.toLowerCase(); if (s.length > f.max) return `${k} is too long (max ${f.max})`; if (f.req && !s) return `${k} is required`; if (s && f.re && !f.re.test(s)) return f.msg || `${k} is invalid`; out[k] = s; }
    else if (f.t === "int") { if (v === "" || v == null) { if (f.req) return `${k} is required`; out[k] = null; continue; } const n = Math.round(Number(v)); if (!Number.isFinite(n) || (f.min != null && n < f.min) || (f.max != null && n > f.max)) return `${k} is out of range`; out[k] = n; }
    else if (f.t === "bool") out[k] = v === true || v === "true" || v === 1;
    else if (f.t === "date") { if (!v) { out[k] = null; continue; } const d = new Date(String(v)); if (isNaN(+d)) return `${k} is not a valid date`; out[k] = d; }
    else if (f.t === "enum") { const s = String(v); if (!f.v.includes(s)) return `${k} must be one of ${f.v.join(", ")}`; out[k] = /^\d+$/.test(s) && k === "code" ? Number(s) : s; }
    else if (f.t === "json") { let j = v; if (typeof v === "string") { try { j = JSON.parse(v); } catch { return `${k} must be valid JSON`; } } if (f.shape === "array" ? !Array.isArray(j) : (typeof j !== "object" || !j || Array.isArray(j))) return `${k} must be a JSON ${f.shape}`; out[k] = JSON.stringify(j); }
  }
  const err = r.check?.({ ...b, ...out }); return err || out;
}
