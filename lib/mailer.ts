import fs from "fs/promises"; import path from "path"; import { dataRoot, putFile } from "@/lib/files";
// Pluggable mailer: RESEND_API_KEY → Resend; SMTP_HOST → SMTP (nodemailer); always also appended to data/submissions.jsonl.
type Att = { filename: string; content: Buffer };
export async function deliver(subject: string, text: string, record: Record<string, unknown>, attachments: Att[] = []) {
  const dir = process.env.SUBMISSIONS_DIR || dataRoot();
  const saved: string[] = [];
  // Attachments + the jsonl log are best-effort: the DB inbox (FormSubmission) and email are the records of truth.
  for (const a of attachments) { const fn = `${Date.now()}-${a.filename.replace(/[^\w.-]/g, "_")}`; try { await putFile("submissions", dir, `uploads/${fn}`, a.content); saved.push(`uploads/${fn}`); } catch (e) { console.error("[mailer] attachment", (e as Error).message); } }
  await fs.mkdir(dir, { recursive: true }).catch(() => {}); await fs.appendFile(path.join(dir, "submissions.jsonl"), JSON.stringify({ at: new Date().toISOString(), subject, ...record, files: saved }) + "\n").catch(() => {});
  const to = process.env.MAIL_TO || "brand@stagprime.com", from = process.env.MAIL_FROM || "Stag Prime Website <no-reply@stagprime.com>";
  try {
    if (process.env.RESEND_API_KEY) {
      const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [to], subject, text, reply_to: record.email, attachments: attachments.map(a => ({ filename: a.filename, content: a.content.toString("base64") })) }) });
      return { mailed: r.ok, via: "resend" };
    }
    if (process.env.SMTP_HOST) {
      const nm = await import("nodemailer");
      const t = nm.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === "true", auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined });
      await t.sendMail({ from, to, subject, text, replyTo: String(record.email || ""), attachments });
      return { mailed: true, via: "smtp" };
    }
  } catch (e) { console.error("[mailer]", (e as Error).message); return { mailed: false, via: "file" }; }
  return { mailed: false, via: "file" };
}
/** Transactional email to a user (verification, reset, order updates). Falls back to logging in data/outbox.jsonl. */
export async function deliverMail(to: string, subject: string, text: string) {
  const from = process.env.MAIL_FROM || "Stag Prime <no-reply@stagprime.com>";
  try {
    if (process.env.RESEND_API_KEY) { const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [to], subject, text }) }); if (r.ok) return { sent: true }; }
    else if (process.env.SMTP_HOST) { const nm = await import("nodemailer"); await nm.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === "true", auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined }).sendMail({ from, to, subject, text }); return { sent: true }; }
  } catch (e) { console.error("[mail]", (e as Error).message); }
  const dir = process.env.SUBMISSIONS_DIR || dataRoot(); await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(path.join(dir, "outbox.jsonl"), JSON.stringify({ at: new Date().toISOString(), to, subject, text }) + "\n"); return { sent: false };
}
