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
  { id: 1, title: "Guardian's Oath", category: "Realism", artist: "Ahmedabad Ink", featured: true, image: "/portfolio/lion-forearm.webp" },
  { id: 2, title: "Sacred Palm", category: "Mandala", artist: "Ahmedabad Ink", featured: true, image: "/portfolio/mandala-hand.webp" },
  { id: 3, title: "Axis", category: "Geometric", artist: "Ahmedabad Ink", featured: true, image: "/portfolio/geometric-back.webp" },
  { id: 4, title: "Divine Focus", category: "Realism", artist: "Ahmedabad Ink", image: "/portfolio/ganesha-forearm.webp" },
  { id: 5, title: "Gyana", category: "Portrait", artist: "Ahmedabad Ink", image: "/portfolio/child-portrait.webp" },
  { id: 6, title: "Wild Colour", category: "Realism", artist: "Ahmedabad Ink", image: "/portfolio/colour-tiger.webp" },
  { id: 7, title: "Night Watch", category: "Blackwork", artist: "Ahmedabad Ink", image: "/portfolio/blackwork-owl.webp" },
  { id: 8, title: "Winter Geometry", category: "Geometric", artist: "Ahmedabad Ink", image: "/portfolio/blackwork-snowflake.webp" },
  { id: 9, title: "Guided", category: "Fine Line", artist: "Ahmedabad Ink", image: "/portfolio/fine-line-arrow.webp" },
  { id: 10, title: "Bloom in Red", category: "Fine Line", artist: "Ahmedabad Ink", image: "/portfolio/ankle-botanical.webp" },
  { id: 11, title: "Lotus Rise", category: "Mandala", artist: "Ahmedabad Ink", image: "/portfolio/lotus-back.webp" },
  { id: 12, title: "Quiet Branch", category: "Fine Line", artist: "Ahmedabad Ink", image: "/portfolio/fine-line-botanical.webp" },
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
