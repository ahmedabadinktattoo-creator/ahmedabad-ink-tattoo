"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { trackAnalytics, trackClarity, trackMeta } from "@/lib/tracking";

type ConsentChoice = "all" | "analytics" | "essential";
const storageKey = "ait_tracking_consent_v1";

export function ConsentManager({ googleAnalyticsId, metaPixelId, clarityProjectId }: { googleAnalyticsId?: string; metaPixelId: string; clarityProjectId?: string }) {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [editing, setEditing] = useState(false);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const analyticsAllowed = choice === "all" || choice === "analytics";
  const marketingAllowed = choice === "all";

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    const initialChoice = saved === "all" || saved === "analytics" || saved === "essential"
      ? saved
      : "essential";
    if (!saved) window.localStorage.setItem(storageKey, initialChoice);
    setChoice(initialChoice);
    setReady(true);
  }, []);

  useEffect(() => {
    if (analyticsAllowed) trackAnalytics("page_view", { page_path: pathname });
    if (marketingAllowed) trackMeta("PageView");
  }, [analyticsAllowed, marketingAllowed, pathname]);

  useEffect(() => {
    function recordContact(event: MouseEvent) {
      const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const href = link.href;
      if (href.startsWith("tel:")) {
        trackAnalytics("contact_click", { method: "phone" });
        trackMeta("Contact", { contact_method: "phone" });
        trackClarity("phone_click");
      } else if (href.includes("wa.me/")) {
        trackAnalytics("contact_click", { method: "whatsapp" });
        trackMeta("Contact", { contact_method: "whatsapp" });
        trackClarity("whatsapp_click");
      } else if (href.includes("maps.app.goo.gl") || href.includes("google.com/maps")) {
        trackAnalytics("location_click", { method: "google_maps" });
        trackClarity("google_maps_click");
      }
    }
    document.addEventListener("click", recordContact);
    return () => document.removeEventListener("click", recordContact);
  }, []);

  function save(next: ConsentChoice) {
    window.localStorage.setItem(storageKey, next);
    if (editing && choice !== next) {
      window.location.reload();
      return;
    }
    setChoice(next);
    setEditing(false);
  }

  return <>
    {analyticsAllowed && googleAnalyticsId && <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} strategy="afterInteractive" />
      <Script id="ait-google-analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${googleAnalyticsId}',{anonymize_ip:true});`}</Script>
    </>}
    {marketingAllowed && <Script id="ait-meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}</Script>}
    {analyticsAllowed && clarityProjectId && <Script id="ait-microsoft-clarity" strategy="lazyOnload">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,'clarity','script','${clarityProjectId}');clarity('consentv2',{ad_Storage:'${marketingAllowed ? "granted" : "denied"}',analytics_Storage:'granted'});`}</Script>}
    {ready && editing && <aside className="consent-banner" aria-label="Privacy choices">
      <div><p className="eyebrow gold-text">Your privacy</p><h2>You choose what we measure.</h2><p>Essential storage keeps the website working. Optional analytics helps us improve the experience, and marketing measurement tells us which ads lead to genuine enquiries. We never send your form answers or contact details to advertising platforms. <Link href="/privacy">Privacy policy</Link></p></div>
      <div className="consent-actions"><button className="button gold" type="button" onClick={() => save("all")}>Accept all</button><button className="button outline" type="button" onClick={() => save("analytics")}>Analytics only</button><button className="consent-essential" type="button" onClick={() => save("essential")}>Essential only</button></div>
    </aside>}
    {ready && !editing && <button className="privacy-settings" type="button" onClick={() => setEditing(true)}>Privacy settings</button>}
  </>;
}
