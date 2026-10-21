import { db } from "@/lib/db";
import { route, ok, fail, str } from "@/lib/api";
import { EMAILS, renderEmail } from "@/lib/email";
import { deliverMail } from "@/lib/mailer";
import { audit } from "@/lib/audit";
export const runtime = "nodejs";
export const GET = route("emails.edit", async () => ok({ defaults: EMAILS, rows: await db.emailTemplate.findMany(), transport: process.env.RESEND_API_KEY ? "resend" : process.env.SMTP_HOST ? "smtp" : "outbox file (data/outbox.jsonl)" }));
/** POST {key, locale} → sends a sample to the signed-in staff member's own address. */
export const POST = route("emails.edit", async ({ body, who, ip }) => {
  const key = str(body.key, 60); if (!EMAILS[key]) return fail("Unknown template");
  const sample = Object.fromEntries(EMAILS[key].vars.map(v => [v, v === "url" ? (process.env.NEXT_PUBLIC_SITE_URL || "https://www.stagprime.com") + "/en/account" : v === "days" ? 3 : `[${v}]`]));
  const m = await renderEmail(key, sample, str(body.locale, 5) || "en"); const r = await deliverMail(who.email, `[TEST] ${m.subject}`, m.body);
  await audit(who, "email.test", "emailTemplate", key, null, ip); return ok({ sent: r.sent, to: who.email, preview: m });
});
