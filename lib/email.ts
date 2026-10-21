/**
 * Transactional email templates (Admin → Email templates). Each key has a code default (English); admins can override
 * subject/body per locale in the EmailTemplate table. Variables use {{name}} syntax; unknown variables render empty.
 */
import { deliverMail } from "./mailer";
export const EMAILS: Record<string, { label: string; vars: string[]; subject: string; body: string }> = {
  "auth.verify": { label: "Verify email", vars: ["url", "brand"], subject: "Verify your {{brand}} account", body: "Welcome to {{brand}}!\n\nConfirm your email address:\n{{url}}\n\nThis link expires in 24 hours." },
  "auth.reset": { label: "Password reset", vars: ["url", "brand"], subject: "Reset your {{brand}} password", body: "Someone requested a password reset for your {{brand}} account.\n\nReset it here (valid 1 hour):\n{{url}}\n\nIf this wasn't you, ignore this email." },
  "order.status": { label: "Order status changed", vars: ["title", "status", "note", "url", "brand"], subject: "Order update: {{title}}", body: "Your order \"{{title}}\" is now: {{status}}.\n\n{{note}}\n\nTrack it: {{url}}\n\n— {{brand}}" },
  "order.delivered": { label: "Order delivered", vars: ["title", "url", "days", "brand"], subject: "Delivered: {{title}}", body: "Good news — your order \"{{title}}\" has been delivered.\n\nReview it and accept or request a revision: {{url}}\n\nIf we don't hear from you, the order completes automatically after {{days}} days.\n\n— {{brand}}" },
  "order.completed": { label: "Order completed", vars: ["title", "url", "brand"], subject: "Completed: {{title}}", body: "Your order \"{{title}}\" is complete. Thank you for working with {{brand}}!\n\n{{url}}" },
  "order.message": { label: "New order message", vars: ["title", "body", "url", "brand"], subject: "New message on order: {{title}}", body: "{{body}}\n\nReply: {{url}}" },
  "order.refunded": { label: "Order refunded", vars: ["title", "amount", "brand"], subject: "Refund issued: {{title}}", body: "We've issued a refund of {{amount}} for \"{{title}}\". It can take 5–10 business days to appear.\n\n— {{brand}}" },
  "form.notify": { label: "Form submission (to team)", vars: ["form", "fields", "brand"], subject: "[{{brand}}] New {{form}} submission", body: "{{fields}}" },
};
export const fill = (t: string, v: Record<string, string | number | undefined>) => t.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => String(v[k] ?? ""));
export async function renderEmail(key: string, vars: Record<string, string | number | undefined>, locale = "en") {
  const def = EMAILS[key]; let subject = def?.subject || key, body = def?.body || "";
  try { const { db, dbReady } = await import("./db"); if (dbReady()) {
    const rows = await db.emailTemplate.findMany({ where: { key, locale: { in: [locale, "en"] }, enabled: true } });
    const t = rows.find(r => r.locale === locale) || rows.find(r => r.locale === "en"); if (t) { subject = t.subject; body = t.body; } } } catch { /* defaults */ }
  let brand = "Stag Prime"; try { brand = (await (await import("./settings")).getSettings()).brand.name; } catch { /* default */ }
  const v = { brand, ...vars }; return { subject: fill(subject, v), body: fill(body, v).replace(/\n{3,}/g, "\n\n") };
}
export async function sendEmail(key: string, to: string, vars: Record<string, string | number | undefined>, locale = "en") { const m = await renderEmail(key, vars, locale); return deliverMail(to, m.subject, m.body); }
