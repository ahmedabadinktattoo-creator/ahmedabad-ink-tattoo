import Link from "next/link";

type Item = { number: string; title: string; text: string };

export function EditorialPage({ eyebrow, title, intro, items, cta = "Book a consultation" }: { eyebrow: string; title: React.ReactNode; intro: string; items: Item[]; cta?: string }) {
  return <div className="inner-page editorial-page">
    <header className="page-hero"><p className="eyebrow gold-text">{eyebrow}</p><h1>{title}</h1><p>{intro}</p></header>
    <section className="editorial-list section">
      {items.map((item) => <article key={item.number}><span>{item.number}</span><div><h2>{item.title}</h2><p>{item.text}</p></div></article>)}
    </section>
    <section className="mini-cta"><p className="eyebrow gold-text">Ready when you are</p><h2>Start with a conversation.</h2><Link href="/book" className="button gold">{cta}</Link></section>
  </div>;
}
