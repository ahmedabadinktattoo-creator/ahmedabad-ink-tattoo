# Ahmedabad Ink Tattoo

A premium, responsive website for Ahmedabad Ink Tattoo, built with Next.js 15, React 19 and TypeScript.

## Included

- Luxury dark visual system and responsive navigation
- Homepage with studio story, featured work, artists, process and booking CTA
- Filterable tattoo portfolio across eight categories
- Artist directory and statically generated artist profile pages
- Six-step consultation booking flow with live slot checks
- Private tattoo-reference uploads backed by Supabase Storage
- Razorpay deposit order creation and cryptographic payment verification
- Resend email and optional WhatsApp Cloud API confirmations
- Passwordless Supabase Auth for customers and studio administrators
- Customer portal with appointment history, deposit details and aftercare
- Role-protected admin dashboard with bookings, KPIs and revenue summary
- CMS foundations for portfolio, artist profiles and blog posts
- Responsive `next/image` delivery, route metadata, sitemap and robots directives
- Accessible controls, semantic markup and reduced-motion support
- Consent-controlled GA4, Google Tag Manager and Meta Pixel measurement
- Campaign attribution capture for UTM, GCLID/GBRAID/WBRAID and FBCLID
- Optional secure Google Sheet CRM sync and Meta Conversions API delivery

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Without credentials, the booking flow runs in clearly labelled preview mode. To activate real bookings:

1. Copy `.env.example` to `.env.local` and add the server credentials.
2. Link the Supabase project and apply the migration in `supabase/migrations`.
3. Configure Razorpay to send `payment.captured` events to `/api/payments/webhook`.
4. Add the same `RAZORPAY_WEBHOOK_SECRET` to the site environment.
5. Configure the approved `booking_confirmation` WhatsApp template if WhatsApp notifications are required.

## Activate marketing CRM and conversion tracking

1. Apply the latest Supabase migration so website enquiries can store marketing attribution and consent.
2. Deploy the Google Apps Script in `google-apps-script/marketing-crm-webhook.gs` using the accompanying README.
3. Add `MARKETING_CRM_WEBHOOK_URL` and `MARKETING_CRM_WEBHOOK_SECRET` to Vercel.
4. Generate a Meta Conversions API token in Events Manager and add it as `META_CAPI_ACCESS_TOKEN` in Vercel. Never use a `NEXT_PUBLIC_` prefix for this token.
5. Use `META_TEST_EVENT_CODE` only during Meta Test Events validation, then remove it.
6. Verify one consented enquiry in GA4 DebugView, Meta Test Events, Supabase and the Marketing CRM before starting paid campaigns.

## Activate Sprint 4 dashboards

1. Create a Supabase project and apply both migrations in timestamp order.
2. Add the project URL and publishable key to the `NEXT_PUBLIC_SUPABASE_*` variables.
3. Add the server-only project URL and service-role key to `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
4. In Supabase Auth URL Configuration, add the production site URL and `/auth/callback` redirect URL.
5. Create the owner account through `/login`, then set `app_metadata.role` to `admin` using the trusted SQL example at the bottom of the Sprint 4 migration.
6. Refresh the owner session after changing the role so the new JWT claim is active.

When Supabase is not configured, `/dashboard` and `/admin` intentionally show labelled preview data. Once configured, both routes require authentication and `/admin` additionally requires the immutable `app_metadata` admin role.

Sensitive booking rows and reference images are server-only. The browser never receives the Supabase service-role key or Razorpay secret.

## Before launch

Replace the editorial placeholder photography and sample artist biographies with approved studio assets and content. Confirm the public domain, studio address, email, social profiles and legal pages before production deployment.
