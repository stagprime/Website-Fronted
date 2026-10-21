import UI from "./ui";
export const metadata = { title: "Customer" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <UI id={(await params).id} />; }
