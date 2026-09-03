"use client";

import { useEffect, useMemo, useState } from "react";
import { artists, portfolioCategories } from "@/data/studio";
import { bookingTimes } from "@/lib/bookings";
import { trackAnalytics, trackClarity, trackMeta } from "@/lib/tracking";

type RazorpayResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type RazorpayOptions = { key: string; amount: number; currency: string; name: string; description: string; order_id: string; prefill: { name: string; email: string; contact: string }; theme: { color: string }; handler: (response: RazorpayResponse) => void; modal: { ondismiss: () => void } };
declare global { interface Window { Razorpay?: new (options: RazorpayOptions) => { open: () => void } } }

const stepLabels = ["Artist", "Tattoo", "Reference", "Schedule", "Details", "Deposit"];
const styles = portfolioCategories.filter((style) => style !== "All");

function buildDates() {
  const days: { value: string; day: string; date: string; month: string }[] = [];
  for (let offset = 1; days.length < 14 && offset < 24; offset += 1) {
    const date = new Date(); date.setDate(date.getDate() + offset);
    if (date.getDay() === 1) continue;
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    days.push({ value, day: date.toLocaleDateString("en-IN", { weekday: "short" }), date: String(date.getDate()), month: date.toLocaleDateString("en-IN", { month: "short" }) });
  }
  return days;
}

async function loadRazorpay() {
  if (window.Razorpay) return true;
  return await new Promise<boolean>((resolve) => { const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.async = true; script.onload = () => resolve(true); script.onerror = () => resolve(false); document.body.appendChild(script); });
}

