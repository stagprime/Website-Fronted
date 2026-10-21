import fs from "fs/promises"; import path from "path";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { route, ok, fail } from "@/lib/api";
import { audit } from "@/lib/audit";
import { makeBackup, restoreBackup, backupDir, BACKUP_TABLES } from "@/lib/backup";
import { invalidateSettings } from "@/lib/settings";
import { bumpRedirects } from "@/lib/redirects";
export const runtime = "nodejs";
export const GET = route("backups.manage", async ({ url }) => {
  const id = url.searchParams.get("download");
  if (id) { const b = await db.backup.findUnique({ where: { id } }); if (!b) return fail("Not found", 404); const buf = await fs.readFile(path.join(backupDir(), path.basename(b.file))).catch(() => null); if (!buf) return fail("Backup file missing on disk", 404);
    return new Response(new Uint8Array(buf), { headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="${b.file}"` } }); }
  return ok({ backups: await db.backup.findMany({ orderBy: { createdAt: "desc" }, take: 100 }), tables: BACKUP_TABLES });
});
/** POST {action:"create"} | {action:"restore", id | json, tables?} (a safety backup is taken first) | multipart file upload restore. */
export const POST = route("backups.manage", async ({ req, body, who, ip }) => {
  let json = ""; let action = String(body.action || "");
  if ((req.headers.get("content-type") || "").includes("multipart/form-data")) { const fd = await req.formData(); const f = fd.get("file"); if (!f || typeof f === "string") return fail("Choose a backup file"); json = await f.text(); action = "restore"; }
  if (action === "create") { const b = await makeBackup(who.email); await audit(who, "backup.create", "backup", b.id, b.file, ip); return ok({ backup: b }); }
  if (action !== "restore") return fail("Unknown action");
  if (!json) { const b = await db.backup.findUnique({ where: { id: String(body.id || "") } }); if (!b) return fail("Backup not found", 404); json = await fs.readFile(path.join(backupDir(), path.basename(b.file)), "utf8"); }
  const safety = await makeBackup(who.email, "pre-restore");
  try { const summary = await restoreBackup(json, Array.isArray(body.tables) ? body.tables as never : undefined); invalidateSettings(); bumpRedirects(); revalidatePath("/", "layout"); await audit(who, "backup.restore", "backup", safety.id, summary, ip); return ok({ summary, safety: safety.file }); }
  catch (e) { return fail(`Restore failed, nothing changed: ${(e as Error).message}`); }
});
export const DELETE = route("backups.manage", async ({ url, who, ip }) => {
  const b = await db.backup.findUnique({ where: { id: url.searchParams.get("id") || "" } }); if (!b) return fail("Not found", 404);
  await fs.rm(path.join(backupDir(), path.basename(b.file)), { force: true }); await db.backup.delete({ where: { id: b.id } }); await audit(who, "backup.delete", "backup", b.id, b.file, ip); return ok();
});
