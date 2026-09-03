import Link from "next/link";
import { studioLinks } from "@/data/links";
import { buildMetadata } from "@/lib/seo";
import { EnquiryForm } from "@/components/enquiry-form";

export const metadata = buildMetadata({
  title: "Book a Tattoo Consultation in Ahmedabad",
  description: "Call or WhatsApp Ahmedabad Ink Tattoo in Nikol to discuss your tattoo idea, preferred artist, placement, size and consultation availability.",
  path: "/book",
});

const preparation = [
  ["01", "Your idea", "Share the story, mood or meaning you want the tattoo to carry."],
  ["02", "Placement and size", "Tell us where you want it and the approximate size you have in mind."],
  ["03", "References", "Send inspiration images to explain direction. We create original work rather than direct copies."],
  ["04", "Preferred artist", "Choose Kartik, Sachin or Manish—or let us recommend the right artist for your style."],
] as const;

export default function BookingPage() {
  return (
    <div className="direct-booking-page">
      <header className="direct-booking-hero">
        <p className="eyebrow gold-text">Tattoo consultation · Nikol, Ahmedabad</p>
        <h1>Begin with<br /><em>a conversation.</em></h1>
        <p>Talk directly with our studio team. We’ll understand your idea, recommend the right artist and guide you through the next step—without a complicated online form.</p>
        <div className="direct-booking-actions">
          <a className="button gold" href={studioLinks.phone}>Book on call</a>
          <a className="button whatsapp-button" href={studioLinks.whatsapp} target="_blank" rel="noreferrer">Book on WhatsApp</a>
        </div>
        <p className="booking-phone">Call us at <a href={studioLinks.phone}>{studioLinks.phoneDisplay}</a></p>
      </header>

      <section className="booking-preparation section" aria-labelledby="prepare-title">
        <div className="section-index">Consultation guide</div>
        <div>
          <p className="eyebrow gold-text">Before you contact us</p>
          <h2 id="prepare-title">Four details help us<br /><em>guide you better.</em></h2>
          <div className="booking-preparation-grid">
            {preparation.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="enquiry-section section" aria-labelledby="enquiry-title">
        <div className="section-index">Private studio enquiry</div>
        <div><p className="eyebrow gold-text">A quieter way to begin</p><h2 id="enquiry-title">Share your vision.<br /><em>We’ll guide the rest.</em></h2><p>Not ready for a call? Tell us what you’re imagining—whether it’s a complete concept or only a feeling. Our studio team will personally review your enquiry and reply by email or WhatsApp with honest guidance on the right service, artist, placement and next step. No pressure, no obligation.</p><EnquiryForm /></div>
      </section>

      <section className="booking-visit section-dark">
        <div><p className="eyebrow gold-text">Prefer to visit?</p><h2>Meet us in<br /><em>Nikol.</em></h2></div>
        <div><p>FF/109, Silver Square, opposite Dipak School, near Gangotri Circle Road, Nikol, Ahmedabad, Gujarat 382350.</p><a className="line-link" href={studioLinks.maps} target="_blank" rel="noreferrer">Open Google Maps <span>↗</span></a><Link className="line-link" href="/artists">Meet our artists <span>↗</span></Link></div>
      </section>
    </div>
  );
}
