"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  ["Studio", "/#studio"],
  ["Artists", "/artists"],
  ["Portfolio", "/portfolio"],
  ["Process", "/#process"],
  ["Contact", "/#contact"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link className="brand" href="/" aria-label="Ahmedabad Ink home" onClick={() => setOpen(false)}>
          <span className="brand-mark">AI</span>
          <span>Ahmedabad Ink<small>Tattoo Studio · Since 2014</small></span>
        </Link>
        <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="site-nav">
          <span className="sr-only">Toggle menu</span>
          <span /><span />
        </button>
        <nav id="site-nav" className={open ? "nav-links open" : "nav-links"} aria-label="Primary navigation">
          {links.map(([label, href]) => (
            <Link key={label} href={href} className={pathname === href ? "active" : ""} onClick={() => setOpen(false)}>{label}</Link>
          ))}
          <Link className="nav-cta" href="/book" onClick={() => setOpen(false)}>Book consultation</Link>
        </nav>
      </div>
    </header>
  );
}
