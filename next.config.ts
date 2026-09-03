import type { NextConfig } from "next";

const contentSecurityPolicy = `
  default-src 'self';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  object-src 'none';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://*.razorpay.com https://*.clarity.ms https://c.bing.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://www.google-analytics.com https://www.google.com https://www.google.co.in https://www.facebook.com https://*.razorpay.com https://*.clarity.ms https://c.bing.com;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com https://www.google.com https://www.google.co.in https://www.facebook.com https://*.razorpay.com https://*.clarity.ms https://c.bing.com;
  frame-src https://*.razorpay.com;
  worker-src 'self' blob:;
  manifest-src 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, " ").trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
