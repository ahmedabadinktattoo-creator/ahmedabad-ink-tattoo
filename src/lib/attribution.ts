export type MarketingAttribution = {
  source: string;
  medium: string;
  campaign: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  landingPage: string;
  referrer: string;
  gclid: string;
  gbraid: string;
  wbraid: string;
  fbclid: string;
};

const attributionStorageKey = "ait_marketing_attribution_v1";
const consentStorageKey = "ait_tracking_consent_v1";

const clean = (value: string | null | undefined, max = 500) => (value ?? "").trim().slice(0, max);

function sourceFrom(url: URL, referrer: string) {
  const explicit = clean(url.searchParams.get("utm_source"), 100).toLowerCase();
  if (explicit) return explicit;
  if (url.searchParams.has("gclid") || url.searchParams.has("gbraid") || url.searchParams.has("wbraid")) return "google";
  if (url.searchParams.has("fbclid")) return "facebook";
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
    if (host.includes("google.")) return "google";
    if (host.includes("instagram.")) return "instagram";
    if (host.includes("facebook.")) return "facebook";
    if (host.includes("pinterest.")) return "pinterest";
    return host.slice(0, 100);
  } catch {
    return "referral";
  }
}

function mediumFrom(url: URL, source: string, referrer: string) {
  const explicit = clean(url.searchParams.get("utm_medium"), 100).toLowerCase();
  if (explicit) return explicit;
  if (url.searchParams.has("gclid") || url.searchParams.has("gbraid") || url.searchParams.has("wbraid")) return "paid_search";
  if (url.searchParams.has("fbclid")) return "paid_social";
  if (!referrer || source === "direct") return "direct";
  if (source === "google") return "organic_search";
  if (["facebook", "instagram", "pinterest"].includes(source)) return "organic_social";
  return "referral";
}

export function hasMarketingConsent() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(consentStorageKey) === "all";
  } catch {
    return false;
  }
}

export function grantMarketingConsent() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(consentStorageKey, "all");
  } catch {
    // The explicit choice still applies to the current submission.
  }
  window.dispatchEvent(new CustomEvent("ait:tracking-consent-changed", { detail: "all" }));
}

export function captureMarketingAttribution(marketingConsent: boolean): MarketingAttribution {
  if (typeof window === "undefined") return emptyAttribution();
  const url = new URL(window.location.href);
  const referrer = clean(document.referrer, 500);
  const source = sourceFrom(url, referrer);
  const current: MarketingAttribution = {
    source,
    medium: mediumFrom(url, source, referrer),
    campaign: clean(url.searchParams.get("utm_campaign"), 150).toLowerCase(),
    utmSource: clean(url.searchParams.get("utm_source"), 100).toLowerCase(),
    utmMedium: clean(url.searchParams.get("utm_medium"), 100).toLowerCase(),
    utmCampaign: clean(url.searchParams.get("utm_campaign"), 150).toLowerCase(),
    utmContent: clean(url.searchParams.get("utm_content"), 150),
    utmTerm: clean(url.searchParams.get("utm_term"), 150),
    landingPage: clean(`${url.origin}${url.pathname}`, 500),
    referrer,
    gclid: marketingConsent ? clean(url.searchParams.get("gclid"), 250) : "",
    gbraid: marketingConsent ? clean(url.searchParams.get("gbraid"), 250) : "",
    wbraid: marketingConsent ? clean(url.searchParams.get("wbraid"), 250) : "",
    fbclid: marketingConsent ? clean(url.searchParams.get("fbclid"), 250) : "",
  };

  const hasCampaignContext = Boolean(current.utmSource || current.utmCampaign || current.gclid || current.gbraid || current.wbraid || current.fbclid || referrer);
  try {
    const stored = JSON.parse(window.localStorage.getItem(attributionStorageKey) ?? "null") as MarketingAttribution | null;
    if (!hasCampaignContext && stored) return { ...stored, landingPage: current.landingPage };
    window.localStorage.setItem(attributionStorageKey, JSON.stringify(current));
  } catch {
    // Attribution remains available for this submission when storage is blocked.
  }
  return current;
}

export function emptyAttribution(): MarketingAttribution {
  return { source: "direct", medium: "direct", campaign: "", utmSource: "", utmMedium: "", utmCampaign: "", utmContent: "", utmTerm: "", landingPage: "", referrer: "", gclid: "", gbraid: "", wbraid: "", fbclid: "" };
}
