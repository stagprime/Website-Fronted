/** Content backups: JSON export of every CMS table (no users, orders or secrets). Stored in BACKUP_DIR (default data/backups). */
import fs from "fs/promises"; import path from "path";
import { db } from "./db";
export const BACKUP_TABLES = ["setting", "page", "uiString", "redirect", "seoRecord", "blogPost", "coupon", "form", "emailTemplate", "knowledgeDoc", "media"] as const;
type T = (typeof BACKUP_TABLES)[number];
type D = { findMany: () => Promise<unknown[]>; deleteMany: (a?: unknown) => Promise<unknown>; createMany: (a: { data: unknown[] }) => Promise<unknown> };
const m = (t: T) => (db as unknown as Record<string, D>)[t];
export const backupDir = () => process.env.BACKUP_DIR || path.join(process.cwd(), "data", "backups");
export async function makeBackup(actor?: string, kind = "content") {
  const data: Record<string, unknown[]> = {}; for (const t of BACKUP_TABLES) data[t] = await m(t).findMany();
  const json = JSON.stringify({ version: 1, createdAt: new Date().toISOString(), tables: data });
  await fs.mkdir(backupDir(), { recursive: true }); const file = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  await fs.writeFile(path.join(backupDir(), file), json);
  return db.backup.create({ data: { file, size: Buffer.byteLength(json), kind, actor } });
}
const DATES = /^(createdAt|updatedAt|publishAt|startsAt|endsAt|lastSeen|emailVerified)$/;
export async function restoreBackup(json: string, only?: T[]) {
  const j = JSON.parse(json) as { version: number; tables: Record<string, Record<string, unknown>[]> }; if (j.version !== 1 || !j.tables) throw new Error("Not a Stag Prime backup file");
  const tables = BACKUP_TABLES.filter(t => (!only || only.includes(t)) && Array.isArray(j.tables[t]));
  const rows = (t: T) => j.tables[t].map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, DATES.test(k) && typeof v === "string" ? new Date(v) : v && typeof v === "object" && !(v instanceof Date) ? JSON.stringify(v) : v])));
  await db.$transaction(async tx => { for (const t of tables) { const d = (tx as unknown as Record<string, D>)[t]; await d.deleteMany({}); const r = rows(t); for (let i = 0; i < r.length; i += 500) await d.createMany({ data: r.slice(i, i + 500) }); } }, { timeout: 120_000 });
  return tables.map(t => `${t}: ${j.tables[t].length}`);
}
