import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendToken, useToken } from "@/lib/tokens";
import { limit } from "@/lib/ratelimit";
import { sameOrigin } from "@/lib/guard";
import { auth } from "@/auth";
const E = (error: string, status = 422) => NextResponse.json({ ok: false, error }, { status });
const okEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
export async function POST(req: Request) {
  if (!sameOrigin(req)) return E("Invalid origin.", 403);
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0];
  if (!limit(`acct:${ip}`, 12, 15 * 60_000)) return E("Too many attempts. Try again in a few minutes.", 429);
  let b: Record<string, string> = {}; try { b = await req.json(); } catch { return E("Invalid request.", 400); }
  if (b.website) return NextResponse.json({ ok: true });
  const email = String(b.email || "").toLowerCase().trim(); const locale = /^[a-z]{2}$/.test(b.locale || "") ? b.locale : "en";
  try {
    switch (b.action) {
      case "register": {
        if (!okEmail(email)) return E("Please enter a valid email address.");
        if (String(b.password || "").length < 8) return E("Password must be at least 8 characters.");
        if (b.password !== b.confirm) return E("Passwords do not match.");
        const ex = await db.user.findUnique({ where: { email } });
        if (ex?.passwordHash) { if (!ex.emailVerified) await sendToken(email, "verify", locale); return NextResponse.json({ ok: true }); } // no account enumeration
        const passwordHash = await bcrypt.hash(String(b.password), 12);
        if (ex) await db.user.update({ where: { email }, data: { passwordHash, name: ex.name || b.name } });
        else await db.user.create({ data: { email, name: String(b.name || "").slice(0, 120) || null, passwordHash, locale } });
        await db.order.updateMany({ where: { email, userId: null }, data: { userId: (await db.user.findUnique({ where: { email } }))!.id } });
        await sendToken(email, "verify", locale); return NextResponse.json({ ok: true });
      }
      case "verify": { if (!(await useToken(email, String(b.token || ""), "verify"))) return E("This link is invalid or has expired."); await db.user.update({ where: { email }, data: { emailVerified: new Date() } }); return NextResponse.json({ ok: true }); }
      case "resend": { const u = await db.user.findUnique({ where: { email } }); if (u && !u.emailVerified) await sendToken(email, "verify", locale); return NextResponse.json({ ok: true }); }
      case "forgot": { const u = await db.user.findUnique({ where: { email } }); if (u) await sendToken(email, "reset", locale); return NextResponse.json({ ok: true }); }
      case "reset": {
        if (String(b.password || "").length < 8) return E("Password must be at least 8 characters.");
        if (!(await useToken(email, String(b.token || ""), "reset"))) return E("This link is invalid or has expired.");
        await db.user.update({ where: { email }, data: { passwordHash: await bcrypt.hash(String(b.password), 12), emailVerified: new Date() } }); return NextResponse.json({ ok: true });
      }
      case "profile": {
        const s = await auth(); if (!s?.user) return E("Please log in.", 401);
        await db.user.update({ where: { id: s.user.id }, data: { name: String(b.name || "").slice(0, 120), locale } }); return NextResponse.json({ ok: true });
      }
    }
  } catch (e) { console.error("[account]", (e as Error).message); return E("Service temporarily unavailable. Please try again.", 503); }
  return E("Unknown action.", 400);
}
