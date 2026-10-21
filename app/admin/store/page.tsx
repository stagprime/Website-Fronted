import { PageHeader } from "@/components/admin/kit";
import { SettingTabs } from "@/components/admin/SettingEditor";
export const metadata = { title: "Store & catalog" };
export default function Page() {
  return <><PageHeader title={"Store & catalog"} sub={"Products, categories, pricing, Sentinel plans, deposits and donations. Prices are read server-side at checkout; run Stripe sync after price changes."} /><SettingTabs tabs={[["products", "Products"], ["storeCats", "Categories"], ["pricing", "Pricing table"], ["sentinelPlans", "Sentinel plans"], ["ventures", "Ventures"], ["deposits", "Deposits"], ["donationTiers", "Donations"], ["stores", "Merch stores"]]} /></>;
}
