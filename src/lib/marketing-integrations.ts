import { createHash } from "node:crypto";
import type { MarketingAttribution } from "@/lib/attribution";
import { emptyAttribution } from "@/lib/attribution";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type MarketingLead = {
  eventId: string;
  reference: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  style: string;
  placement: string;
  size: string;
  marketingConsent: boolean;
  attribution: MarketingAttribution;
  eventSourceUrl: string;
  userAgent: string;
  clientIp: string;
  fbp: string;
  fbc: string;
};

const sha256 = (value: string) => createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
};

async function syncMarketingCrm(lead: MarketingLead) {
  const url = process.env.MARKETING_CRM_WEBHOOK_URL;
  const secret = process.env.MARKETING_CRM_WEBHOOK_SECRET;
  if (!url || !secret) return "not_configured" as const;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret,
      operation: "upsert",
      lead: {
        reference: lead.reference,
        createdAt: lead.createdAt,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        style: lead.style,
        placement: lead.placement,
        size: lead.size,
        stage: "New",
        marketingConsent: lead.marketingConsent ? "Yes" : "No",
        ...lead.attribution,
      },
    }),
    signal: AbortSignal.timeout(6_000),
  });
  const result = await response.json().catch(() => null) as { ok?: boolean } | null;
  if (!response.ok || !result?.ok) throw new Error(`CRM webhook returned ${response.status} without confirmation`);
  return "sent" as const;
}

async function sendMetaLead(lead: MarketingLead) {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  const pixelId = process.env.META_PIXEL_ID ?? process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!lead.marketingConsent) return "no_consent" as const;
  if (!token || !pixelId) return "not_configured" as const;

  const userData: Record<string, string | string[]> = {
    em: [sha256(lead.email)],
    ph: [sha256(normalizePhone(lead.phone))],
    external_id: [sha256(lead.reference)],
  };
  if (lead.clientIp) userData.client_ip_address = lead.clientIp;
  if (lead.userAgent) userData.client_user_agent = lead.userAgent;
  if (lead.fbp) userData.fbp = lead.fbp;
  if (lead.fbc) userData.fbc = lead.fbc;

  const version = process.env.META_GRAPH_API_VERSION ?? "v25.0";
  const endpoint = new URL(`https://graph.facebook.com/${version}/${pixelId}/events`);
  const body: Record<string, unknown> = {
    data: [{
      event_name: "Lead",
      event_time: Math.floor(new Date(lead.createdAt).getTime() / 1000),
      event_id: lead.eventId,
      action_source: "website",
      event_source_url: lead.eventSourceUrl,
      user_data: userData,
      custom_data: { lead_id: lead.reference, lead_type: "studio_enquiry" },
    }],
  };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(6_000),
  });
  const result = await response.json().catch(() => null) as { events_received?: number } | null;
  if (!response.ok || result?.events_received !== 1) throw new Error(`Meta CAPI did not confirm the event (${response.status})`);
  return "sent" as const;
}

export async function runMarketingLeadIntegrations(lead: MarketingLead) {
  const supabase = getSupabaseAdmin();
  const lockedUntil = new Date(Date.now() + 120_000).toISOString();
  const { data: claimed, error: claimError } = await supabase.from("consultation_enquiries")
    .update({ marketing_locked_until: lockedUntil })
    .eq("reference", lead.reference)
    .or(`marketing_locked_until.is.null,marketing_locked_until.lt.${new Date().toISOString()}`)
    .select("marketing_delivery").maybeSingle();
  if (claimError || !claimed) {
    console.error("marketing.delivery_not_claimed", { reference: lead.reference, code: claimError?.code });
    return { crm: "pending", meta: "pending" };
  }
  const previous = claimed.marketing_delivery as { crm?: string; meta?: string; attempts?: number };
  // Retry only unfinished destinations. Preserve the original Meta time and ID.
  const [crm, meta] = await Promise.allSettled([
    previous.crm === "sent" ? Promise.resolve("sent") : syncMarketingCrm(lead),
    previous.meta === "sent" ? Promise.resolve("sent")
      : !lead.marketingConsent ? Promise.resolve("no_consent")
      : Date.now() - new Date(lead.createdAt).getTime() > 6 * 24 * 60 * 60 * 1000 ? Promise.resolve("expired")
      : sendMetaLead(lead),
  ]);
  const result = {
    crm: crm.status === "fulfilled" ? crm.value : "failed",
    meta: meta.status === "fulfilled" ? meta.value : "failed",
  };
  if (crm.status === "rejected") console.error("marketing.crm_sync_failed", { reference: lead.reference, message: crm.reason instanceof Error ? crm.reason.message : String(crm.reason) });
  if (meta.status === "rejected") console.error("marketing.meta_capi_failed", { reference: lead.reference, message: meta.reason instanceof Error ? meta.reason.message : String(meta.reason) });
  const { error } = await supabase.from("consultation_enquiries").update({
    marketing_delivery: { ...result, attempts: (previous.attempts ?? 0) + 1, last_attempt_at: new Date().toISOString() },
    marketing_locked_until: null,
  }).eq("reference", lead.reference).eq("marketing_locked_until", lockedUntil);
  if (error) console.error("marketing.delivery_status_save_failed", { reference: lead.reference, code: error.code });
  return result;
}

// Called only from an authenticated admin action, never from the public browser.
export async function retryMarketingDelivery(reference: string) {
  const { data, error } = await getSupabaseAdmin().from("consultation_enquiries")
    .select("reference,created_at,marketing_event_id,customer_name,email,phone,tattoo_style,placement,approximate_size,marketing_consent,source,medium,campaign,utm_source,utm_medium,utm_campaign,utm_content,utm_term,landing_page,referrer,gclid,gbraid,wbraid,fbclid")
    .eq("reference", reference).single();
  if (error || !data?.marketing_event_id) throw new Error("This enquiry is not eligible for a delivery retry.");
  const attribution = { ...emptyAttribution(), source: data.source || "direct", medium: data.medium || "direct", campaign: data.campaign || "",
    utmSource: data.utm_source || "", utmMedium: data.utm_medium || "", utmCampaign: data.utm_campaign || "", utmContent: data.utm_content || "", utmTerm: data.utm_term || "",
    landingPage: data.landing_page || "", referrer: data.referrer || "", gclid: data.gclid || "", gbraid: data.gbraid || "", wbraid: data.wbraid || "", fbclid: data.fbclid || "" };
  return runMarketingLeadIntegrations({ eventId: data.marketing_event_id, reference: data.reference, createdAt: data.created_at,
    name: data.customer_name, email: data.email, phone: data.phone, style: data.tattoo_style, placement: data.placement, size: data.approximate_size,
    marketingConsent: data.marketing_consent, attribution, eventSourceUrl: "https://www.ahmedabadinktattoo.com/book", userAgent: "", clientIp: "", fbp: "", fbc: "" });
}
