import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://ahmedabadink.com"),
  title: { default: "Ahmedabad Ink Tattoo | Premium Tattoo Studio", template: "%s | Ahmedabad Ink" },
  description: "Ahmedabad's premium custom tattoo studio since 2014. Explore original tattoo work and meet artists specialising in realism, fine line, mandala, portraits and blackwork.",
  openGraph: { title: "Ahmedabad Ink Tattoo", description: "Original tattoos, created with intention in Ahmedabad.", type: "website", locale: "en_IN" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0a0a09" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body><SiteHeader /><main>{children}</main><SiteFooter /></body>
    </html>
  );
}
