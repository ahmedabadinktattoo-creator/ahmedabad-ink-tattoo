import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers.get("x-razorpay-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const raw = await request.text();
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const valid = signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const event = JSON.parse(raw) as { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } };
  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    if (payment?.id && payment.order_id) await getSupabaseAdmin().from("consultation_bookings").update({ status: "confirmed", razorpay_payment_id: payment.id, paid_at: new Date().toISOString() }).eq("razorpay_order_id", payment.order_id).eq("status", "pending_payment");
  }
  return NextResponse.json({ received: true });
}
