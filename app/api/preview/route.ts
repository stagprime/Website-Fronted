import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { verifySig } from "@/lib/hook-sig";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Draft preview opened from the CMS: GET ?path=/en/about&exp=<unix ms>&sig=<HMAC(path|exp)> (signed by the CMS, valid 10 min). ?off=1 turns it off. */
export async function GET(req: Request) {
  const u = new URL(req.url); const raw = u.searchParams.get("path") || "/"; const path = raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("\\") ? raw : "/";
  const dm = await draftMode();
  if (u.searchParams.get("off")) { dm.disable(); return NextResponse.redirect(new URL(path, u.origin)); }
  const exp = Number(u.searchParams.get("exp") || 0);
  if (!exp || exp < Date.now() || exp > Date.now() + 15 * 60_000 || !verifySig(`${path}|${exp}`, u.searchParams.get("sig") || "")) return new NextResponse("Forbidden", { status: 403 });
  dm.enable(); return NextResponse.redirect(new URL(path, u.origin));
}
