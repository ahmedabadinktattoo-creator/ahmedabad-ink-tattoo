import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { artists, getArtist, portfolio } from "@/data/studio";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return artists.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artist = getArtist((await params).slug);
  if (!artist) return { title: "Artist not found" };
  return { title: `${artist.name} — ${artist.role}`, description: artist.bio };
}

export default async function ArtistPage({ params }: Props) {
  const artist = getArtist((await params).slug);
  if (!artist) notFound();
  const work = portfolio.filter((item) => item.artist === artist.name).slice(0, 3);

  return (
    <div className="artist-profile">
      <section className="profile-hero"><div className="profile-image"><Image src={artist.image} alt={`${artist.name}, ${artist.role}`} fill priority sizes="(max-width: 800px) 100vw, 50vw" /></div><div className="profile-copy"><Link className="back-link" href="/artists">← All artists</Link><p className="eyebrow gold-text">{artist.role}</p><h1>{artist.name}</h1><p className="profile-years">{artist.years} of practice</p><ul className="tag-list">{artist.specialties.map((item) => <li key={item}>{item}</li>)}</ul><blockquote>“{artist.quote}”</blockquote></div></section>
      <section className="profile-about section"><div className="section-index">About / {artist.name}</div><div><h2>Work with<br /><em>meaning.</em></h2><p>{artist.bio}</p><div className="button-row"><a className="button gold" href={`mailto:hello@ahmedabadink.com?subject=Consultation%20with%20${artist.name}`}>Book with {artist.name}</a><a className="text-link" href={artist.instagram} target="_blank" rel="noreferrer">Instagram ↗</a></div></div></section>
      <section className="artist-work section-dark"><div className="section-heading"><div><p className="eyebrow gold-text">Selected work</p><h2>By {artist.name}.</h2></div><Link className="line-link" href="/portfolio">Full portfolio ↗</Link></div><div className="artist-work-grid">{work.map((item) => <div key={item.id}><div className="work-image"><Image src={item.image} alt={`${item.title} by ${artist.name}`} fill sizes="(max-width: 700px) 100vw, 33vw" /></div><p>{item.category} · {item.title}</p></div>)}</div></section>
    </div>
  );
}
