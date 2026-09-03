import { createHmac } from "node:crypto";
import { getSupabaseAdmin, hasBookingBackend } from "@/lib/supabase-admin";

export function hasTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const requestUrl = new URL(request.url);
    const originUrl = new URL(origin);
    return originUrl.protocol === "https:" && originUrl.host === requestUrl.host || originUrl.hostname === "localhost";
  } catch {
    return false;
  }
}

export function bodyIsWithinLimit(request: Request, maximumBytes: number) {
  const length = Number(request.headers.get("content-length") ?? 0);
  return !Number.isFinite(length) || length <= 0 || length <= maximumBytes;
}

export async function checkWebsiteRateLimit(request: Request, route: string, limit: number, windowSeconds: number) {
  if (!hasBookingBackend()) return true;
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientAddress = forwardedFor || request.headers.get("x-real-ip") || "unknown";
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!salt) return true;
  const fingerprint = createHmac("sha256", salt).update(clientAddress).digest("hex");
  const { data, error } = await getSupabaseAdmin().rpc("check_website_rate_limit", {
    p_fingerprint: fingerprint,
    p_route: route,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("request.rate_limit_check_failed", { route, code: error.code, message: error.message });
    return true;
  }
  return data === true;
}
