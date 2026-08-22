import type { BookingInput } from "@/lib/bookings";

type Confirmation = BookingInput & { reference: string };

export async function sendBookingNotifications(booking: Confirmation) {
  const tasks: Promise<unknown>[] = [];
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_FROM_EMAIL;
  const studioEmail = process.env.STUDIO_EMAIL;

  if (resendKey && from) {
    const to = studioEmail ? [booking.email, studioEmail] : [booking.email];
    tasks.push(fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to, subject: `Consultation confirmed · ${booking.reference}`,
        html: `<div style="font-family:Arial,sans-serif;color:#181714"><h1>Consultation confirmed</h1><p>Hi ${escapeHtml(booking.name)},</p><p>Your consultation at Ahmedabad Ink is confirmed for <strong>${booking.appointmentDate} at ${booking.appointmentTime}</strong>.</p><p>Reference: <strong>${booking.reference}</strong><br>Style: ${escapeHtml(booking.style)}<br>Artist: ${escapeHtml(booking.artistSlug)}</p><p>We’ll contact you if we need anything else before your appointment.</p></div>`,
      }),
    }));
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (token && phoneId) {
    tasks.push(fetch(`https://graph.facebook.com/v23.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to: booking.phone.replace(/\D/g, ""), type: "template", template: { name: process.env.WHATSAPP_TEMPLATE_NAME ?? "booking_confirmation", language: { code: "en" }, components: [{ type: "body", parameters: [{ type: "text", text: booking.name }, { type: "text", text: booking.reference }, { type: "text", text: `${booking.appointmentDate} ${booking.appointmentTime}` }] }] } }),
    }));
  }

  await Promise.allSettled(tasks);
}

function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character); }
