# Growth readiness — 21 September 2026

## Verified

- Browser submission on 20 September: AIT-E-E2D78137, labelled Studio QA Test. Visible in authenticated admin. Both customer and studio emails delivered to the studio's own address according to Resend. Do not count it as a real lead.
- Resend sending domain verified.
- Bigin already has Tattoo Enquiries pipeline: New Enquiry, Qualified, Consultation Scheduled, Consultation Completed, Design / Quote, Deposit Pending, Booked, Aftercare Follow-up, Journey Completed, Not Proceeding.
- Bigin Messages shows Connect Now: WhatsApp is not connected. On 20 September the account showed two days remaining in Premier trial. Do not migrate/delete the existing WhatsApp account or buy a plan without owner approval.
- The active website CRM integration is a Google Sheets/Apps Script workflow, not proof of a Bigin connection. Do not create a second automatic lead destination until the owner chooses the CRM of record.
- Full-domain Search Console overview on 21 September: 16 indexed pages, 32 not indexed, no Core Web Vitals field data. The earlier non-www-only report undercounts the canonical website. These counts include legacy URLs and redirects and are not all errors.
- Main sitemap successfully read on 18 September. Legacy image-sitemap submission could not be fetched.

## Website fixes

- Normalise Indian mobile numbers in admin and transactional email WhatsApp links.
- Preserve explicit international prefixes.
- Redirect five known legacy paths to relevant current pages; do not redirect arbitrary missing pages to the homepage.
- Canonical www sitemap automatically includes every published journal post and artist profile; do not invent modification dates.
- Restore AVIF/WebP negotiation and avoid auth round trips on public content; retain sessions on private/account/API routes.

## Organic content drafts — owner review required

Use the existing Canva master: https://www.canva.com/d/gN199lRUJAt2Jra
Do not publish without checking client photo permission and exact artist credit.

1. Portfolio post: “A tattoo begins with an idea that matters to you. Explore original work from Ahmedabad Ink Tattoo in Nikol, then tell us your preferred placement and approximate size. Start your consultation through the link in our bio.”
   Asset: one approved original tattoo photo; no AI changes to the tattoo. Confirm artist credit before caption approval.
   Link: https://www.ahmedabadinktattoo.com/book?utm_source=instagram&utm_medium=organic&utm_campaign=portfolio_series
   Metric: qualified enquiries, not likes.
2. Artist introduction: “Meet Kartik at Ahmedabad Ink Tattoo. Browse his work, bring your references, and start a conversation about a design that feels personal to you.”
   Asset: approved Kartik portrait and matching artist master. No invented awards or specialities.
   Link: https://www.ahmedabadinktattoo.com/artists/kartik?utm_source=instagram&utm_medium=organic&utm_campaign=artist_series
   Metric: profile-to-enquiry journeys.
3. Booking FAQ carousel: “Not ready for a call? Share your idea through our private enquiry form. Placement, approximate size and a few words about your idea help us guide the next step.”
   Slides: Your idea / Placement / Approximate size / Send your enquiry.
   Link: https://www.ahmedabadinktattoo.com/book?utm_source=facebook&utm_medium=organic&utm_campaign=booking_faq
   Metric: successfully saved enquiries.
4. Testimonial template: use an exact verified Google review, client display name and source link. No review text or rating has been invented for this draft.

## Remaining launch gates

- Owner chooses existing Sheets CRM or Bigin as the primary system; no paid upgrade assumed.
- Mark this test as Is Test in the active CRM and exclude it from reports. Do not delete historical records.
- Check phone and WhatsApp opening on the owner's phone.
- Confirm GA4/Meta live event reception and browser/server deduplication; code tests and server acknowledgements are not full live-platform verification.
- Review unused Search Console ownership token before any removal; no access change made.
- Recheck PageSpeed mobile lab score; field data is currently unavailable.
- Review drafts, image permissions and artist credit before public publishing.
- Keep paid campaigns unpublished until the separate marketing task's remaining approval and WhatsApp checks are resolved.
