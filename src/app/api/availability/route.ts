import { NextRequest, NextResponse } from "next/server";
import { bookingTimes } from "@/lib/bookings";
import { getSupabaseAdmin, hasBookingBackend } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const artist = request.nextUrl.searchParams.get("artist");
  const date = request.nextUrl.searchParams.get("date");
  if (!artist || !date) return NextResponse.json({ error: "Artist and date are required." }, { status: 400 });
  if (!hasBookingBackend()) return NextResponse.json({ slots: bookingTimes, demo: true });

  const { data, error } = await getSupabaseAdmin().from("consultation_bookings").select("appointment_time").eq("artist_slug", artist).eq("appointment_date", date).in("status", ["pending_payment", "confirmed"]);
  if (error) return NextResponse.json({ error: "Availability could not be loaded." }, { status: 500 });
  const reserved = new Set((data ?? []).map((row) => row.appointment_time.slice(0, 5)));
  return NextResponse.json({ slots: bookingTimes.filter((time) => !reserved.has(time)) });
}
