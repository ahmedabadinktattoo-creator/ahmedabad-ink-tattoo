import type { MetadataRoute } from "next";
import { artists } from "@/data/studio";
export default function sitemap(): MetadataRoute.Sitemap { const base = "https://ahmedabadink.com"; return ["", "/portfolio", "/artists", "/book", ...artists.map((artist) => `/artists/${artist.slug}`)].map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path === "" ? "weekly" : "monthly" })); }
