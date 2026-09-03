import Image from "next/image";
import Link from "next/link";
import { studioLinks } from "@/data/links";

export function SiteFooter() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-grid">
        <div>
          <div className="footer-brand"><span className="footer-logo-mark"><Image src="/logo.png" alt="Ahmedabad Ink Tattoo tree logo" width={88} height={88} /></span><p className="eyebrow">Ahmedabad Ink</p></div>
          <h2>Your story.<br />Made permanent.</h2>
        </div>
        <div>
          <p className="footer-label">Visit</p>
          <address>FF/109, Silver Square<br />Opp. Dipak School, near Gangotri Circle Road<br />Nikol, Ahmedabad, Gujarat 382350</address>
          <p className="muted">Open daily · By appointment</p>
          <a href={studioLinks.maps} target="_blank" rel="noreferrer">Open in Google Maps ↗</a>
        </div>
        <div>
          <p className="footer-label">Explore</p>
          <Link href="/artists">Artists</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/services">Services</Link>
          <Link href="/aftercare">Aftercare</Link>
          <Link href="/faq">FAQ</Link>
        </div>
        <div>
          <p className="footer-label">Connect</p>
          <a href={studioLinks.facebook} target="_blank" rel="noreferrer">Facebook ↗</a>
          <a href={studioLinks.instagram} target="_blank" rel="noreferrer">Instagram ↗</a>
          <a href={studioLinks.x} target="_blank" rel="noreferrer">X ↗</a>
          <a href={studioLinks.youtube} target="_blank" rel="noreferrer">YouTube ↗</a>
          <a href={studioLinks.pinterest} target="_blank" rel="noreferrer">Pinterest ↗</a>
          <a href={studioLinks.tumblr} target="_blank" rel="noreferrer">Tumblr ↗</a>
          <a href={studioLinks.whatsapp} target="_blank" rel="noreferrer">WhatsApp ↗</a>
          <a href={studioLinks.phone}>Call {studioLinks.phoneDisplay}</a>
          <a href={studioLinks.googleReviews} target="_blank" rel="noreferrer">Google reviews ↗</a>
          <a href="mailto:hello@ahmedabadinktattoo.com">Email us ↗</a>
        </div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Ahmedabad Ink Tattoo</span><span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> · Art with intention since 2014</span></div>
    </footer>
  );
}
