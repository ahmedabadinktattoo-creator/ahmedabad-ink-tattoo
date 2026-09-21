import { whatsappNumber } from "@/lib/phone";
import type { BookingInput } from "@/lib/bookings";

type Confirmation = BookingInput & { reference: string };
type Delivery = { channel: string; ok: boolean; error?: string };

export async function sendBookingNotifications(booking: Confirmation): Promise<Delivery[]> {
  const tasks: Array<Promise<Delivery>> = [];
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_FROM_EMAIL;
  const studioEmail = process.env.STUDIO_EMAIL;

  if (resendKey && from) {
    tasks.push(sendEmail(resendKey, {
      from,
      to: [booking.email],
      subject: `Your Ahmedabad Ink consultation · ${booking.reference}`,
      html: customerEmail(booking),
    }, "customer_email"));

    if (studioEmail) {
      tasks.push(sendEmail(resendKey, {
        from,
        to: [studioEmail],
        reply_to: booking.email,
        subject: `New paid booking · ${booking.reference} · ${booking.name}`,
        html: studioEmailHtml(booking),
      }, "admin_email"));
    }
  } else {
    console.warn(JSON.stringify({ level: "warning", msg: "booking email skipped", reason: "Resend configuration missing", reference: booking.reference }));
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (token && phoneId) {
    tasks.push(fetch(`https://graph.facebook.com/v23.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to: whatsappNumber(booking.phone), type: "template", template: { name: process.env.WHATSAPP_TEMPLATE_NAME ?? "booking_confirmation", language: { code: "en" }, components: [{ type: "body", parameters: [{ type: "text", text: booking.name }, { type: "text", text: booking.reference }, { type: "text", text: `${booking.appointmentDate} ${booking.appointmentTime}` }] }] } }),
    }).then(async (response) => response.ok ? { channel: "customer_whatsapp", ok: true } : { channel: "customer_whatsapp", ok: false, error: await response.text() }));
  }

  const deliveries = await Promise.all(tasks);
  for (const delivery of deliveries) {
    const log = { level: delivery.ok ? "info" : "error", msg: "booking notification", reference: booking.reference, ...delivery };
    if (delivery.ok) console.log(JSON.stringify(log)); else console.error(JSON.stringify(log));
  }
  return deliveries;
}

async function sendEmail(key: string, payload: Record<string, unknown>, channel: string): Promise<Delivery> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (response.ok) return { channel, ok: true };
  return { channel, ok: false, error: await response.text() };
}

function customerEmail(booking: Confirmation) {
  return `<div style="font-family:Arial,sans-serif;color:#181714;line-height:1.6"><h1>Consultation confirmed</h1><p>Hi ${escapeHtml(booking.name)},</p><p>Your consultation at Ahmedabad Ink is confirmed.</p>${details(booking)}<p>Your ₹1,000 deposit is credited toward your tattoo. We’ll contact you if we need anything else before the appointment.</p><p><a href="https://www.ahmedabadinktattoo.com/dashboard">View your booking</a> · <a href="https://wa.me/918866848681">WhatsApp the studio</a></p></div>`;
}

function studioEmailHtml(booking: Confirmation) {
  return `<div style="font-family:Arial,sans-serif;color:#181714;line-height:1.6"><h1>New confirmed booking</h1>${details(booking)}<h2>Customer</h2><p>${escapeHtml(booking.name)}<br><a href="mailto:${escapeHtml(booking.email)}">${escapeHtml(booking.email)}</a><br><a href="https://wa.me/${whatsappNumber(booking.phone)}">${escapeHtml(booking.phone)}</a></p><h2>Tattoo brief</h2><p><strong>Placement:</strong> ${escapeHtml(booking.placement)}<br><strong>Size:</strong> ${escapeHtml(booking.size)}</p><p>${escapeHtml(booking.idea)}</p><p><a href="https://www.ahmedabadinktattoo.com/admin#bookings">Open admin dashboard</a></p></div>`;
}

function details(booking: Confirmation) {
  return `<p><strong>Reference:</strong> ${escapeHtml(booking.reference)}<br><strong>Date:</strong> ${escapeHtml(booking.appointmentDate)} at ${escapeHtml(booking.appointmentTime)}<br><strong>Style:</strong> ${escapeHtml(booking.style)}<br><strong>Artist:</strong> ${escapeHtml(booking.artistSlug)}</p>`;
}

function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character); }
