export const portfolioCategories = [
  "All",
  "Realism",
  "Fine Line",
  "Mandala",
  "Portrait",
  "Geometric",
  "Minimal",
  "Blackwork",
  "Cover Up",
] as const;

export type PortfolioCategory = (typeof portfolioCategories)[number];

export type PortfolioItem = {
  id: number;
  title: string;
  category: Exclude<PortfolioCategory, "All">;
  image: string;
  artist: string;
  featured?: boolean;
};

export const portfolio: PortfolioItem[] = [
  { id: 1, title: "The Quiet Roar", category: "Realism", artist: "Vishal", featured: true, image: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1200&q=85" },
  { id: 2, title: "Sacred Geometry", category: "Mandala", artist: "Aarav", featured: true, image: "https://images.unsplash.com/photo-1590246814883-57c511e19706?auto=format&fit=crop&w=1200&q=85" },
  { id: 3, title: "Botanical Study", category: "Fine Line", artist: "Mira", featured: true, image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=1200&q=85" },
  { id: 4, title: "Inner Strength", category: "Portrait", artist: "Vishal", image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=1200&q=85" },
  { id: 5, title: "Dark Bloom", category: "Blackwork", artist: "Aarav", image: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=1200&q=85" },
  { id: 6, title: "Small Stories", category: "Minimal", artist: "Mira", image: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&w=1200&q=85" },
  { id: 7, title: "New Chapter", category: "Cover Up", artist: "Vishal", image: "https://images.unsplash.com/photo-1542727365-19732a80dcfd?auto=format&fit=crop&w=1200&q=85" },
  { id: 8, title: "Measured Chaos", category: "Geometric", artist: "Aarav", image: "https://images.unsplash.com/photo-1611331781158-733c4f6e6cd1?auto=format&fit=crop&w=1200&q=85" },
  { id: 9, title: "Memory in Ink", category: "Portrait", artist: "Mira", image: "https://images.unsplash.com/photo-1598371839873-9681c5c4a9e4?auto=format&fit=crop&w=1200&q=85" },
];

export type Artist = {
  slug: string;
  name: string;
  role: string;
  years: string;
  specialties: string[];
  bio: string;
  quote: string;
  image: string;
  instagram: string;
};

export const artists: Artist[] = [
  {
    slug: "vishal",
    name: "Vishal",
    role: "Founder & Lead Artist",
    years: "12+ years",
    specialties: ["Realism", "Portrait", "Cover Up"],
    bio: "Vishal founded Ahmedabad Ink with one belief: every tattoo should feel personal long after it heals. His work is grounded in patient consultation, confident composition and refined black-and-grey technique.",
    quote: "I don’t begin with a needle. I begin with your story.",
    image: "https://images.unsplash.com/photo-1560707854-fb9a10eeaace?auto=format&fit=crop&w=1200&q=85",
    instagram: "https://www.instagram.com/ahmedabadinktattoo/",
  },
  {
    slug: "aarav",
    name: "Aarav",
    role: "Senior Tattoo Artist",
    years: "8+ years",
    specialties: ["Mandala", "Geometric", "Blackwork"],
    bio: "Aarav turns symmetry and rhythm into expressive body art. His precise linework and balanced use of negative space make large-format mandalas and geometric pieces feel effortless.",
    quote: "Precision creates the space where emotion can live.",
    image: "https://images.unsplash.com/photo-1621784563330-caee0b138a00?auto=format&fit=crop&w=1200&q=85",
    instagram: "https://www.instagram.com/ahmedabadinktattoo/",
  },
  {
    slug: "mira",
    name: "Mira",
    role: "Fine Line Specialist",
    years: "6+ years",
    specialties: ["Fine Line", "Minimal", "Botanical"],
    bio: "Mira is known for delicate, intentional work that rewards a closer look. She brings a calm, collaborative approach to fine-line botanicals, keepsakes and meaningful minimal tattoos.",
    quote: "The smallest mark can carry the largest memory.",
    image: "https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=1200&q=85",
    instagram: "https://www.instagram.com/ahmedabadinktattoo/",
  },
];

export function getArtist(slug: string) {
  return artists.find((artist) => artist.slug === slug);
}
