import { PageHeader } from "@/components/admin/kit";
import { SettingTabs } from "@/components/admin/SettingEditor";
export const metadata = { title: "Gig Studio" };
export default function Page() {
  return <><PageHeader title={"Gig Studio"} sub={"Basic / Standard / Premium packages for every service. Shown on service pages, the packages block and checkout."} /><SettingTabs tabs={[["gigs", "Gigs & packages"]]} /></>;
}
