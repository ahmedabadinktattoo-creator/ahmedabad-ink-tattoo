import type { Metadata } from "next";
import { PortfolioGrid } from "@/components/portfolio-grid";

export const metadata: Metadata = { title: "Tattoo Portfolio", description: "Explore custom tattoo work from Ahmedabad Ink across realism, fine line, mandala, portrait, geometric, minimal, blackwork and cover ups." };

export default function PortfolioPage() {
  return (
    <div className="inner-page">
      <header className="page-hero"><p className="eyebrow gold-text">Selected work · 2014—2026</p><h1>Every piece,<br /><em>one of one.</em></h1><p>Explore original work from our Ahmedabad studio. Filter by style, then bring us the feeling—not someone else’s tattoo.</p></header>
      <PortfolioGrid />
      <section className="mini-cta"><p className="eyebrow gold-text">Have an idea?</p><h2>Let’s give it a form.</h2><a className="button gold" href="mailto:hello@ahmedabadink.com?subject=Tattoo%20consultation">Book a consultation</a></section>
    </div>
  );
}
