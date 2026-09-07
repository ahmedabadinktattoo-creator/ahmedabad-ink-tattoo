"use client";

import { FormEvent, useRef, useState } from "react";
import { captureMarketingAttribution, grantMarketingConsent, hasMarketingConsent } from "@/lib/attribution";
import { trackEnquiryLead } from "@/lib/tracking";

const initialState = { name: "", email: "", phone: "", style: "", placement: "", size: "", idea: "", website: "", marketingConsent: false };

export function EnquiryForm() {
  const [values, setValues] = useState(initialState);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "saved" | "error">("idle");
  const startedAt = useRef(Date.now());

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    try {
      const eventId = crypto.randomUUID();
      const marketingConsent = values.marketingConsent || hasMarketingConsent();
      if (values.marketingConsent) grantMarketingConsent();
      const attribution = captureMarketingAttribution(marketingConsent);
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, marketingConsent, attribution, eventId, startedAt: startedAt.current }) });
      const result = await response.json() as { error?: string; notified?: boolean; reference?: string; eventId?: string };
      if (!response.ok) throw new Error(result.error ?? "Enquiry could not be sent.");
      setValues(initialState);
      startedAt.current = Date.now();
      setStatus(result.notified ? "sent" : "saved");
      if (result.reference) trackEnquiryLead(result.reference, result.eventId ?? eventId);
    } catch {
      setStatus("error");
    }
  }

  return <form className="enquiry-form" data-clarity-mask="true" onSubmit={submit}>
    <label className="form-honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => setValues({ ...values, website: event.target.value })} /></label>
    <div className="form-grid">
      <label>Full name<input required minLength={2} maxLength={80} value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} autoComplete="name" /></label>
      <label>Email<input required type="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} autoComplete="email" /></label>
      <label>Phone / WhatsApp<input required type="tel" minLength={8} maxLength={24} placeholder="The best number to reach you" value={values.phone} onChange={(event) => setValues({ ...values, phone: event.target.value })} autoComplete="tel" /></label>
      <label>Style / Service<select required value={values.style} onChange={(event) => setValues({ ...values, style: event.target.value })}><option value="">Choose what you need</option><option>Fine Line</option><option>Realism</option><option>Mandala</option><option>Portrait</option><option>Geometric</option><option>Minimal</option><option>Blackwork</option><option>Cover Up</option><option>Body Piercing</option><option>Tattoo Removal</option><option>Not sure yet</option></select></label>
      <label>Placement<input required maxLength={80} placeholder="e.g. forearm, ear or existing tattoo area" value={values.placement} onChange={(event) => setValues({ ...values, placement: event.target.value })} /></label>
      <label>Approximate size<input required maxLength={80} placeholder="e.g. 10 cm or palm-sized" value={values.size} onChange={(event) => setValues({ ...values, size: event.target.value })} /></label>
      <label className="wide">Tell us what you have in mind<textarea required minLength={10} maxLength={1500} rows={5} placeholder="Share the meaning, mood, elements or result you want. It is completely fine if you are not sure yet—we will help you shape the idea." value={values.idea} onChange={(event) => setValues({ ...values, idea: event.target.value })} /></label>
    </div>
    <label className="consent"><input type="checkbox" checked={values.marketingConsent} onChange={(event) => setValues({ ...values, marketingConsent: event.target.checked })} /> <span>Optional: allow advertising measurement so we can understand which campaign led to this enquiry. We never send your tattoo idea, medical information or screening answers to advertising platforms.</span></label>
    <div className="enquiry-form-footer"><p>Private enquiry · Reviewed personally by our studio team. We use your details only to respond about your request.</p><button className="button gold" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send my idea"}</button></div>
    {status === "sent" && <p className="form-success" role="status">Thank you—your idea is with our studio team. We’ll reply personally by email or WhatsApp soon.</p>}
    {status === "saved" && <p className="form-success" role="status">Thank you—your details are safely saved in our studio dashboard. We’ll reply by email or WhatsApp soon.</p>}
    {status === "error" && <p className="form-error-message" role="alert">We could not send this right now. Please use WhatsApp or call the studio.</p>}
  </form>;
}
