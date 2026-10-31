"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { usePathname } from "next/navigation";
// Consent Mode v2 banner + vendor loaders. IDs come from NEXT_PUBLIC_* env; with no IDs nothing loads.
type Cfg = { gtm?: string; ga4?: string; pixel?: string; ads?: string; adsLabels?: Record<string, string>; tiktok?: string; linkedin?: string };
export default function Consent({ cfg, t, policy }: { cfg: Cfg; t: Record<string, string>; policy: string }) {
  const [c, setC] = useState<string | null>(null); const [open, setOpen] = useState(false); const [prefs, setPrefs] = useState({ analytics: true, ads: false });
  const path = usePathname();
  const any = Object.values(cfg).some(v => v && (typeof v === "string" ? v : Object.keys(v).length));
  useEffect(() => { const m = document.cookie.match(/sp_consent=([^;]+)/); setC(m ? decodeURIComponent(m[1]) : ""); const h = () => setOpen(true); addEventListener("sp:consent", h); return () => removeEventListener("sp:consent", h); }, []);
  useEffect(() => { const show = c === "" || open; document.documentElement.classList.toggle("has-consent", show); return () => document.documentElement.classList.remove("has-consent"); }, [c, open]);
  useEffect(() => { if (c) track("PageView", { page_path: path }); }, [c, path]);
  const save = (v: string) => {
    document.cookie = `sp_consent=${encodeURIComponent(v)};path=/;max-age=15552000;samesite=lax`; setC(v); setOpen(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const W = window as any; W.gtag?.("consent", "update", { analytics_storage: v.includes("analytics") ? "granted" : "denied", ad_storage: v.includes("ads") ? "granted" : "denied", ad_user_data: v.includes("ads") ? "granted" : "denied", ad_personalization: v.includes("ads") ? "granted" : "denied" });
  };
  const an = !!c && c.includes("analytics"), ad = !!c && c.includes("ads");
  return (<>
    {any && <Script id="consent-default" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};window.gtag=gtag;gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});window.__spAds=${JSON.stringify(cfg.adsLabels || {})};`}</Script>}
    {cfg.gtm && (an || ad) && <Script id="gtm" strategy="lazyOnload">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${cfg.gtm}');`}</Script>}
    {(cfg.ga4 || cfg.ads) && (an || ad) && <><Script src={`https://www.googletagmanager.com/gtag/js?id=${cfg.ga4 || cfg.ads}`} strategy="lazyOnload" /><Script id="gtag-cfg" strategy="lazyOnload">{`gtag('js',new Date());gtag('consent','update',{analytics_storage:'${an ? "granted" : "denied"}',ad_storage:'${ad ? "granted" : "denied"}',ad_user_data:'${ad ? "granted" : "denied"}',ad_personalization:'${ad ? "granted" : "denied"}'});${cfg.ga4 && an ? `gtag('config','${cfg.ga4}',{send_page_view:false});` : ""}${cfg.ads && ad ? `gtag('config','${cfg.ads}');` : ""}`}</Script></>}
    {cfg.pixel && ad && <Script id="fb" strategy="lazyOnload">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${cfg.pixel}');fbq('track','PageView');`}</Script>}
    {cfg.tiktok && ad && <Script id="tt" strategy="lazyOnload">{`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e){var n="https://analytics.tiktok.com/i18n/pixel/events.js";var a=d.createElement("script");a.async=!0;a.src=n+"?sdkid="+e+"&lib="+t;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(a,s)};ttq.load('${cfg.tiktok}');ttq.page();}(window,document,'ttq');`}</Script>}
    {cfg.linkedin && ad && <Script id="li" strategy="lazyOnload">{`window._linkedin_partner_id="${cfg.linkedin}";(function(l){var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s)})();`}</Script>}
    {(c === "" || open) && (
      <div role="dialog" aria-modal="false" aria-labelledby="ck-t" className="fixed z-[76] bottom-4 start-4 w-[min(92vw,26rem)] rounded-2xl glass shadow-2xl shadow-black/60 p-5">
        <p id="ck-t" className="font-display text-sm font-bold text-white">{t.title}</p>
        <p className="mt-2 text-xs text-slate-300">{t.body} <a href={policy} className="underline text-sky-brand">{t.policy}</a></p>
        {open && <div className="mt-3 space-y-2 text-sm text-slate-200">
          <label className="flex gap-2"><input type="checkbox" checked disabled />{t.necessary}</label>
          <label className="flex gap-2"><input type="checkbox" checked={prefs.analytics} onChange={e => setPrefs({ ...prefs, analytics: e.target.checked })} />{t.analytics}</label>
          <label className="flex gap-2"><input type="checkbox" checked={prefs.ads} onChange={e => setPrefs({ ...prefs, ads: e.target.checked })} />{t.ads}</label></div>}
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => save("necessary,analytics,ads")} className="rounded-full bg-gradient-to-r from-sky-brand to-blue-brand px-4 py-2 text-xs font-semibold text-white">{t.accept}</button>
          <button onClick={() => save("necessary")} className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white">{t.reject}</button>
          {open ? <button onClick={() => save(["necessary", prefs.analytics && "analytics", prefs.ads && "ads"].filter(Boolean).join(","))} className="rounded-full border border-sky-brand/50 px-4 py-2 text-xs font-semibold text-sky-brand">{t.save}</button>
            : <button onClick={() => setOpen(true)} className="rounded-full px-3 py-2 text-xs text-slate-300 underline">{t.customize}</button>}
        </div>
      </div>)}
  </>);
}
