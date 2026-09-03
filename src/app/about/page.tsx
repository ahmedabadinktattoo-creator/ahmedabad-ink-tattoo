import { EditorialPage } from "@/components/editorial-page";
import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({ title: "About Our Tattoo Studio in Nikol, Ahmedabad", description: "Meet Ahmedabad Ink Tattoo, a custom tattoo studio in Nikol built on original design, careful craft and uncompromising hygiene since 2014.", path: "/about" });
export default function AboutPage() { return <EditorialPage eyebrow="Our studio · Since 2014" title={<>A decade of craft.<br /><em>One lasting standard.</em></>} intro="Ahmedabad Ink is a private, consultation-led tattoo studio where original design, technical discipline and human care carry equal weight." items={[
  { number: "01", title: "Listen before drawing", text: "Every project begins with a real conversation about meaning, placement, scale, references and how the piece should live with your body." },
  { number: "02", title: "Design for one person", text: "We do not copy tattoos. Your artist develops an original direction shaped by your story and their specialist visual language." },
  { number: "03", title: "Work without shortcuts", text: "Single-use needles, controlled workstations and careful preparation protect both the artwork and the person wearing it." },
  { number: "04", title: "Care beyond the session", text: "Clear preparation and aftercare support help your tattoo settle, heal and age as intended." },
]} />; }
