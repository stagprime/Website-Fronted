import { PageHeader } from "@/components/admin/kit";
import { SettingTabs } from "@/components/admin/SettingEditor";
export const metadata = { title: "Content lists" };
export default function Page() {
  return <><PageHeader title={"Content lists"} sub={"Shared lists used across pages, blocks and the AI chat facts."} /><SettingTabs tabs={[["services", "Services"], ["faqs", "FAQ"], ["process", "Process"], ["homeStats", "Home stats"], ["portfolio", "Portfolio"], ["partners", "Partners"], ["profiles", "Marketplace profiles"], ["team", "Team"], ["founder", "Founder"], ["extended", "Extended services"], ["jobAreas", "Job areas"]]} /></>;
}
