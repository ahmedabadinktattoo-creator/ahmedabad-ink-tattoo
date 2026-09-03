import Link from "next/link";
import { journalPosts } from "@/data/journal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Tattoo Guides & Journal", description: "Practical tattoo preparation, aftercare, placement, cover-up and style guidance from Ahmedabad Ink Tattoo in Nikol.", path: "/blog" });

export default function BlogPage() {
  return <div className="inner-page"><header className="page-hero"><p className="eyebrow gold-text">Journal · Useful by design</p><h1>Know more.<br/><em>Choose better.</em></h1><p>Clear guidance from consultation to healed tattoo—written to help you make confident decisions.</p></header><section className="journal-grid section">{Object.entries(journalPosts).map(([slug, post], index) => <Link href={`/blog/${slug}`} key={slug}><span>{String(index + 1).padStart(2, "0")} / {post.tag}</span><h2>{post.title}</h2><p>{post.copy}</p><b>Read article ↗</b></Link>)}</section></div>;
}
