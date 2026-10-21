import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { requirePerm } from "@/lib/rbac";
export const runtime = "nodejs";
/** GET ?path=/en/about → enable draft preview for this staff member and open the page. ?off=1 turns it off. */
export async function GET(req: Request) {
  const u = new URL(req.url); const path = u.searchParams.get("path") || "/";
  if (!(await requirePerm("content.edit"))) return new Response("Forbidden", { status: 403 });
  const dm = await draftMode(); if (u.searchParams.get("off")) dm.disable(); else dm.enable();
  return NextResponse.redirect(new URL(path.startsWith("/") && !path.startsWith("//") ? path : "/", u.origin));
}
