import PageBuilder from "@/components/admin/PageBuilder";
export const metadata = { title: "Page builder" };
export default async function Page({ searchParams }: { searchParams: Promise<{ key?: string }> }) { return <PageBuilder pageKey={(await searchParams).key || "home"} />; }
