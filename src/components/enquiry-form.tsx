"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { captureMarketingAttribution, grantMarketingConsent, hasMarketingConsent } from "@/lib/attribution";
import { trackEnquiryLead } from "@/lib/tracking";
import { studioLinks } from "@/data/links";
import { consultationSlots, indiaDate, slotLabel, validatePreferredSlot } from "@/lib/consultation-slots";

const initialState = { name: "", email: "", phone: "", style: "", placement: "", size: "", idea: "", website: "", marketingConsent: false, preferredDate: "", preferredTime: "" };

export function EnquiryForm() {
  const [values, setValues] = useState(initialState);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "saved" | "error">("idle");
  const startedAt = useRef(Date.now());
  const sending = useRef(false);
  const [reference, setReference] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [requestedSlot, setRequestedSlot] = useState("");
  const [clock, setClock] = useState<number | null>(null);
  useEffect(() => {
    setClock(Date.now());
    const timer = setInterval(() => setClock(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const slotError = validatePreferredSlot(values.preferredDate, values.preferredTime);
    if (slotError) { setErrorMessage(slotError); setStatus("error"); return; }
    sending.current = true;
    setStatus("sending");
    try {
      const eventId = crypto.randomUUID();
      const marketingConsent = values.marketingConsent || hasMarketingConsent();
      if (values.marketingConsent) grantMarketingConsent();
      const attribution = captureMarketingAttribution(marketingConsent);
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, marketingConsent, attribution, eventId, startedAt: startedAt.current }) });
      const result = await response.json() as { error?: string; saved?: boolean; notified?: boolean; reference?: string; eventId?: string };
      if (!response.ok) throw new Error(result.error ?? "Enquiry could not be sent.");
      if (!result.saved || !result.reference) throw new Error("Enquiry was not confirmed as saved.");
      setReference(result.reference);
      setRequestedSlot(values.preferredDate ? `${values.preferredDate} at ${slotLabel(values.preferredTime)} IST` : "");
      setValues(initialState);
      startedAt.current = Date.now();
      setStatus(result.notified ? "sent" : "saved");
      // Measurement must never turn a successfully saved enquiry into an error.
      try { trackEnquiryLead(result.reference, result.eventId ?? eventId); } catch { /* Keep the saved confirmation. */ }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Please try again.");
      setStatus("error");
    } finally {
      sending.current = false;
    }
  }

  if (status === "sent" || status === "saved") return <div className="enquiry-form booking-confirmation" role="status" data-clarity-mask="true">
    <p className="eyebrow gold-text">Request received</p>
    <h3>Thank you. Your idea is with us.</h3>
    <p>Your reference: <strong>{reference}</strong></p>
    {requestedSlot && <p>Requested consultation: <strong>{requestedSlot}</strong><br />This time is not reserved yet. Our team will confirm availability by email or WhatsApp.</p>}
    <p>{status === "sent" ? "A confirmation email has been requested. Please check your inbox and spam folder." : "Your request is saved, but we couldn’t send the email notification. You do not need to submit again."}</p>
    <ol><li>Our studio team reviews your idea and service request.</li><li>We contact you by email or WhatsApp to discuss the details.</li><li>We agree a date and confirm your appointment with you.</li></ol>
    <p>Have a reference photo? Send it on WhatsApp with your enquiry reference.</p>
    <a className="button whatsapp-button" href={`https://wa.me/918866848681?text=${encodeURIComponent(`Hi Ahmedabad Ink Tattoo, my enquiry reference is ${reference}. I would like to share a reference photo or discuss my consultation.`)}`} target="_blank" rel="noreferrer">Continue on WhatsApp</a>
  </div>;

  return <form className="enquiry-form" data-clarity-mask="true" onSubmit={submit}>
    <label className="form-honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => setValues({ ...values, website: event.target.value })} /></label>
    <div className="form-grid">
      <label>Preferred consultation date (optional)<input type="date" min={clock === null ? undefined : indiaDate(clock)} max={clock === null ? undefined : indiaDate(clock + 90 * 86400_000)} value={values.preferredDate} onChange={(event) => setValues({ ...values, preferredDate: event.target.value, preferredTime: "" })} aria-describedby="slot-help" /></label>
      <label>Preferred time (IST)<select required={Boolean(values.preferredDate)} disabled={!values.preferredDate} value={values.preferredTime} onChange={(event) => setValues({ ...values, preferredTime: event.target.value })} aria-describedby="slot-help"><option value="">{values.preferredDate ? "Choose a time" : "Choose a date first"}</option>{consultationSlots.map((time) => <option key={time} value={time} disabled={Boolean(clock !== null && values.preferredDate && validatePreferredSlot(values.preferredDate, time, clock))}>{slotLabel(time)}</option>)}</select></label>
      <p className="wide" id="slot-help">Open daily, 10 AM–10 PM. Select your preferred consultation start time, or leave the date blank if you’re flexible. Times are requests, not live availability; our team will confirm before your visit.</p>
      <label>Full name<input required minLength={2} maxLength={80} value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} autoComplete="name" /></label>
      <label>Email<input required type="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} autoComplete="email" /></label>
      <label>Phone / WhatsApp<input required type="tel" minLength={8} maxLength={24} placeholder="The best number to reach you" value={values.phone} onChange={(event) => setValues({ ...values, phone: event.target.value })} autoComplete="tel" /></label>
      <label>Style / Service<select required value={values.style} onChange={(event) => setValues({ ...values, style: event.target.value })}><option value="">Choose what you need</option><option>Fine Line</option><option>Realism</option><option>Mandala</option><option>Portrait</option><option>Geometric</option><option>Minimal</option><option>Blackwork</option><option>Cover Up</option><option>Body Piercing</option><option>Tattoo Removal</option><option>Not sure yet</option></select></label>
      <label>Placement<input required maxLength={80} placeholder="e.g. forearm, ear or existing tattoo area" value={values.placement} onChange={(event) => setValues({ ...values, placement: event.target.value })} /></label>
      <label>Approximate size<input required maxLength={80} placeholder="e.g. 10 cm or palm-sized" value={values.size} onChange={(event) => setValues({ ...values, size: event.target.value })} /></label>
      <label className="wide">Tell us what you have in mind<textarea required minLength={10} maxLength={1500} rows={5} placeholder="Share the meaning, mood, elements or result you want. It is completely fine if you are not sure yet—we will help you shape the idea." value={values.idea} onChange={(event) => setValues({ ...values, idea: event.target.value })} /></label>
    </div>
    <label className="consent"><input type="checkbox" checked={values.marketingConsent} onChange={(event) => setValues({ ...values, marketingConsent: event.target.checked })} /> <span>Optional: allow advertising measurement so we can understand which campaign led to this enquiry. We never send your tattoo idea, medical information or screening answers to advertising platforms.</span></label>
    <div className="enquiry-form-footer"><p>Private enquiry · No payment required to send. Your appointment is confirmed only after speaking with our team.</p><button className="button gold" disabled={status === "sending"}>{status === "sending" ? "Sending your request…" : "Request my consultation"}</button></div>
    {status === "error" && <p className="form-error-message" role="alert">{errorMessage} Your details are still here. You can also <a href={studioLinks.whatsapp} target="_blank" rel="noreferrer">message us on WhatsApp</a> or <a href={studioLinks.phone}>call the studio</a>.</p>}
  </form>;
}
