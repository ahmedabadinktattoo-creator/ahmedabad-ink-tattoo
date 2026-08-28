import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://ahmedabadinktattoo.com"),
  title: { default: "Ahmedabad Ink Tattoo | Premium Tattoo Studio Since 2014", template: "%s | Ahmedabad Ink Tattoo" },
  description: "Ahmedabad's premium custom tattoo studio since 2014. Explore original tattoo work and meet artists specialising in realism, fine line, mandala, portraits and blackwork.",
  alternates: { canonical: "/" },
  openGraph: { title: "Ahmedabad Ink Tattoo", description: "Original tattoos, created with intention in Ahmedabad.", type: "website", locale: "en_IN", siteName: "Ahmedabad Ink Tattoo", url: "/" },
  twitter: { card: "summary_large_image", title: "Ahmedabad Ink Tattoo", description: "Custom tattooing in Ahmedabad, crafted with intention since 2014." },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0a0a09" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const studioSchema = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    name: "Ahmedabad Ink Tattoo",
    url: "https://ahmedabadinktattoo.com",
    foundingDate: "2014",
    areaServed: "Ahmedabad, Gujarat",
    sameAs: ["https://www.instagram.com/ahmedabadinktattoo/"],
    priceRange: "₹₹",
  };
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body><SiteHeader /><main>{children}</main><SiteFooter /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(studioSchema) }} /></body>
    </html>
  );
}
