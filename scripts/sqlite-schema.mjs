// Generates prisma/dev/schema.prisma for local SQLite development (no Postgres needed).
import fs from "fs";
let s = fs.readFileSync("prisma/schema.prisma", "utf8").replace('provider = "postgresql"', 'provider = "sqlite"').replace(/ @db\.Text/g, "");
// SQLite has no enums / Json in Prisma 5 → map to String.
const enums = [...s.matchAll(/enum (\w+) \{[^}]*\}/g)].map(m => m[1]); s = s.replace(/enum \w+ \{[^}]*\}\n?/g, "");
for (const e of enums) s = s.replace(new RegExp(`(\\s)${e}(\\??)(\\s|$)`, "g"), "$1String$2$3");
s = s.replace(/@default\((customer|pending)\)/g, '@default("$1")').replace(/ Json(\?)?/g, " String$1");
// Uses DATABASE_URL like production; for local dev set DATABASE_URL="file:$PWD/prisma/dev/dev.db" and SP_SQLITE=1.
fs.mkdirSync("prisma/dev", { recursive: true }); fs.writeFileSync("prisma/dev/schema.prisma", s);
