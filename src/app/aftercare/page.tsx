import { EditorialPage } from "@/components/editorial-page";
import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({ title: "Tattoo Aftercare Guide", description: "A clear tattoo aftercare guide from Ahmedabad Ink Tattoo for washing, moisturising, healing and protecting fresh ink.", path: "/aftercare" });
export default function AftercarePage() { return <EditorialPage eyebrow="Aftercare · Protect the work" title={<>Good healing is<br /><em>part of the craft.</em></>} intro="Always follow the personalised instructions given by your artist. Contact the studio if healing feels unusual or you are uncertain at any stage." cta="Ask the studio" items={[
  { number: "01", title: "Leave the studio wrap as advised", text: "Your artist will tell you when to remove the dressing based on the product used and your tattoo." },
  { number: "02", title: "Wash gently", text: "Use clean hands, lukewarm water and a mild fragrance-free cleanser. Pat dry with a clean paper towel—never scrub." },
  { number: "03", title: "Moisturise lightly", text: "Apply only a very thin layer of the recommended aftercare product. Too much moisture can slow healing." },
  { number: "04", title: "Let it heal", text: "Do not scratch, pick or peel. Avoid swimming, soaking, tight friction and intense training while the skin settles." },
  { number: "05", title: "Protect it long term", text: "Once fully healed, moisturise the skin and use high-SPF sun protection to preserve clarity and contrast." },
]} />; }
