import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";
export const metadata: Metadata = { title: "Tattoo Services in Ahmedabad", description: "Custom tattoos, realism, portraits, fine line, mandala, blackwork, cover-ups and consultation-led design in Ahmedabad.", alternates: { canonical: "/services" } };
export default function ServicesPage() { return <EditorialPage eyebrow="Tattoo services · Ahmedabad" title={<>Your idea.<br /><em>Our discipline.</em></>} intro="We match each idea to the right artist, visual language and process. Final pricing follows consultation because every original tattoo has different detail, placement and time requirements." items={[
  { number: "01", title: "Custom tattoo design", text: "A one-of-one design developed around your idea, anatomy, placement and preferred visual direction." },
  { number: "02", title: "Realism & portrait", text: "High-detail black-and-grey or colour work planned for strong composition, readable contrast and longevity." },
  { number: "03", title: "Fine line & minimal", text: "Delicate, intentional work where clean execution and carefully judged scale make every mark count." },
  { number: "04", title: "Mandala, geometric & blackwork", text: "Precision-led pattern, symmetry and bold black composition tailored to the movement of the body." },
  { number: "05", title: "Cover-up consultation", text: "A realistic assessment of the existing tattoo, available space and visual options before any promise is made." },
]} />; }
