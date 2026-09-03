import { EditorialPage } from "@/components/editorial-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Tattoo FAQ — Pricing, Preparation & Aftercare",
  description: "Answers about tattoo consultations, deposits, preparation, pricing, cover-ups and healing from Ahmedabad Ink Tattoo in Nikol.",
  path: "/faq",
});

const items = [
  { number: "01", title: "How is pricing decided?", text: "Price depends on size, detail, placement, style and estimated time. We provide a clear estimate after understanding the project." },
  { number: "02", title: "Why is a deposit required?", text: "The deposit reserves artist time and starts design preparation. Its adjustment and cancellation terms are shared before payment." },
  { number: "03", title: "Can you copy a tattoo I found online?", text: "References are welcome, but we create an original interpretation rather than reproducing another artist’s work." },
  { number: "04", title: "How should I prepare?", text: "Sleep well, eat beforehand, hydrate, avoid alcohol and arrive in clothing that gives comfortable access to the placement." },
  { number: "05", title: "Do you work with cover-ups?", text: "Yes, after assessing the existing piece. Successful cover-ups usually need flexibility in size, darkness and composition." },
] as const;

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.title,
      acceptedAnswer: { "@type": "Answer", text: item.text },
    })),
  };

  return (
    <>
      <EditorialPage
        eyebrow="Frequently asked questions"
        title={<>Clear answers.<br /><em>No guesswork.</em></>}
        intro="Tattoo projects are personal. These answers cover the essentials; your consultation is where we make the advice specific to you."
        items={[...items]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}
