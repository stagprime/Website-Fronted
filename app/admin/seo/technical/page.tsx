import { PageHeader } from "@/components/admin/kit";
import { SettingTabs } from "@/components/admin/SettingEditor";
export const metadata = { title: "Schema, robots, sitemap & llms.txt" };
export default function Page() {
  return <><PageHeader title={"Schema, robots, sitemap & llms.txt"} sub={"Technical SEO sources. Previews: /robots.txt, /sitemap.xml, /llms.txt."} /><SettingTabs tabs={[["orgSchema", "Organization schema"], ["robots", "robots.txt"], ["sitemap", "Sitemap"], ["llms", "llms.txt"], ["seoDefaults", "Defaults"]]} /></>;
}
