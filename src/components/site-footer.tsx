import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-grid">
        <div>
          <div className="footer-brand"><Image src="/logo.png" alt="Ahmedabad Ink Tattoo logo" width={72} height={72} /><p className="eyebrow">Ahmedabad Ink</p></div>
          <h2>Your story.<br />Made permanent.</h2>
        </div>
        <div>
          <p className="footer-label">Visit</p>
          <address>FF/109, Silver Square<br />Opp. Dipak School, near Gangotri Circle Road<br />Nikol, Ahmedabad, Gujarat 382350</address>
          <p className="muted">Open daily · By appointment</p>
          <a href="https://maps.app.goo.gl/9d6jgxtCMyuzmjDEA" target="_blank" rel="noreferrer">Open in Google Maps ↗</a>
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
          <a href="https://www.instagram.com/ahmedabadinktattoo/" target="_blank" rel="noreferrer">Instagram ↗</a>
          <a href="https://wa.me/918866848681" target="_blank" rel="noreferrer">WhatsApp ↗</a>
          <a href="mailto:hello@ahmedabadinktattoo.com">Email us ↗</a>
        </div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Ahmedabad Ink Tattoo</span><span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> · Art with intention since 2014</span></div>
    </footer>
  );
}
