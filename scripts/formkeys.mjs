import fs from "fs";
const src = fs.readFileSync("components/Forms.tsx", "utf8"); const set = new Set();
for (const m of src.matchAll(/tf\(t, "((?:[^"\\]|\\.)*)"\)/g)) set.add(JSON.parse(`"${m[1]}"`));
for (const m of src.matchAll(/\[((?:\s*"[^"]*",?)+)\s*\]/g)) for (const x of m[1].matchAll(/"([^"]*)"/g)) set.add(x[1]);
["Sending…", "Network error — please use WhatsApp or email.", "Thanks! We received your message and will reply soon.", "I’m interested in", "Login", "Sign up"].forEach(k => set.add(k));
fs.writeFileSync("lib/formkeys.json", JSON.stringify([...set].filter(k => /[A-Za-z]/.test(k) && !/^(login|signup|text|email|password)$/.test(k)), null, 0));
