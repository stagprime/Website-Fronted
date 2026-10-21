import { NextResponse } from "next/server";
import { autoComplete } from "@/lib/orders";
import { publishScheduled } from "@/lib/blog-admin";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
/** Hourly maintenance (call from cron with `Authorization: Bearer $CRON_SECRET`): 3-day auto-complete, scheduled posts. */
export async function GET(req: Request) {
  const sec = process.env.CRON_SECRET; if (!sec || req.headers.get("authorization") !== `Bearer ${sec}`) return NextResponse.json({ ok: false }, { status: 401 });
  const [completed, published] = await Promise.all([autoComplete(), publishScheduled()]);
  return NextResponse.json({ ok: true, completed, published });
}
