import Image from "next/image";
import Link from "next/link";
import { ArtistCard } from "@/components/artist-card";
import { artists, portfolio } from "@/data/studio";

const principles = [
  ["01", "Made for one", "Every design begins from a blank page and a real conversation."],
  ["02", "Hygiene, without compromise", "Single-use needles, hospital-grade sterilisation and a calm, immaculate studio."],
  ["03", "Craft that lasts", "Experienced hands, considered placement and clear guidance from consultation to aftercare."],
] as const;

export default function Home() {
  const featured = portfolio.filter((item) => item.featured);

  return (
    <>
      <section className="hero">
        <Image className="hero-image" src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2000&q=90" alt="Tattoo artist working carefully in a dark studio" fill priority sizes="100vw" />
        <div className="hero-overlay" />
        <div className="hero-orbit" aria-hidden="true"><span>AHMEDABAD · INK · TATTOO · EST. 2014 · </span></div>
        <div className="hero-content">
          <p className="eyebrow">Premium tattoo studio · Ahmedabad</p>
          <h1>Wear your<br /><em>story.</em></h1>
          <p className="hero-lede">Original art. Experienced hands. A private, considered tattoo experience built around you.</p>
          <div className="button-row"><Link className="button gold" href="#book">Book a consultation</Link><Link className="text-link" href="/portfolio">Explore our work <span>↗</span></Link></div>
        </div>
        <p className="hero-side">Custom tattooing · Since 2014</p>
        <a className="scroll-cue" href="#studio">Scroll <span>↓</span></a>
      </section>

      <section className="intro section" id="studio">
        <div className="section-index">01 / Studio</div>
        <div className="intro-copy">
          <p className="eyebrow gold-text">A decade in ink</p>
          <h2>Not just a tattoo.<br /><em>A part of you.</em></h2>
          <div className="two-col-copy"><p>Since 2014, Ahmedabad Ink has been a home for thoughtful tattooing. We create work that respects your story, your body and the trust you place in us.</p><p>From the first sketch to the final line, our artists bring technical discipline and human care to every piece—large or small.</p></div>
          <Link className="line-link" href="/artists">Meet the artists <span>↗</span></Link>
        </div>
        <div className="stat"><strong>10+</strong><span>Years of<br />craft</span></div>
      </section>

      <section className="featured section-dark">
        <div className="section-heading"><div><p className="eyebrow gold-text">Selected work</p><h2>Ink with<br /><em>intention.</em></h2></div><Link className="line-link" href="/portfolio">View full portfolio <span>↗</span></Link></div>
        <div className="featured-grid">
          {featured.map((item, index) => <Link href="/portfolio" className={`featured-item feature-${index + 1}`} key={item.id}><Image src={item.image} alt={`${item.title}, ${item.category} tattoo`} fill sizes="(max-width: 700px) 100vw, 34vw" /><div className="card-shade" /><div className="card-copy"><span>{item.category}</span><h3>{item.title}</h3><p>By {item.artist}</p></div></Link>)}
        </div>
      </section>

      <section className="principles section" id="process">
        <div className="section-index">02 / The difference</div>
        <div className="principles-main"><p className="eyebrow gold-text">Why Ahmedabad Ink</p><h2>Nothing careless.<br /><em>Nothing copied.</em></h2>
          <div className="principle-list">{principles.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
        </div>
      </section>

      <section className="home-artists section-dark">
        <div className="section-heading"><div><p className="eyebrow gold-text">The artists</p><h2>Different hands.<br /><em>One standard.</em></h2></div><p className="heading-note">Choose the artist whose work feels closest to the idea in your head.</p></div>
        <div className="artist-grid">{artists.map((artist, index) => <ArtistCard artist={artist} priority={index === 0} key={artist.slug} />)}</div>
      </section>

      <section className="testimonial section"><p className="quote-mark">“</p><blockquote>From the consultation to the final reveal, I felt heard, safe and completely at ease. The tattoo is more beautiful than I imagined.</blockquote><p className="quote-by">— Studio client · Ahmedabad</p></section>

      <section className="booking" id="book">
        <Image src="https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=2000&q=85" alt="Tattoo studio detail" fill sizes="100vw" />
        <div className="booking-overlay" /><div className="booking-inner"><p className="eyebrow">Your idea starts here</p><h2>Let’s make something<br /><em>worth keeping.</em></h2><p>Tell us what you have in mind. We’ll help with the artist, style, placement and next steps.</p><a className="button gold" href="mailto:hello@ahmedabadink.com?subject=Tattoo%20consultation">Start your consultation</a></div>
      </section>
    </>
  );
}
