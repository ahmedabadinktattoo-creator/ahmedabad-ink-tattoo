import Link from "next/link";
import { ArtistCard } from "@/components/artist-card";
import { artists } from "@/data/studio";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Tattoo Artists in Ahmedabad", description: "Meet Kartik, Sachin and Manish at Ahmedabad Ink Tattoo in Nikol and find the right artist for realism, portrait, mandala, blackwork, fine line or minimal tattoos.", path: "/artists" });

export default function ArtistsPage() {
  return (
    <div className="inner-page">
      <header className="page-hero"><p className="eyebrow gold-text">The artists</p><h1>Individual voices.<br /><em>A shared standard.</em></h1><p>Each artist brings a distinct visual language. All bring patience, precision and respect for the story behind the work.</p></header>
      <div className="artist-grid artist-page-grid">{artists.map((artist, index) => <ArtistCard key={artist.slug} artist={artist} priority={index < 2} />)}</div>
      <section className="mini-cta"><p className="eyebrow gold-text">Not sure who to choose?</p><h2>We’ll find the right fit.</h2><Link className="button gold" href="/book">Talk to the studio</Link></section>
    </div>
  );
}
