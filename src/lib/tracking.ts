type TrackingParameters = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export function trackAnalytics(eventName: string, parameters: TrackingParameters = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", eventName, parameters);
}

export function trackMeta(eventName: string, parameters: TrackingParameters = {}) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", eventName, parameters);
}

export function trackClarity(eventName: string) {
  if (typeof window === "undefined") return;
  window.clarity?.("event", eventName);
}

export function trackEnquiryLead() {
  trackAnalytics("generate_lead", { lead_type: "studio_enquiry" });
  trackMeta("Lead", { lead_type: "studio_enquiry" });
  trackClarity("studio_enquiry_sent");
}
