import { PageHeader } from "@/components/admin/kit";
import { SettingTabs } from "@/components/admin/SettingEditor";
export const metadata = { title: "Site settings" };
export default function Page() {
  return <><PageHeader title={"Site settings"} sub={"Operational settings."} /><SettingTabs tabs={[["orders", "Orders"], ["seoDefaults", "SEO defaults"], ["stripePrices", "Stripe price map"]]} /></>;
}
