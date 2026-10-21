import UI from "./ui";
export const metadata = { title: "Edit post" };
export default async function Page({ searchParams }: { searchParams: Promise<{ slug?: string; locale?: string }> }) { const s = await searchParams; return <UI slug={s.slug || ""} locale={s.locale || "en"} />; }
