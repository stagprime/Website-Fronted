import { loadLoc } from "@/lib/loc";
import { seoMeta } from "@/lib/seo";
import { PageHero, Btn } from "@/components/ui";
import { S } from "@/lib/site";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); return { ...await seoMeta("/checkout/cancel", "Checkout cancelled", "Your payment was not completed."), robots: { index: false, follow: false } }; }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { await loadLoc(params); const CONTACT = S().contact;
  return <PageHero kicker="Checkout cancelled" title="No payment was taken." sub="Changed your mind or have a question first? Our team is happy to help on WhatsApp, Telegram or by phone." crumbs={[["Checkout", "/checkout/cancel"]]}>
    <div className="mt-9 flex flex-wrap gap-4"><Btn href="/store">Back to the store →</Btn><Btn href={CONTACT.whatsapp} ghost ext>WhatsApp us</Btn></div></PageHero>;
}
