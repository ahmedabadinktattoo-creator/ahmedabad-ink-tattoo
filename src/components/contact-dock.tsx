import { studioLinks } from "@/data/links";

export function ContactDock() {
  return (
    <aside className="contact-dock" aria-label="Book a tattoo consultation">
      <a href={studioLinks.phone}><span>Call</span><strong>Book on call</strong></a>
      <a href={studioLinks.whatsapp} target="_blank" rel="noreferrer"><span>Chat</span><strong>Book on WhatsApp</strong></a>
    </aside>
  );
}