export function BookingWizard({ initialArtist = "" }: { initialArtist?: string }) {
  const [step, setStep] = useState(0); const [artist, setArtist] = useState(initialArtist); const [style, setStyle] = useState("");
  const [date, setDate] = useState(""); const [time, setTime] = useState(""); const [dates, setDates] = useState<ReturnType<typeof buildDates>>([]);
  const [available, setAvailable] = useState<readonly string[]>(bookingTimes); const [loadingSlots, setLoadingSlots] = useState(false);
  const [referencePreview, setReferencePreview] = useState(""); const [referenceName, setReferenceName] = useState("");
  const [submitting, setSubmitting] = useState(false); const [error, setError] = useState(""); const [confirmation, setConfirmation] = useState<{ reference: string; demo: boolean } | null>(null);
  const progress = `${((step + 1) / stepLabels.length) * 100}%`;

  useEffect(() => setDates(buildDates()), []);
  useEffect(() => () => { if (referencePreview) URL.revokeObjectURL(referencePreview); }, [referencePreview]);
  useEffect(() => {
    if (!artist || !date) return;
    const controller = new AbortController(); setLoadingSlots(true); setTime("");
    fetch(`/api/availability?artist=${encodeURIComponent(artist)}&date=${date}`, { signal: controller.signal }).then((response) => response.json()).then((data: { slots?: string[] }) => setAvailable(data.slots ?? [])).catch(() => setAvailable([])).finally(() => setLoadingSlots(false));
    return () => controller.abort();
  }, [artist, date]);

  const canContinue = useMemo(() => step === 0 ? Boolean(artist) : step === 1 ? Boolean(style) : step === 3 ? Boolean(date && time) : true, [step, artist, style, date, time]);

  function continueToNextStep(form: HTMLFormElement | null) {
    const activeFieldset = form?.querySelector<HTMLFieldSetElement>("fieldset:not([hidden])");
    const invalidControl = activeFieldset?.querySelector<HTMLInputElement | HTMLTextAreaElement>("input:invalid, textarea:invalid");
    if (invalidControl) { invalidControl.reportValidity(); return; }
    const nextStep = Math.min(step + 1, 5);
    trackAnalytics("booking_step_completed", { step: step + 1, step_name: stepLabels[step] });
    setStep(nextStep);
  }

  function previewReference(file: File | undefined) {
    if (referencePreview) URL.revokeObjectURL(referencePreview);
    if (!file) { setReferencePreview(""); setReferenceName(""); return; }
    setReferencePreview(URL.createObjectURL(file)); setReferenceName(file.name);
    trackAnalytics("booking_reference_selected", { file_type: file.type, file_size_kb: Math.round(file.size / 1024) });
  }

  async function submit(form: HTMLFormElement) {
    setSubmitting(true); setError("");
    trackAnalytics("booking_checkout_started", { artist, tattoo_style: style });
    trackMeta("InitiateCheckout");
    trackClarity("booking_checkout_started");
    try {
      const formData = new FormData(form); formData.set("artistSlug", artist); formData.set("style", style); formData.set("appointmentDate", date); formData.set("appointmentTime", time);
      const response = await fetch("/api/bookings", { method: "POST", body: formData });
      const result = await response.json() as { error?: string; demo?: boolean; bookingId?: string; reference?: string; amount?: number; currency?: string; orderId?: string; keyId?: string };
      if (!response.ok || result.error) throw new Error(result.error ?? "Your booking could not be created.");
      if (result.demo && result.reference) { setConfirmation({ reference: result.reference, demo: true }); trackAnalytics("booking_demo_completed"); return; }
      const loaded = await loadRazorpay(); if (!loaded || !window.Razorpay || !result.orderId || !result.keyId || !result.bookingId) throw new Error("Secure checkout could not be loaded.");
      const checkout = new window.Razorpay({ key: result.keyId, amount: result.amount ?? 0, currency: result.currency ?? "INR", name: "Ahmedabad Ink Tattoo", description: "Consultation deposit", order_id: result.orderId, prefill: { name: String(formData.get("name")), email: String(formData.get("email")), contact: String(formData.get("phone")) }, theme: { color: "#c7a461" }, modal: { ondismiss: () => setSubmitting(false) }, handler: async (payment) => {
        const verification = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId: result.bookingId, ...payment }) });
        const verified = await verification.json() as { error?: string; reference?: string }; if (!verification.ok) { setError(verified.error ?? "Payment verification failed."); setSubmitting(false); return; }
        setConfirmation({ reference: verified.reference ?? result.reference ?? "", demo: false });
        trackAnalytics("purchase", { transaction_id: result.bookingId ?? "confirmed-booking", value: (result.amount ?? 0) / 100, currency: result.currency ?? "INR" });
        trackMeta("Purchase", { value: (result.amount ?? 0) / 100, currency: result.currency ?? "INR" });
        trackClarity("booking_confirmed");
      } }); checkout.open();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Something went wrong."); setSubmitting(false); }
  }

  if (confirmation) return <div className="booking-confirmed"><span className="confirmation-mark">✓</span><p className="eyebrow gold-text">{confirmation.demo ? "Preview complete" : "Consultation confirmed"}</p><h2>Your story starts here.</h2><p>Your booking reference is <strong>{confirmation.reference}</strong>.</p><p>{confirmation.demo ? "This is demo mode. Add the production credentials in .env.local to save bookings, collect deposits and send confirmations." : "We’ve sent your appointment details by email and will be in touch if we need anything else."}</p><a className="button gold" href="/portfolio">Explore the portfolio</a></div>;

  return (
    <form className="booking-wizard" data-clarity-mask="true" onSubmit={(event) => { event.preventDefault(); void submit(event.currentTarget); }}>
      <div className="wizard-progress"><div className="progress-track"><span style={{ width: progress }} /></div><p>Step {step + 1} of {stepLabels.length} · {stepLabels[step]}</p></div>
      <div className="wizard-stage">
        <fieldset hidden={step !== 0}><legend>Who would you like to work with?</legend><p className="field-intro">Choose an artist, or select “Studio recommendation” and we’ll match your idea.</p><div className="choice-grid artist-choices"><button type="button" className={artist === "studio" ? "chosen" : ""} onClick={() => setArtist("studio")}>Studio recommendation<span>We’ll find your best fit</span></button>{artists.map((item) => <button type="button" className={artist === item.slug ? "chosen" : ""} onClick={() => setArtist(item.slug)} key={item.slug}>{item.name}<span>{item.specialties.slice(0, 2).join(" · ")}</span></button>)}</div></fieldset>
        <fieldset hidden={step !== 1}><legend>What style speaks to you?</legend><p className="field-intro">This helps us understand the visual direction. It doesn’t lock your final design.</p><div className="choice-grid style-choices">{styles.map((item) => <button type="button" className={style === item ? "chosen" : ""} onClick={() => setStyle(item)} key={item}>{item}</button>)}</div></fieldset>
        <fieldset hidden={step !== 2}><legend>Show us the feeling.</legend><p className="field-intro">Upload one optional visual reference. We use it to understand direction—not to copy another artist’s work.</p><label className={referencePreview ? "upload-field has-preview" : "upload-field"}><input name="reference" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => previewReference(event.target.files?.[0])} />{referencePreview ? <><span className="reference-preview" role="img" aria-label={`Selected reference: ${referenceName}`} style={{ backgroundImage: `url(${referencePreview})` }} /><strong>{referenceName}</strong><small>Tap to choose a different image</small></> : <><span className="upload-icon">↑</span><strong>Choose a reference image</strong><small>JPG, PNG or WebP · Up to 8 MB</small></>}</label>{referencePreview && <button type="button" className="remove-reference" onClick={() => { const input = document.querySelector<HTMLInputElement>('input[name="reference"]'); if (input) input.value = ""; previewReference(undefined); }}>Remove reference</button>}</fieldset>
        <fieldset hidden={step !== 3}><legend>Choose a consultation.</legend><p className="field-intro">Studio consultations are approximately 30 minutes. Mondays are reserved for studio work.</p><div className="date-strip">{dates.map((item) => <button type="button" className={date === item.value ? "chosen" : ""} onClick={() => setDate(item.value)} key={item.value}><span>{item.day}</span><strong>{item.date}</strong><small>{item.month}</small></button>)}</div>{date && <div className="time-grid">{loadingSlots ? <p>Checking availability…</p> : bookingTimes.map((item) => <button type="button" disabled={!available.includes(item)} className={time === item ? "chosen" : ""} onClick={() => setTime(item)} key={item}>{formatTime(item)}</button>)}</div>}</fieldset>
        <fieldset hidden={step !== 4}><legend>Tell us about you and the idea.</legend><div className="form-grid"><label>Full name<input name="name" required minLength={2} maxLength={80} autoComplete="name" /></label><label>Email<input name="email" required type="email" autoComplete="email" /></label><label>Phone / WhatsApp<input name="phone" required type="tel" autoComplete="tel" placeholder="+91" /></label><label>Placement<input name="placement" required placeholder="e.g. inner forearm" /></label><label>Approximate size<input name="size" required placeholder="e.g. 12 cm" /></label><label className="wide">Your idea<textarea name="idea" required minLength={10} maxLength={1500} rows={5} placeholder="Meaning, composition, elements, mood…" /></label></div></fieldset>
        <fieldset hidden={step !== 5}><legend>Reserve your time.</legend><p className="field-intro">A ₹1,000 deposit confirms your consultation and is credited toward your tattoo. It is non-refundable but may be moved once with 48 hours’ notice.</p><div className="booking-summary"><div><span>Artist</span><strong>{artist === "studio" ? "Studio recommendation" : artists.find((item) => item.slug === artist)?.name}</strong></div><div><span>Style</span><strong>{style}</strong></div><div><span>Date</span><strong>{date} · {formatTime(time)}</strong></div><div><span>Reference</span><strong>{referenceName || "None"}</strong></div><div><span>Deposit</span><strong>₹1,000</strong></div></div><label className="consent"><input type="checkbox" required /> <span>I understand the deposit and rescheduling policy and consent to Ahmedabad Ink contacting me about this booking.</span></label></fieldset>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="wizard-actions">{step > 0 && <button className="wizard-back" type="button" disabled={submitting} onClick={() => { setError(""); setStep(step - 1); }}>← Back</button>}<button className="button gold" type={step === 5 ? "submit" : "button"} onClick={step < 5 ? (event) => continueToNextStep(event.currentTarget.form) : undefined} disabled={!canContinue || submitting}>{submitting ? "Opening secure payment…" : step === 5 ? "Pay ₹1,000 deposit" : "Continue →"}</button></div>
    </form>
  );
}

function formatTime(time: string) { if (!time) return ""; const [hour, minute] = time.split(":").map(Number); return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(2020, 0, 1, hour, minute)); }
