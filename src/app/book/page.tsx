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
        <h1>Your next tattoo.<br /><em>Start here.</em></h1>
        <p>Have an idea—or just a question? Request a consultation for tattoos, body piercing or tattoo removal. Tell us a little about what you want and our studio team will guide you personally.</p>
        <div className="direct-booking-actions">
          <a className="button gold" href="#enquiry">Request a consultation</a>
          <a className="button whatsapp-button" href={studioLinks.whatsapp} target="_blank" rel="noreferrer">Chat on WhatsApp</a>
        </div>
        <p className="booking-phone">No login needed · No payment at this step<br />Prefer to call? <a href={studioLinks.phone}>{studioLinks.phoneDisplay}</a></p>
      </header>

      <section id="enquiry" className="enquiry-section section" aria-labelledby="enquiry-title">
        <div className="section-index">Your consultation request</div>
        <div><p className="eyebrow gold-text">One small step towards your idea</p><h2 id="enquiry-title">Tell us your idea.<br /><em>We’ll help shape it.</em></h2><p>Fill in the details below. If you haven’t decided on a style, choose “Not sure yet”. For placement or size, you can also write “Not sure”. We’ll reply by email or WhatsApp.</p><p>This is a consultation request, not a confirmed appointment. We’ll agree the service, quote and available date with you before booking.</p><EnquiryForm /></div>
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
