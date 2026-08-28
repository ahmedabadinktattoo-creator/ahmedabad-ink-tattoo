import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-grid">
        <div>
          <p className="eyebrow">Ahmedabad Ink</p>
          <h2>Your story.<br />Made permanent.</h2>
        </div>
        <div>
          <p className="footer-label">Visit</p>
          <address>Ahmedabad, Gujarat<br />India</address>
          <p className="muted">Open daily · By appointment</p>
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
          <a href="mailto:hello@ahmedabadinktattoo.com">Email us ↗</a>
        </div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Ahmedabad Ink Tattoo</span><span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> · Art with intention since 2014</span></div>
    </footer>
  );
}
