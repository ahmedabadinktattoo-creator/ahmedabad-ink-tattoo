import Link from "next/link";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Tattoo Portfolio in Ahmedabad", description: "Explore original tattoos created in Nikol, Ahmedabad across realism, fine line, mandala, portrait, geometric, minimal, blackwork and cover-ups.", path: "/portfolio" });

export default function PortfolioPage() {
  return (
    <div className="inner-page">
      <header className="page-hero"><p className="eyebrow gold-text">Selected work · 2014—2026</p><h1>Every piece,<br /><em>one of one.</em></h1><p>Explore original work from our Ahmedabad studio. Filter by style, then bring us the feeling—not someone else’s tattoo.</p></header>
      <PortfolioGrid />
      <section className="mini-cta"><p className="eyebrow gold-text">Have an idea?</p><h2>Let’s give it a form.</h2><Link className="button gold" href="/book">Book a consultation</Link></section>
    </div>
  );
}
