import Image from "next/image";
import Link from "next/link";
import type { Artist } from "@/data/studio";

export function ArtistCard({ artist, priority = false }: { artist: Artist; priority?: boolean }) {
  return (
    <article className="artist-card">
      <Link href={`/artists/${artist.slug}`} className="artist-image" aria-label={`View ${artist.name}'s profile`}>
        <Image src={artist.image} alt={`${artist.name}, ${artist.role} at Ahmedabad Ink`} fill priority={priority} sizes="(max-width: 760px) 100vw, 33vw" />
        <span className="view-artist">View artist <b>↗</b></span>
      </Link>
      <div className="artist-meta">
        <div><h2>{artist.name}</h2><p>{artist.role}</p></div>
        <p className="artist-years">{artist.years}</p>
      </div>
      <ul className="tag-list" aria-label={`${artist.name}'s specialties`}>{artist.specialties.map((item) => <li key={item}>{item}</li>)}</ul>
    </article>
  );
}
