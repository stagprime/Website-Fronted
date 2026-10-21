import { revalidatePath } from "next/cache";
import { db, dbReady } from "./db";
/** Flip due scheduled posts to published (reads already treat them as live; this keeps status/listing accurate + revalidates). */
export async function publishScheduled() {
  if (!dbReady()) return 0;
  const due = await db.blogPost.findMany({ where: { status: "scheduled", publishAt: { lte: new Date() } }, select: { id: true, slug: true, locale: true } });
  if (!due.length) return 0;
  await db.blogPost.updateMany({ where: { id: { in: due.map(d => d.id) } }, data: { status: "published" } });
  if (due.length) { revalidatePath("/llms.txt"); revalidatePath("/llms-full.txt"); }
  for (const d of due) { revalidatePath(`/${d.locale}/blog`); revalidatePath(`/${d.locale}/blog/${d.slug}`); }
  return due.length;
}
