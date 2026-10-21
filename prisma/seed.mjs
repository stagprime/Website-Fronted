// Seed: creates/updates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD and registers digital downloads.
// Run: npm run db:seed   (after npm run db:migrate)
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();
const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim(), password = process.env.ADMIN_PASSWORD || "";
if (email && password.length >= 12) {
  const passwordHash = await bcrypt.hash(password, 12);
  const ex = await db.user.findUnique({ where: { email } });
  const role = (await db.user.count({ where: { role: "owner" } })) === 0 || ex?.role === "owner" ? "owner" : "admin"; // first admin becomes owner; never demote an owner
  await db.user.upsert({ where: { email }, create: { email, name: "Admin", passwordHash, role, emailVerified: new Date() }, update: { role, passwordHash, disabled: false } });
  console.log("admin ready:", email);
} else console.log("skip admin: set ADMIN_EMAIL and ADMIN_PASSWORD (12+ chars)");
// Digital products → files under DOWNLOADS_DIR (upload the real files there on the server).
const downloads = [["agency-ui-kit", "agency-ui-kit.zip", "Agency UI Kit (Figma)"], ["kdp-cover-templates", "kdp-cover-templates.zip", "KDP Cover Templates"], ["pod-automation-script", "pod-automation-script.zip", "POD Automation Script"]];
for (const [sku, path, name] of downloads) await db.download.upsert({ where: { sku }, create: { sku, path, name }, update: { path, name } });
console.log("downloads registered:", downloads.length);
await db.$disconnect();
