import Link from "next/link";
import "./booking.css";
import { studioLinks } from "@/data/links";
import { buildMetadata } from "@/lib/seo";
import { EnquiryForm } from "@/components/enquiry-form";

export const metadata = buildMetadata({
  title: "Book a Tattoo Consultation in Ahmedabad",
  description: "Request a tattoo, piercing or removal consultation at Ahmedabad Ink Tattoo in Nikol. Send your idea online without signing in, or contact the studio on WhatsApp.",
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
        <h1>Book your <em>consultation.</em></h1>
        <p>Choose a preferred time and share your idea. No login or payment needed. Our team will confirm your appointment personally.</p>
        <p className="booking-phone">{studioLinks.hoursDisplay} · <a href={studioLinks.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a> · <a href={studioLinks.phone}>Call us</a></p>
      </header>

      <section id="enquiry" className="enquiry-section section" aria-labelledby="enquiry-title">
        <div><h2 id="enquiry-title" className="booking-form-title">Your visit. Your idea.</h2><EnquiryForm /></div>
      </section>

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

      <section className="booking-visit section-dark">
        <div><p className="eyebrow gold-text">Prefer to visit?</p><h2>Meet us in<br /><em>Nikol.</em></h2></div>
        <div><p>FF/109, Silver Square, opposite Dipak School, near Gangotri Circle Road, Nikol, Ahmedabad, Gujarat 382350.</p><a className="line-link" href={studioLinks.maps} target="_blank" rel="noreferrer">Open Google Maps <span>↗</span></a><Link className="line-link" href="/artists">Meet our artists <span>↗</span></Link></div>
      </section>
    </div>
  );
}
