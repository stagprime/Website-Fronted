// Next.js standalone output does not include /public or .next/static — copy them so `node .next/standalone/server.js` serves everything.
import fs from "fs";
if (fs.existsSync(".next/standalone")) {
  fs.cpSync("public", ".next/standalone/public", { recursive: true });
  fs.cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
  for (const d of ["content/posts/i18n"]) if (fs.existsSync(d)) fs.cpSync(d, `.next/standalone/${d}`, { recursive: true });
  console.log("standalone: copied public/, .next/static and translations");
}
