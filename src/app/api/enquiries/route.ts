import { whatsappNumber } from "@/lib/phone";
import { NextResponse } from "next/server";
import type { MarketingAttribution } from "@/lib/attribution";
import { runMarketingLeadIntegrations } from "@/lib/marketing-integrations";
import { getSupabaseAdmin, hasBookingBackend } from "@/lib/supabase-admin";
import { bodyIsWithinLimit, checkWebsiteRateLimit, hasTrustedOrigin } from "@/lib/request-security";

export const runtime = "nodejs";

const sanitize = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
const cookieValue = (request: Request, name: string) => request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) ?? "";

function readAttribution(value: unknown, marketingConsent: boolean): MarketingAttribution {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const source = sanitize(input.source, 100).toLowerCase() || "direct";
  const medium = sanitize(input.medium, 100).toLowerCase() || "direct";
  return {
    source,
    medium,
    campaign: sanitize(input.campaign, 150).toLowerCase(),
    utmSource: sanitize(input.utmSource, 100).toLowerCase(),
    utmMedium: sanitize(input.utmMedium, 100).toLowerCase(),
    utmCampaign: sanitize(input.utmCampaign, 150).toLowerCase(),
    utmContent: sanitize(input.utmContent, 150),
    utmTerm: sanitize(input.utmTerm, 150),
    landingPage: sanitize(input.landingPage, 500),
    referrer: sanitize(input.referrer, 500),
    gclid: marketingConsent ? sanitize(input.gclid, 250) : "",
    gbraid: marketingConsent ? sanitize(input.gbraid, 250) : "",
    wbraid: marketingConsent ? sanitize(input.wbraid, 250) : "",
    fbclid: marketingConsent ? sanitize(input.fbclid, 250) : "",
  };
}

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
    const submittedEventId = sanitize(data.eventId, 80);
    const eventId = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(submittedEventId) ? submittedEventId : crypto.randomUUID();
    const marketingConsent = data.marketingConsent === true;
    const attribution = readAttribution(data.attribution, marketingConsent);
    const createdAt = new Date().toISOString();
    const backendReady = hasBookingBackend();
    const key = process.env.RESEND_API_KEY;
    const from = process.env.BOOKING_FROM_EMAIL ?? "Ahmedabad Ink Tattoo <bookings@ahmedabadinktattoo.com>";
    const studioEmail = process.env.STUDIO_EMAIL ?? "ahmedabadinktattoo@gmail.com";
    const emailReady = Boolean(key && from && studioEmail);

    let saved = false;
    if (backendReady) {
      const { error } = await getSupabaseAdmin().from("consultation_enquiries").insert({
        reference,
        created_at: createdAt,
        marketing_event_id: eventId,
        marketing_delivery: { crm: "pending", meta: marketingConsent ? "pending" : "no_consent", attempts: 0 },
        customer_name: name,
        email,
        phone,
        tattoo_style: style,
        placement,
        approximate_size: size,
        idea,
        source: attribution.source,
        medium: attribution.medium,
        campaign: attribution.campaign || null,
        utm_source: attribution.utmSource || null,
        utm_medium: attribution.utmMedium || null,
        utm_campaign: attribution.utmCampaign || null,
        utm_content: attribution.utmContent || null,
        utm_term: attribution.utmTerm || null,
        landing_page: attribution.landingPage || null,
        referrer: attribution.referrer || null,
        gclid: attribution.gclid || null,
        gbraid: attribution.gbraid || null,
        wbraid: attribution.wbraid || null,
        fbclid: attribution.fbclid || null,
        marketing_consent: marketingConsent,
      });
      if (error) {
        console.error("enquiry.database_insert_failed", { code: error.code, message: error.message });
      } else {
        saved = true;
      }
    }

    const marketingIntegration = saved ? runMarketingLeadIntegrations({
      eventId,
      reference,
      createdAt,
      name,
      email,
      phone,
      style,
      placement,
      size,
      marketingConsent,
      attribution,
      eventSourceUrl: attribution.landingPage || new URL("/book", request.url).toString(),
      userAgent: sanitize(request.headers.get("user-agent"), 500),
      clientIp: sanitize(request.headers.get("x-forwarded-for")?.split(",")[0], 64),
      fbp: marketingConsent ? sanitize(cookieValue(request, "_fbp"), 250) : "",
      fbc: marketingConsent ? sanitize(cookieValue(request, "_fbc"), 250) : "",
    }).catch(() => {
      console.error("marketing.delivery_pending", { reference });
      return { crm: "pending", meta: "pending" };
    }) : Promise.resolve({ crm: "not_saved", meta: "not_saved" });

    if (!emailReady) {
      console.warn("enquiry.email_configuration_missing", {
        resend: Boolean(key),
        sender: Boolean(from),
        recipient: Boolean(studioEmail),
        saved,
      });
      if (saved) {
        await marketingIntegration;
        return NextResponse.json({ ok: true, saved: true, notified: false, reference, eventId });
      }
      return NextResponse.json({ error: "Enquiry service is temporarily unavailable." }, { status: 503 });
    }

    const reply = `<div style="font-family:Arial,sans-serif;color:#181714;line-height:1.6"><h1>We received your tattoo enquiry</h1><p>Hi ${escapeHtml(name)},</p><p>Thank you for sharing your idea with Ahmedabad Ink Tattoo. Our team will review the details and reply by email or WhatsApp.</p><p><a href="https://www.ahmedabadinktattoo.com/portfolio">Explore recent work</a> · <a href="https://wa.me/918866848681">Message the studio</a></p></div>`;
    const studio = `<div style="font-family:Arial,sans-serif;color:#181714;line-height:1.6"><h1>New website enquiry</h1><p><strong>Reference:</strong> ${reference}</p><p><strong>${escapeHtml(name)}</strong><br><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a><br><a href="https://wa.me/${whatsappNumber(phone)}">${escapeHtml(phone)}</a></p><p><strong>Style:</strong> ${escapeHtml(style)}<br><strong>Placement:</strong> ${escapeHtml(placement)}<br><strong>Approx. size:</strong> ${escapeHtml(size)}</p><p><strong>Idea</strong><br>${escapeHtml(idea).replace(/\n/g, "<br>")}</p><p><a href="https://www.ahmedabadinktattoo.com/admin#enquiries">Open studio dashboard</a></p></div>`;
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

    await marketingIntegration;

    if (!saved && !notified) return NextResponse.json({ error: "Enquiry could not be saved or sent." }, { status: 500 });
    return NextResponse.json({ ok: true, saved, notified, reference, eventId });
  } catch (error) {
    console.error("enquiry.unexpected_failure", error instanceof Error ? { message: error.message, stack: error.stack } : error);
    return NextResponse.json({ error: "Enquiry could not be sent." }, { status: 500 });
  }
}
