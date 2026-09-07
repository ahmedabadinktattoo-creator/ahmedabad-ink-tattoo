"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { trackAnalytics, trackClarity, trackMeta } from "@/lib/tracking";

type ConsentChoice = "all" | "analytics" | "essential";
const storageKey = "ait_tracking_consent_v1";

export function ConsentManager({ googleAnalyticsId, googleTagManagerId, metaPixelId, clarityProjectId }: { googleAnalyticsId?: string; googleTagManagerId?: string; metaPixelId: string; clarityProjectId?: string }) {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [editing, setEditing] = useState(false);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
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
    const openSettings = () => setEditing(true);
    const syncConsent = (event: Event) => {
      const detail = (event as CustomEvent<ConsentChoice>).detail;
      if (detail === "all" || detail === "analytics" || detail === "essential") setChoice(detail);
    };
    window.addEventListener("ait:open-privacy-settings", openSettings);
    window.addEventListener("ait:tracking-consent-changed", syncConsent);
    return () => {
      window.removeEventListener("ait:open-privacy-settings", openSettings);
      window.removeEventListener("ait:tracking-consent-changed", syncConsent);
    };
  }, []);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      if (analyticsAllowed) trackAnalytics("page_view", { page_path: pathname });
      if (marketingAllowed) trackMeta("PageView");
      previousPathname.current = pathname;
    }
  }, [analyticsAllowed, marketingAllowed, pathname]);

  useEffect(() => {
    function recordContact(event: MouseEvent) {
      const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const href = link.href;
      if (href.startsWith("tel:")) {
        if (analyticsAllowed) trackAnalytics("contact_phone", { method: "phone" });
        if (marketingAllowed) trackMeta("Contact", { contact_method: "phone" });
        trackClarity("phone_click");
      } else if (href.includes("wa.me/")) {
        if (analyticsAllowed) trackAnalytics("contact_whatsapp", { method: "whatsapp" });
        if (marketingAllowed) trackMeta("Contact", { contact_method: "whatsapp" });
        trackClarity("whatsapp_click");
      } else if (href.includes("maps.app.goo.gl") || href.includes("google.com/maps")) {
        if (analyticsAllowed) trackAnalytics("location_click", { method: "google_maps" });
        trackClarity("google_maps_click");
      }
    }
    document.addEventListener("click", recordContact);
    return () => document.removeEventListener("click", recordContact);
  }, [analyticsAllowed, marketingAllowed]);

  function save(next: ConsentChoice) {
    setChoice(next);
    setEditing(false);
    try {
      window.localStorage.setItem(storageKey, next);
    } catch {
      // The choice still applies for this visit when storage is unavailable.
    }
    window.dispatchEvent(new CustomEvent("ait:tracking-consent-changed", { detail: next }));

    const removesLoadedTracking = choice === "all" && next !== "all"
      || choice === "analytics" && next === "essential";
    if (removesLoadedTracking) window.setTimeout(() => window.location.reload(), 100);
  }

  return <>
    {analyticsAllowed && googleTagManagerId && <>
      <Script id="ait-google-tag-manager" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${googleTagManagerId}');`}</Script>
    </>}
    {analyticsAllowed && googleAnalyticsId && <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} strategy="afterInteractive" />
      <Script id="ait-google-analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('consent','default',{analytics_storage:'granted',ad_storage:'${marketingAllowed ? "granted" : "denied"}',ad_user_data:'${marketingAllowed ? "granted" : "denied"}',ad_personalization:'${marketingAllowed ? "granted" : "denied"}'});gtag('js',new Date());gtag('config','${googleAnalyticsId}',{anonymize_ip:true});`}</Script>
    </>}
    {marketingAllowed && <Script id="ait-meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}</Script>}
    {analyticsAllowed && clarityProjectId && <Script id="ait-microsoft-clarity" strategy="lazyOnload">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,'clarity','script','${clarityProjectId}');clarity('consentv2',{ad_Storage:'${marketingAllowed ? "granted" : "denied"}',analytics_Storage:'granted'});`}</Script>}
    {ready && editing && <aside className="consent-banner" aria-label="Privacy choices">
      <div><p className="eyebrow gold-text">Your privacy</p><h2>You choose what we measure.</h2><p>Essential storage keeps the website working. Optional analytics helps us improve the experience, and marketing measurement tells us which ads lead to genuine enquiries. With marketing permission, we may send hashed contact identifiers for conversion matching. We never send your tattoo idea, medical or screening details, reference images, or raw contact details to advertising platforms. <Link href="/privacy">Privacy policy</Link></p></div>
      <div className="consent-actions"><button className="button gold" type="button" onClick={() => save("all")}>Accept</button><button className="button outline" type="button" onClick={() => save("essential")}>Reject optional</button></div>
    </aside>}
  </>;
}
