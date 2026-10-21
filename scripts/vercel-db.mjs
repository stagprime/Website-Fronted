// Vercel build step: apply migrations + idempotent seeds against the attached Postgres (Neon). No-op elsewhere.
import { execSync } from "child_process";
if (!process.env.VERCEL || !process.env.DATABASE_URL) { console.log("vercel-db: skipped"); process.exit(0); }
const direct = process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;
const run = (cmd) => execSync(cmd, { stdio: "inherit", env: { ...process.env, DATABASE_URL: direct } });
run("npx prisma migrate deploy");
run("node prisma/seed.mjs");
run("npx tsx prisma/seed-cms.ts");
console.log("vercel-db: migrated and seeded");
