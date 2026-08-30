import type { Metadata } from "next";
import { BookingWizard } from "@/components/booking-wizard";
import { artists } from "@/data/studio";

export const metadata: Metadata = { title: "Book a Tattoo Consultation", description: "Choose an artist, share your tattoo idea, select a consultation time and reserve your appointment at Ahmedabad Ink." };
type Props = { searchParams: Promise<{ artist?: string }> };

export default async function BookingPage({ searchParams }: Props) {
  const requestedArtist = (await searchParams).artist ?? "";
  const initialArtist = artists.some((artist) => artist.slug === requestedArtist) ? requestedArtist : "";
  const calBookingUrl = process.env.NEXT_PUBLIC_CAL_BOOKING_URL;
  return <div className="booking-page"><header><p className="eyebrow gold-text">Private consultation</p><h1>Begin with<br /><em>a conversation.</em></h1><p>Six simple steps. No pressure, no copied designs—just your idea and our honest guidance.</p></header><BookingWizard initialArtist={initialArtist} /><aside className="booking-assurance"><span>✓ Private reference uploads</span><span>✓ Secure Razorpay checkout</span><span>✓ Deposit credited to your tattoo</span></aside>{calBookingUrl && <aside className="cal-booking-option"><p>Prefer to arrange a remote consultation?</p><a className="line-link" href={calBookingUrl} target="_blank" rel="noreferrer">Open Ahmedabad Ink on Cal.com ↗</a></aside>}</div>;
}
