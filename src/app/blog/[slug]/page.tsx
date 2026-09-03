import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { journalPosts, type JournalSlug } from "@/data/journal";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() { return Object.keys(journalPosts).map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = journalPosts[slug as JournalSlug];
  return post ? buildMetadata({ title: post.title, description: post.description, path: `/blog/${slug}` }) : {};
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = journalPosts[slug as JournalSlug];
  if (!post) notFound();
  return <article className="inner-page article-page"><header className="page-hero"><Link className="back-link" href="/blog">← Journal</Link><p className="eyebrow gold-text">{post.tag} guide</p><h1>{post.title}</h1><p>{post.description}</p></header><div className="article-body section">{post.sections.map(([title, text], index) => <section key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{title}</h2><p>{text}</p></div></section>)}<aside><h2>Have an idea in mind?</h2><Link href="/book" className="button gold">Send an enquiry</Link></aside></div></article>;
}
