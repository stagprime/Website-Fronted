/**
 * Request-scoped site snapshot. `await primeSite(locale)` (called by useParamsLoc in every page/layout/metadata)
 * loads the effective settings (DB `Setting` rows over code defaults), UiString overrides and page docs once per
 * request through the tagged cache. After that, server components read synchronously with `S()`.
 * If the DB is missing/unreachable everything falls back to the code defaults (content/*.ts, lib/*.ts).
 */
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { DEFAULTS, getSettings, type Settings } from "@/lib/settings";
import { setOverrides } from "@/lib/loc";
import { dbReady } from "@/lib/db";

const snap = cache(() => ({ s: null as Settings | null, ui: new Set<string>(), pages: null as Record<string, unknown> | null, current: "" }));

export const uiOverrides = (locale: string) => unstable_cache(async () => {
  if (!dbReady()) return {} as Record<string, string>;
  try { const { db } = await import("@/lib/db"); const rows = await db.uiString.findMany({ where: { locale }, select: { key: true, value: true } }); return Object.fromEntries(rows.map(r => [r.key, r.value])) as Record<string, string>; }
  catch { return {} as Record<string, string>; }
}, ["ui-overrides", locale], { tags: ["ui", `ui:${locale}`], revalidate: 600 })();

export const pageDocs = unstable_cache(async () => {
  if (!dbReady()) return {} as Record<string, { title: string; sections: string; status: string }>;
  try { const { db } = await import("@/lib/db"); const rows = await db.page.findMany({ where: { status: "published" }, select: { key: true, title: true, sections: true, status: true } }); return Object.fromEntries(rows.map(r => [r.key, r])); }
  catch { return {}; }
}, ["page-docs"], { tags: ["pages"], revalidate: 600 });

export async function primeSite(locale: string) {
  const st = snap();
  const jobs: Promise<unknown>[] = [];
  if (!st.s) jobs.push(getSettings().then(s => { st.s = s; }).catch(() => { st.s = DEFAULTS; }));
  if (!st.pages) jobs.push(pageDocs().then(p => { st.pages = p; }).catch(() => { st.pages = {}; }));
  for (const l of new Set(["en", locale])) if (!st.ui.has(l)) { st.ui.add(l); jobs.push(uiOverrides(l).then(m => setOverrides(l, m))); }
  await Promise.all(jobs);
  return st.s!;
}
/** Effective site content for this request (call after primeSite / useParamsLoc). */
export function S(): Settings { return snap().s ?? DEFAULTS; }
export function rawPage(key: string) { return (snap().pages?.[key] as { title: string; sections: string } | undefined) ?? undefined; }
export function setCurrentPage(key: string) { snap().current = key; }
export function currentPage() { return snap().current; }
export const gigOf = (svc: string) => S().gigs.find(g => g.svc === svc);
