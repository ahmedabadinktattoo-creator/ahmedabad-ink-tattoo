import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { bookingReference, depositPaise, parseBookingForm, validateReference } from "@/lib/bookings";
import { getSupabaseAdmin, hasBookingBackend } from "@/lib/supabase-admin";
import { createClient as createUserClient, hasPublicSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = request.headers.get("x-vercel-id") ?? randomUUID();
  console.log(JSON.stringify({ level: "info", msg: "booking request started", route: "/api/bookings", requestId }));
  try {
    const formData = await request.formData();
    const input = parseBookingForm(formData);
    const fileValue = formData.get("reference");
    const file = validateReference(fileValue instanceof File ? fileValue : null);
    const id = randomUUID();
    const reference = bookingReference(id);
    const razorpayReady = Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

    if (!hasBookingBackend() && !razorpayReady && process.env.NODE_ENV !== "production") {
      return NextResponse.json({ demo: true, bookingId: id, reference, amount: depositPaise });
    }
    if (!hasBookingBackend() || !razorpayReady) {
      return NextResponse.json({ error: "Booking services are only partially configured. Please contact the studio." }, { status: 503 });
    }

    const auth = Buffer.from(`${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: depositPaise, currency: "INR", receipt: reference, notes: { booking_id: id } }),
    });
    if (!orderResponse.ok) throw new Error("Payment order could not be created.");
    const order = await orderResponse.json() as { id: string };
    const supabase = getSupabaseAdmin();
    const user = hasPublicSupabase() ? (await (await createUserClient()).auth.getUser()).data.user : null;
    let referencePath: string | null = null;

    if (file) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      referencePath = `${id}/reference.${extension}`;
      const { error } = await supabase.storage.from("booking-references").upload(referencePath, await file.arrayBuffer(), { contentType: file.type, upsert: false });
      if (error) throw new Error("Reference image could not be uploaded.");
    }

    const { error } = await supabase.from("consultation_bookings").insert({
      id, reference, customer_name: input.name, email: input.email, phone: input.phone,
      artist_slug: input.artistSlug, tattoo_style: input.style, appointment_date: input.appointmentDate,
      appointment_time: input.appointmentTime, placement: input.placement, approximate_size: input.size,
      idea: input.idea, reference_path: referencePath, deposit_amount: depositPaise, razorpay_order_id: order.id, user_id: user?.id ?? null,
    });
    if (error) {
      if (referencePath) await supabase.storage.from("booking-references").remove([referencePath]);
      if (error.code === "23505") return NextResponse.json({ error: "That slot was just reserved. Please choose another time." }, { status: 409 });
      throw new Error("Booking could not be saved.");
    }

    console.log(JSON.stringify({ level: "info", msg: "booking saved", route: "/api/bookings", requestId, reference, ms: Date.now() - startedAt }));
    return NextResponse.json({ bookingId: id, reference, orderId: order.id, amount: depositPaise, currency: "INR", keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Booking could not be created.";
    console.error(JSON.stringify({ level: "error", msg: "booking failed", route: "/api/bookings", requestId, error: message, ms: Date.now() - startedAt }));
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
