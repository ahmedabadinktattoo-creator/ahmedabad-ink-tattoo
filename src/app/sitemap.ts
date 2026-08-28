import type { MetadataRoute } from "next";
import { artists } from "@/data/studio";
export default function sitemap(): MetadataRoute.Sitemap { const base = "https://ahmedabadinktattoo.com"; return ["", "/about", "/services", "/portfolio", "/artists", "/aftercare", "/faq", "/contact", "/blog", "/blog/first-tattoo-guide", "/blog/tattoo-aftercare-guide", "/privacy", "/terms", "/book", ...artists.map((artist) => `/artists/${artist.slug}`)].map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path === "" ? "weekly" : "monthly" })); }
