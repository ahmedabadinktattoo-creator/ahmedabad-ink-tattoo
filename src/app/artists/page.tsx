import type { Metadata } from "next";
import { ArtistCard } from "@/components/artist-card";
import { artists } from "@/data/studio";

export const metadata: Metadata = { title: "Tattoo Artists", description: "Meet the tattoo artists at Ahmedabad Ink and find the right specialist for your tattoo style." };

export default function ArtistsPage() {
  return (
    <div className="inner-page">
      <header className="page-hero"><p className="eyebrow gold-text">The artists</p><h1>Individual voices.<br /><em>A shared standard.</em></h1><p>Each artist brings a distinct visual language. All bring patience, precision and respect for the story behind the work.</p></header>
      <div className="artist-grid artist-page-grid">{artists.map((artist, index) => <ArtistCard key={artist.slug} artist={artist} priority={index < 2} />)}</div>
      <section className="mini-cta"><p className="eyebrow gold-text">Not sure who to choose?</p><h2>We’ll find the right fit.</h2><a className="button gold" href="mailto:hello@ahmedabadink.com?subject=Help%20me%20choose%20an%20artist">Talk to the studio</a></section>
    </div>
  );
}
