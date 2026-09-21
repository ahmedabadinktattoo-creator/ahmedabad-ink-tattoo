import Image from "next/image";
import Link from "next/link";
import { ArtistCard } from "@/components/artist-card";
import { studioLinks } from "@/data/links";
import { artists, portfolio } from "@/data/studio";

const principles = [
  ["01", "Made for one", "Every design begins from a blank page and a real conversation."],
  ["02", "Hygiene, without compromise", "Single-use needles, hospital-grade sterilisation and a calm, immaculate studio."],
  ["03", "Craft that lasts", "Experienced hands, considered placement and clear guidance from consultation to aftercare."],
] as const;

const googleReviews = [
  ["Yash Patel", "The attention to detail and line work are incredible."],
  ["Fenny Patel", "They understood what I wanted and gave their suggestions to make it even better."],
  ["Hardik Rathod", "The studio is extremely clean, hygienic, and professional."],
] as const;

export default function Home() {
  const featured = portfolio.filter((item) => item.featured);

  return (
    <>
      <section className="hero">
        <Image className="hero-image" src="/studio/home-hero.webp" alt="Ahmedabad Ink Tattoo private tattoo room in Nikol" fill priority sizes="100vw" />
        <div className="hero-overlay" />
        <div className="hero-orbit" aria-hidden="true"><span>AHMEDABAD · INK · TATTOO · EST. 2014 · </span></div>
        <div className="hero-content">
          <p className="eyebrow">Premium tattoo studio · Ahmedabad</p>
          <h1>Wear your<br /><em>story.</em></h1>
          <p className="hero-lede">Original art. Experienced hands. A private, considered tattoo experience built around you.</p>
          <div className="button-row"><a className="button gold" href={studioLinks.whatsapp} target="_blank" rel="noreferrer">Book on WhatsApp</a><a className="text-link" href={studioLinks.phone}>Book on call <span>↗</span></a></div>
        </div>
        <p className="hero-side">Custom tattooing · Since 2014</p>
        <a className="scroll-cue" href="#studio">Scroll <span>↓</span></a>
      </section>

      <section className="intro section" id="studio">
        <div className="intro-copy">
          <p className="eyebrow gold-text">A decade in ink</p>
          <h2>Not just a tattoo.<br /><em>A part of you.</em></h2>
          <div className="two-col-copy"><p>Since 2014, Ahmedabad Ink has been a home for thoughtful tattooing. We create work that respects your story, your body and the trust you place in us.</p><p>From the first sketch to the final line, our artists bring technical discipline and human care to every piece—large or small.</p></div>
          <Link className="line-link" href="/artists">Meet the artists <span>↗</span></Link>
        </div>
        <div className="stat"><strong>10+</strong><span>Years of<br />craft</span></div>
      </section>

      <section className="studio-gallery section-dark" aria-labelledby="studio-gallery-title">
        <div className="studio-gallery-heading">
          <div><p className="eyebrow gold-text">Inside Ahmedabad Ink</p><h2 id="studio-gallery-title">A calm space.<br /><em>Made for the work.</em></h2></div>
          <p>Private consultation, dedicated tattoo stations and a welcoming studio in Nikol—photographed exactly as you’ll find it.</p>
        </div>
        <div className="studio-photo-grid">
          <figure className="studio-photo studio-photo-wide"><Image src="/studio/consultation-lounge.webp" alt="Ahmedabad Ink Tattoo consultation lounge in Nikol" fill sizes="(max-width: 700px) 100vw, 66vw" /><figcaption>Consultation lounge</figcaption></figure>
          <figure className="studio-photo studio-photo-tall"><Image src="/studio/studio-entrance.webp" alt="Entrance to Ahmedabad Ink Tattoo studio in Silver Square, Nikol" fill sizes="(max-width: 700px) 100vw, 34vw" /><figcaption>Silver Square, Nikol</figcaption></figure>
          <figure className="studio-photo"><Image src="/studio/tattoo-room.webp" alt="Clean private tattoo room with professional tattoo bed and lighting" fill sizes="(max-width: 700px) 100vw, 50vw" /><figcaption>Dedicated tattoo room</figcaption></figure>
          <figure className="studio-photo"><Image src="/studio/studio-sign.webp" alt="Ahmedabad Ink Tattoo storefront sign at Silver Square in Nikol" fill sizes="(max-width: 700px) 100vw, 33vw" /><figcaption>Ahmedabad Ink storefront</figcaption></figure>
        </div>
      </section>

      <section className="featured section-dark">
        <div className="section-heading"><div><p className="eyebrow gold-text">Selected work</p><h2>Ink with<br /><em>intention.</em></h2></div><Link className="line-link" href="/portfolio">View full portfolio <span>↗</span></Link></div>
        <div className="featured-grid">
          {featured.map((item, index) => <Link href="/portfolio" className={`featured-item feature-${index + 1}`} key={item.id}><Image src={item.image} alt={`${item.title}, ${item.category} tattoo`} fill sizes="(max-width: 700px) 100vw, 34vw" /><div className="card-shade" /><div className="card-copy"><span>{item.category}</span><h3>{item.title}</h3><p>By {item.artist}</p></div></Link>)}
        </div>
      </section>

      <section className="principles section" id="process">
        <div className="principles-main"><p className="eyebrow gold-text">Why Ahmedabad Ink</p><h2>Nothing careless.<br /><em>Nothing copied.</em></h2>
          <div className="principle-list">{principles.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
        </div>
      </section>

      <section className="services-preview section-dark">
        <div className="services-preview-copy">
          <p className="eyebrow gold-text">Created around you</p>
          <h2>From first idea<br /><em>to healed art.</em></h2>
          <p>Custom tattoo design, cover-up planning, fine line work, realism and thoughtful aftercare—handled by one experienced studio team.</p>
          <Link className="line-link" href="/services">Explore services <span>↗</span></Link>
        </div>
        <div className="service-number-list">
          {["Custom tattooing", "Cover-up transformation", "Fine line & minimal", "Realism & portrait", "Aftercare support"].map((service, index) => <Link href="/services" key={service}><span>0{index + 1}</span>{service}<b>↗</b></Link>)}
        </div>
      </section>

      <section className="home-artists section-dark">
        <div className="section-heading"><div><p className="eyebrow gold-text">The artists</p><h2>Different hands.<br /><em>One standard.</em></h2></div><p className="heading-note">Choose the artist whose work feels closest to the idea in your head.</p></div>
        <div className="artist-grid">{artists.map((artist) => <ArtistCard artist={artist} key={artist.slug} />)}</div>
      </section>

      <section className="google-trust section">
        <div className="google-trust-mark" aria-hidden="true">G</div>
        <div><p className="eyebrow gold-text">Google client reviews</p><h2>Real visits.<br /><em>Real experiences.</em></h2><p>Recent five-star words from clients who visited Ahmedabad Ink. Read every published review on our official Google Business Profile.</p></div>
        <div className="google-trust-actions"><a className="button gold" href={studioLinks.googleReviews} target="_blank" rel="noreferrer">Read all Google reviews</a><a className="line-link" href={studioLinks.maps} target="_blank" rel="noreferrer">Find us in Nikol <span>↗</span></a></div>
        <div className="review-topic-grid">
          {googleReviews.map(([name, quote]) => <a href={studioLinks.googleReviews} target="_blank" rel="noreferrer" key={name}><span>5-STAR GOOGLE REVIEW · {name}</span><strong>“{quote}”</strong><small>Read on Google ↗</small></a>)}
        </div>
      </section>

      <section className="booking" id="book">
        <Image src="/studio/tattoo-room.webp" alt="Ahmedabad Ink Tattoo private tattoo room" fill sizes="100vw" />
        <div className="booking-overlay" /><div className="booking-inner"><p className="eyebrow">Your idea starts here</p><h2>Let’s make something<br /><em>worth keeping.</em></h2><p>Tell us what you have in mind. We’ll help with the artist, style, placement and next steps.</p><div className="direct-booking-actions centered"><a className="button gold" href={studioLinks.phone}>Book on call</a><a className="button whatsapp-button" href={studioLinks.whatsapp} target="_blank" rel="noreferrer">Book on WhatsApp</a></div></div>
      </section>
    </>
  );
}
