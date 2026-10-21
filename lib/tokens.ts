import crypto from "crypto";
import { db } from "./db";
import { sendEmail } from "./email";
const SITE = () => process.env.NEXT_PUBLIC_SITE_URL || "https://www.stagprime.com";
export async function sendToken(email: string, purpose: "verify" | "reset", locale = "en") {
  const token = crypto.randomBytes(32).toString("hex"); const hash = crypto.createHash("sha256").update(token).digest("hex");
  await db.verificationToken.deleteMany({ where: { identifier: email, purpose } });
  await db.verificationToken.create({ data: { identifier: email, token: hash, purpose, expires: new Date(Date.now() + (purpose === "verify" ? 24 : 1) * 3600_000) } });
  const url = `${SITE()}/${locale}/${purpose === "verify" ? "account/verify" : "account/reset"}?token=${token}&email=${encodeURIComponent(email)}`;
  return sendEmail(purpose === "verify" ? "auth.verify" : "auth.reset", email, { url }, locale);
}
export async function useToken(email: string, token: string, purpose: "verify" | "reset") {
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const t = await db.verificationToken.findFirst({ where: { identifier: email, token: hash, purpose } });
  if (!t || t.expires < new Date()) return false;
  await db.verificationToken.deleteMany({ where: { identifier: email, purpose } }); return true;
}
