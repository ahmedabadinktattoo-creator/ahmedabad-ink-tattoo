"use client";

import Image from "next/image";
import { useDeferredValue, useState } from "react";
import { portfolio, portfolioCategories, type PortfolioCategory } from "@/data/studio";
import { studioLinks } from "@/data/links";

export function PortfolioGrid() {
  const [category, setCategory] = useState<PortfolioCategory>("All");
  const deferredCategory = useDeferredValue(category);
  const visible = deferredCategory === "All" ? portfolio : portfolio.filter((item) => item.category === deferredCategory);
  const availableCategories = portfolioCategories.filter((item) => item === "All" || portfolio.some((work) => work.category === item));

  return (
    <>
      <div className="portfolio-feed-note"><span>{portfolio.length} original pieces · Ahmedabad, India</span><a href={studioLinks.instagram} target="_blank" rel="noreferrer">Follow @ahmedabadinktattoo ↗</a></div>
      <div className="filters" role="group" aria-label="Filter portfolio by style">
        {availableCategories.map((item) => (
          <button key={item} type="button" aria-pressed={category === item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>
        ))}
      </div>
      <div className="portfolio-grid" aria-live="polite">
        {visible.map((item, index) => (
          <article className={`portfolio-card card-${(index % 5) + 1}`} key={item.id}>
            <Image src={item.image} alt={`${item.title}, ${item.category} tattoo by ${item.artist}`} fill sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" />
            <div className="card-shade" />
            <div className="card-copy"><span>{item.category}</span><h2>{item.title}</h2><p>By {item.artist}</p></div>
          </article>
        ))}
      </div>
    </>
  );
}
