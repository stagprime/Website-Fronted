import { PageHeader } from "@/components/admin/kit";
import { SettingTabs } from "@/components/admin/SettingEditor";
export const metadata = { title: "Branding & contact" };
export default function Page() {
  return <><PageHeader title={"Branding & contact"} sub={"Name, logos, colors, fonts and contact details. Colors and fonts apply site-wide as CSS variables."} /><SettingTabs tabs={[["brand", "Brand"], ["theme", "Theme & fonts"], ["contact", "Contact & offices"]]} /></>;
}
