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
- Responsive `next/image` delivery, route metadata, sitemap and robots directives
- Accessible controls, semantic markup and reduced-motion support

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

Sensitive booking rows and reference images are server-only. The browser never receives the Supabase service-role key or Razorpay secret.

## Before launch

Replace the editorial placeholder photography and sample artist biographies with approved studio assets and content. Confirm the public domain, studio address, email, social profiles and legal pages before production deployment.
