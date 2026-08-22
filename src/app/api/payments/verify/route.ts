import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sendBookingNotifications } from "@/lib/notifications";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type PaymentBody = { bookingId?: string; razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string };

export async function POST(request: Request) {
  try {
    const body = await request.json() as PaymentBody;
    const { bookingId, razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!bookingId || !orderId || !paymentId || !signature || !secret) return NextResponse.json({ error: "Invalid payment confirmation." }, { status: 400 });

    const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    const valid = signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!valid) return NextResponse.json({ error: "Payment signature could not be verified." }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("consultation_bookings").update({ status: "confirmed", razorpay_payment_id: paymentId, paid_at: new Date().toISOString() }).eq("id", bookingId).eq("razorpay_order_id", orderId).select("reference,customer_name,email,phone,artist_slug,tattoo_style,appointment_date,appointment_time,placement,approximate_size,idea").single();
    if (error || !data) throw new Error("Booking confirmation could not be saved.");

    await sendBookingNotifications({ reference: data.reference, name: data.customer_name, email: data.email, phone: data.phone, artistSlug: data.artist_slug, style: data.tattoo_style, appointmentDate: data.appointment_date, appointmentTime: data.appointment_time.slice(0, 5), placement: data.placement, size: data.approximate_size, idea: data.idea });
    return NextResponse.json({ confirmed: true, reference: data.reference });
  } catch {
    return NextResponse.json({ error: "Payment confirmation failed. Please contact the studio with your payment ID." }, { status: 500 });
  }
}
