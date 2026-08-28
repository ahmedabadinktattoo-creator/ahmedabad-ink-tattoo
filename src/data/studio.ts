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
  { id: 1, title: "The Quiet Roar", category: "Realism", artist: "Kartik", featured: true, image: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1200&q=85" },
  { id: 2, title: "Sacred Geometry", category: "Mandala", artist: "Sachin", featured: true, image: "https://images.unsplash.com/photo-1590246814883-57c511e19706?auto=format&fit=crop&w=1200&q=85" },
  { id: 3, title: "Botanical Study", category: "Fine Line", artist: "Manish", featured: true, image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=1200&q=85" },
  { id: 4, title: "Inner Strength", category: "Portrait", artist: "Kartik", image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=1200&q=85" },
  { id: 5, title: "Dark Bloom", category: "Blackwork", artist: "Sachin", image: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=1200&q=85" },
  { id: 6, title: "Small Stories", category: "Minimal", artist: "Manish", image: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&w=1200&q=85" },
  { id: 7, title: "New Chapter", category: "Cover Up", artist: "Kartik", image: "https://images.unsplash.com/photo-1542727365-19732a80dcfd?auto=format&fit=crop&w=1200&q=85" },
  { id: 8, title: "Measured Chaos", category: "Geometric", artist: "Sachin", image: "https://images.unsplash.com/photo-1611331781158-733c4f6e6cd1?auto=format&fit=crop&w=1200&q=85" },
  { id: 9, title: "Memory in Ink", category: "Portrait", artist: "Manish", image: "https://images.unsplash.com/photo-1598371839873-9681c5c4a9e4?auto=format&fit=crop&w=1200&q=85" },
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
    slug: "kartik",
    name: "Kartik",
    role: "Tattoo Artist",
    years: "Ahmedabad Ink",
    specialties: ["Realism", "Portrait", "Cover Up"],
    bio: "Kartik approaches every tattoo as a collaboration. He listens closely, develops a composition around the client’s idea and placement, and brings a calm, detail-led presence to the entire process.",
    quote: "I don’t begin with a needle. I begin with your story.",
    image: "/logo.png",
    instagram: "https://www.instagram.com/ahmedabadinktattoo/",
  },
  {
    slug: "sachin",
    name: "Sachin",
    role: "Tattoo Artist",
    years: "Ahmedabad Ink",
    specialties: ["Mandala", "Geometric", "Blackwork"],
    bio: "Sachin is drawn to structured, visually balanced tattooing. His process focuses on proportion, placement and clean execution so each piece feels intentional on the body.",
    quote: "Precision creates the space where emotion can live.",
    image: "/logo.png",
    instagram: "https://www.instagram.com/ahmedabadinktattoo/",
  },
  {
    slug: "manish",
    name: "Manish",
    role: "Tattoo Artist",
    years: "Ahmedabad Ink",
    specialties: ["Fine Line", "Minimal", "Botanical"],
    bio: "Manish brings a patient, thoughtful approach to personal tattoo ideas. He works with clients to simplify references into clear, wearable designs with a strong sense of flow.",
    quote: "The smallest mark can carry the largest memory.",
    image: "/logo.png",
    instagram: "https://www.instagram.com/ahmedabadinktattoo/",
  },
];

export function getArtist(slug: string) {
  return artists.find((artist) => artist.slug === slug);
}
