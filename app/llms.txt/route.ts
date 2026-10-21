import { llms } from "@/lib/llms";
export const revalidate = 3600;
export async function GET() { return new Response(await llms(false), { headers: { "Content-Type": "text/plain; charset=utf-8" } }); }
