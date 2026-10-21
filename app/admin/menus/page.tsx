import { PageHeader } from "@/components/admin/kit";
import { SettingTabs } from "@/components/admin/SettingEditor";
export const metadata = { title: "Menus" };
export default function Page() {
  return <><PageHeader title={"Menus"} sub={"Header mega menu and footer. Changes go live immediately for every locale."} /><SettingTabs tabs={[["nav", "Header mega menu"], ["footer", "Footer"], ["socials", "Social links"]]} /></>;
}
