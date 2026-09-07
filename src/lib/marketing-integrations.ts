import { createHash } from "node:crypto";
import type { MarketingAttribution } from "@/lib/attribution";

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
  endpoint.searchParams.set("access_token", token);
  const body: Record<string, unknown> = {
    data: [{
      event_name: "Lead",
      event_time: Math.floor(Date.now() / 1000),
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(6_000),
  });
  if (!response.ok) throw new Error(`Meta CAPI returned ${response.status}`);
  return "sent" as const;
}

export async function runMarketingLeadIntegrations(lead: MarketingLead) {
  const [crm, meta] = await Promise.allSettled([syncMarketingCrm(lead), sendMetaLead(lead)]);
  const result = {
    crm: crm.status === "fulfilled" ? crm.value : "failed",
    meta: meta.status === "fulfilled" ? meta.value : "failed",
  };
  if (crm.status === "rejected") console.error("marketing.crm_sync_failed", { reference: lead.reference, message: crm.reason instanceof Error ? crm.reason.message : String(crm.reason) });
  if (meta.status === "rejected") console.error("marketing.meta_capi_failed", { reference: lead.reference, message: meta.reason instanceof Error ? meta.reason.message : String(meta.reason) });
  return result;
}
