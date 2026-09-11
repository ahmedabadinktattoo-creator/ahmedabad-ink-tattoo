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
let lastCapturedHref = "";

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
  // A Facebook click ID can also come from an organic link.
  if (url.searchParams.has("fbclid")) return "social";
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

export function hasAnalyticsConsent() {
  if (typeof window === "undefined") return false;
  try {
    return ["all", "analytics"].includes(window.localStorage.getItem(consentStorageKey) ?? "");
  } catch {
    return false;
  }
}

export function clearMarketingAttribution() {
  lastCapturedHref = "";
  try {
    window.localStorage.removeItem(attributionStorageKey);
    window.sessionStorage.removeItem(attributionStorageKey);
  } catch { /* Storage may be unavailable. */ }
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
  if (!marketingConsent && !hasAnalyticsConsent()) {
    clearMarketingAttribution();
    return emptyAttribution();
  }
  const url = new URL(window.location.href);
  let referrer = "";
  try {
    const referringUrl = new URL(document.referrer);
    // Strip query strings; they can contain personal information.
    if (referringUrl.hostname.replace(/^www\./, "") !== url.hostname.replace(/^www\./, "")) {
      referrer = clean(`${referringUrl.origin}${referringUrl.pathname}`, 500);
    }
  } catch { /* Direct visit. */ }
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

  try {
    // Remove the old indefinite store. Attribution now lasts for this tab/session only.
    window.localStorage.removeItem(attributionStorageKey);
    const stored = JSON.parse(window.sessionStorage.getItem(attributionStorageKey) ?? "null") as MarketingAttribution | null;
    const newCampaign = lastCapturedHref !== url.href && Boolean(current.utmSource || current.utmCampaign || current.gclid || current.gbraid || current.wbraid || current.fbclid);
    const externalEntry = !lastCapturedHref && Boolean(referrer);
    const selected = stored && !newCampaign && !externalEntry ? { ...emptyAttribution(), ...stored } : current;
    if (!marketingConsent) Object.assign(selected, { gclid: "", gbraid: "", wbraid: "", fbclid: "" });
    window.sessionStorage.setItem(attributionStorageKey, JSON.stringify(selected));
    lastCapturedHref = url.href;
    return selected;
  } catch {
    // Attribution remains available for this submission when storage is blocked.
  }
  return current;
}

export function emptyAttribution(): MarketingAttribution {
  return { source: "direct", medium: "direct", campaign: "", utmSource: "", utmMedium: "", utmCampaign: "", utmContent: "", utmTerm: "", landingPage: "", referrer: "", gclid: "", gbraid: "", wbraid: "", fbclid: "" };
}
