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
  window.dataLayer?.push({ event: "ait_event", ait_event_name: eventName, ...parameters });
  window.gtag?.("event", eventName, parameters);
}

export function trackMeta(eventName: string, parameters: TrackingParameters = {}, eventId?: string) {
  if (typeof window === "undefined") return;
  if (eventId) window.fbq?.("track", eventName, parameters, { eventID: eventId });
  else window.fbq?.("track", eventName, parameters);
}

export function trackClarity(eventName: string) {
  if (typeof window === "undefined") return;
  window.clarity?.("event", eventName);
}

export function trackEnquiryLead(reference: string, eventId: string) {
  const parameters = { lead_type: "studio_enquiry", lead_id: reference, event_id: eventId };
  trackAnalytics("generate_lead", parameters);
  trackMeta("Lead", { lead_type: "studio_enquiry", lead_id: reference }, eventId);
  trackClarity("studio_enquiry_sent");
}
