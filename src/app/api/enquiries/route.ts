import { NextResponse } from "next/server";
import { getSupabaseAdmin, hasBookingBackend } from "@/lib/supabase-admin";
import { bodyIsWithinLimit, checkWebsiteRateLimit, hasTrustedOrigin } from "@/lib/request-security";

export const runtime = "nodejs";

const sanitize = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);

export async function POST(request: Request) {
  try {
    if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    if (!bodyIsWithinLimit(request, 25_000)) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
    if (!await checkWebsiteRateLimit(request, "enquiries", 5, 600)) return NextResponse.json({ error: "Too many enquiries. Please wait a few minutes and try again." }, { status: 429, headers: { "Retry-After": "600" } });
    const raw = await request.text();
    if (raw.length > 25_000) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (sanitize(data.website, 200) || typeof data.startedAt !== "number" || Date.now() - data.startedAt < 1500) return NextResponse.json({ error: "Please try again." }, { status: 400 });
    const name = sanitize(data.name, 80);
    const email = sanitize(data.email, 160);
    const phone = sanitize(data.phone, 24);
    const style = sanitize(data.style, 80);
    const placement = sanitize(data.placement, 80);
    const size = sanitize(data.size, 80);
    const idea = sanitize(data.idea, 1500);
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !phone || !style || !placement || !size || idea.length < 10) return NextResponse.json({ error: "Please complete every field." }, { status: 400 });

    const reference = `AIT-E-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const backendReady = hasBookingBackend();
    const key = process.env.RESEND_API_KEY;
    const from = process.env.BOOKING_FROM_EMAIL ?? "Ahmedabad Ink Tattoo <bookings@ahmedabadinktattoo.com>";
    const studioEmail = process.env.STUDIO_EMAIL ?? "ahmedabadinktattoo@gmail.com";
    const emailReady = Boolean(key && from && studioEmail);

    let saved = false;
    if (backendReady) {
      const { error } = await getSupabaseAdmin().from("consultation_enquiries").insert({
        reference,
        customer_name: name,
        email,
        phone,
        tattoo_style: style,
        placement,
        approximate_size: size,
        idea,
      });
      if (error) {
        console.error("enquiry.database_insert_failed", { code: error.code, message: error.message });
      } else {
        saved = true;
      }
    }

    if (!emailReady) {
      console.warn("enquiry.email_configuration_missing", {
        resend: Boolean(key),
        sender: Boolean(from),
        recipient: Boolean(studioEmail),
        saved,
      });
      if (saved) return NextResponse.json({ ok: true, saved: true, notified: false, reference });
      return NextResponse.json({ error: "Enquiry service is temporarily unavailable." }, { status: 503 });
    }

    const reply = `<div style="font-family:Arial,sans-serif;color:#181714;line-height:1.6"><h1>We received your tattoo enquiry</h1><p>Hi ${escapeHtml(name)},</p><p>Thank you for sharing your idea with Ahmedabad Ink Tattoo. Our team will review the details and reply by email or WhatsApp.</p><p><a href="https://www.ahmedabadinktattoo.com/portfolio">Explore recent work</a> · <a href="https://wa.me/918866848681">Message the studio</a></p></div>`;
    const studio = `<div style="font-family:Arial,sans-serif;color:#181714;line-height:1.6"><h1>New website enquiry</h1><p><strong>Reference:</strong> ${reference}</p><p><strong>${escapeHtml(name)}</strong><br><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a><br><a href="https://wa.me/${phone.replace(/\D/g, "")}">${escapeHtml(phone)}</a></p><p><strong>Style:</strong> ${escapeHtml(style)}<br><strong>Placement:</strong> ${escapeHtml(placement)}<br><strong>Approx. size:</strong> ${escapeHtml(size)}</p><p><strong>Idea</strong><br>${escapeHtml(idea).replace(/\n/g, "<br>")}</p><p><a href="https://www.ahmedabadinktattoo.com/admin#enquiries">Open studio dashboard</a></p></div>`;
    const payloads = [
      { from, to: [email], subject: "Ahmedabad Ink received your enquiry", html: reply },
      { from, to: [studioEmail], reply_to: email, subject: `New tattoo enquiry · ${name}`, html: studio },
    ];
    const results = await Promise.all(payloads.map(async (payload) => {
      const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) console.error("enquiry.email_delivery_failed", { status: response.status, response: await response.text() });
      return response.ok;
    }));
    const notified = results.every(Boolean);

    if (saved) {
      const { error } = await getSupabaseAdmin().from("consultation_enquiries").update({
        notification_delivery: { customer: results[0], studio: results[1] },
        notifications_sent_at: notified ? new Date().toISOString() : null,
      }).eq("reference", reference);
      if (error) console.error("enquiry.notification_tracking_failed", { code: error.code, message: error.message });
    }

    if (!saved && !notified) return NextResponse.json({ error: "Enquiry could not be saved or sent." }, { status: 500 });
    return NextResponse.json({ ok: true, saved, notified, reference });
  } catch (error) {
    console.error("enquiry.unexpected_failure", error instanceof Error ? { message: error.message, stack: error.stack } : error);
    return NextResponse.json({ error: "Enquiry could not be sent." }, { status: 500 });
  }
}
