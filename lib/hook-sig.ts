/** Shared-secret helpers for the CMS → website hooks (revalidate webhook, signed draft preview). Secret: REVALIDATE_SECRET (same value in both projects). */
import crypto from "crypto";
export const hookSecret = () => process.env.REVALIDATE_SECRET || "";
export function sameSecret(given: string) { const s = hookSecret(); if (s.length < 32 || given.length !== s.length) return false; return crypto.timingSafeEqual(Buffer.from(given), Buffer.from(s)); }
export const sign = (payload: string) => crypto.createHmac("sha256", hookSecret()).update(payload).digest("base64url");
export function verifySig(payload: string, sig: string) { if (hookSecret().length < 32) return false; const want = sign(payload); return sig.length === want.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want)); }
