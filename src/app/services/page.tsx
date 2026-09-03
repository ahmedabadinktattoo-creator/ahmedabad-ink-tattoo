import { EditorialPage } from "@/components/editorial-page";
import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({ title: "Tattoo, Piercing & Removal Services in Ahmedabad", description: "Custom tattoos, body piercing, tattoo removal, realism, fine line, mandala, blackwork and cover-up consultations in Nikol, Ahmedabad.", path: "/services" });
export default function ServicesPage() { return <EditorialPage eyebrow="Tattoo services · Ahmedabad" title={<>Your idea.<br /><em>Our discipline.</em></>} intro="We match each idea to the right artist, visual language and process. Final pricing follows consultation because every original tattoo has different detail, placement and time requirements." items={[
  { number: "01", title: "Custom tattoo design", text: "A one-of-one design developed around your idea, anatomy, placement and preferred visual direction." },
  { number: "02", title: "Realism & portrait", text: "High-detail black-and-grey or colour work planned for strong composition, readable contrast and longevity." },
  { number: "03", title: "Fine line & minimal", text: "Delicate, intentional work where clean execution and carefully judged scale make every mark count." },
  { number: "04", title: "Mandala, geometric & blackwork", text: "Precision-led pattern, symmetry and bold black composition tailored to the movement of the body." },
  { number: "05", title: "Cover-up consultation", text: "A realistic assessment of the existing tattoo, available space and visual options before any promise is made." },
  { number: "06", title: "Professional body piercing", text: "Consultation-led ear and body piercing with sterile, single-use equipment, careful placement and clear healing guidance. Jewellery options and suitability are confirmed in studio." },
  { number: "07", title: "Tattoo removal consultation", text: "An honest assessment of your tattoo, skin and goals before planning laser removal or fading sessions. Session count and pricing depend on pigment, depth, age and response." },
  { number: "08", title: "Tattoo refresh & rework", text: "Restore definition, rebalance faded areas or thoughtfully rework an older tattoo while respecting the existing piece and available skin." },
]} />; }
