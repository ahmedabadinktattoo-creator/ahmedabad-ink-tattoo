import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ContactDock } from "@/components/contact-dock";
import { ConsentManager } from "@/components/consent-manager";
import { studioLinks } from "@/data/links";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://ahmedabadinktattoo.com"),
  title: { default: "Ahmedabad Ink Tattoo | Premium Tattoo Studio Since 2014", template: "%s | Ahmedabad Ink Tattoo" },
  description: "Ahmedabad's premium custom tattoo studio since 2014. Explore original tattoo work and meet artists specialising in realism, fine line, mandala, portraits and blackwork.",
  keywords: ["tattoo studio Ahmedabad", "tattoo artist Ahmedabad", "tattoo shop Nikol", "custom tattoo Ahmedabad", "body piercing Ahmedabad", "tattoo removal Ahmedabad"],
  alternates: { canonical: "/" },
  openGraph: { title: "Ahmedabad Ink Tattoo", description: "Original tattoos, created with intention in Ahmedabad.", type: "website", locale: "en_IN", siteName: "Ahmedabad Ink Tattoo", url: "/" },
  twitter: { card: "summary_large_image", title: "Ahmedabad Ink Tattoo", description: "Custom tattooing in Ahmedabad, crafted with intention since 2014." },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0a0a09" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? "G-6G8K7KQH0J";
  const googleTagManagerId = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID ?? "GTM-WKQTS5QF";
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1341779253037735";
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "ycdcb0ticm";
  const studioSchema = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    name: "Ahmedabad Ink Tattoo",
    url: "https://ahmedabadinktattoo.com",
    foundingDate: "2014",
    openingHours: studioLinks.openingHours,
    telephone: "+91 88668 48681",
    address: {
      "@type": "PostalAddress",
      streetAddress: "FF/109, Silver Square, Opp. Dipak School, near Gangotri Circle Road, Sanidhya Park, Nikol",
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      postalCode: "382350",
      addressCountry: "IN",
    },
    hasMap: studioLinks.maps,
    areaServed: "Ahmedabad, Gujarat",
    geo: { "@type": "GeoCoordinates", latitude: 23.0464305, longitude: 72.6668693 },
    sameAs: [studioLinks.facebook, studioLinks.instagram, studioLinks.x, studioLinks.youtube, studioLinks.pinterest, studioLinks.tumblr],
    logo: "https://ahmedabadinktattoo.com/logo.png",
    image: "https://ahmedabadinktattoo.com/opengraph-image",
    priceRange: "₹₹",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91 88668 48681",
      contactType: "customer service",
      areaServed: "IN",
    },
    makesOffer: [
      "Custom tattoo design",
      "Realism tattoo",
      "Portrait tattoo",
      "Fine line tattoo",
      "Mandala tattoo",
      "Geometric tattoo",
      "Blackwork tattoo",
      "Tattoo cover-up",
      "Body piercing",
      "Tattoo removal consultation",
      "Tattoo refresh and rework",
    ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
  };
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body><SiteHeader /><main>{children}</main><SiteFooter /><ContactDock /><ConsentManager googleAnalyticsId={googleAnalyticsId} googleTagManagerId={googleTagManagerId} metaPixelId={metaPixelId} clarityProjectId={clarityProjectId} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(studioSchema) }} /></body>
    </html>
  );
}
