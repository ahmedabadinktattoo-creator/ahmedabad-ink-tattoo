import type { MetadataRoute } from "next";
import { artists } from "@/data/studio";
import { journalPosts } from "@/data/journal";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.ahmedabadinktattoo.com";
  const paths = ["", "/about", "/services", "/portfolio", "/artists", "/aftercare", "/faq", "/contact", "/blog", "/privacy", "/terms", "/book",
    ...Object.keys(journalPosts).map((slug) => `/blog/${slug}`),
    ...artists.map((artist) => `/artists/${artist.slug}`)];
  return paths.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
  }));
}
