# Marketing operations — Ahmedabad Ink Tattoo

## Owner-confirmed facts (11 September 2026)

- Enquiries are handled personally by the studio owner. Use **Studio owner** as the assignment label; no personal name has been supplied.
- Operating/enquiry-handling hours: **10:00–22:00, daily**, Asia/Kolkata.
- Stated capacity: **30–50 bookings per week**. This is capacity, not a guaranteed acquisition target or confirmed appointment inventory. Check artist availability and session duration before promising a slot.
- Package 1 is approved: campaign attribution, CRM reliability, conversion verification, and enquiry-to-booking measurement. Paid campaign activation is not approved.

## Daily handling procedure

1. At opening, review new enquiries, failed deliveries and overdue follow-ups.
2. Assign each real conversation to Studio owner and record its channel, time and next follow-up date. A phone/WhatsApp click alone is not an enquiry.
3. Qualify only when placement, approximate size, style/reference and a viable date or budget are known. Keep medical/screening details out of marketing records and ad platforms.
4. Move through New → Qualified → Consultation → Deposit → Booked → Completed. Use Follow-up or Lost when applicable, with a brief reason.
5. Record a deposit only after payment is confirmed; mark Booked only after an appointment is confirmed. Record booking date, value and eventual attendance separately.
6. Before closing, review unanswered enquiries and tomorrow's appointments. No unapproved reply-speed promise or broadcast outreach.

## Weekly measurement

Report real enquiries, qualified enquiries, consultations, deposits, confirmed bookings, completed visits and revenue. Separate paid and organic sources. Exclude clearly labelled tests. Compare bookings with the owner's stated capacity before increasing spend.

## Implementation status

- Website deployed on 11 September 2026: consent-aware session attribution preserves the entry page; tracking respects consent; only durably saved enquiries emit a lead. Deployment: `dpl_4PpAS93M59sRVoQfnEuR4vb8dVF1`.
- Production database migration applied. Delivery status and a short retry lease are stored durably. Authenticated administrators can retry incomplete CRM/Meta deliveries without resending emails. This is manual recovery, not an automatic scheduled worker.
- Apps Script webhook version 3 deployed on 11 September at 17:30 IST: repeat deliveries preserve existing staff fields, new enquiries default to Studio owner, spreadsheet formula input is escaped, and paid-source labels recognise common paid media values.
- CRM column AK, **Is Test**, excludes checked internal tests from totals. Existing test rows are marked; the verified summary contains zero real enquiries/bookings. Record real conversations separately from contact clicks.
- Controlled production test `AIT-E-E2825387` on 11 September at 17:19 IST saved successfully. The original `/portfolio` landing page and `qa / test / package1_verification` attribution survived navigation to `/book`. CRM and Meta delivery both reported sent on the first attempt, and GA4 Realtime showed one generate_lead event/key event. This is an internal test, not a customer or booking.
- Google Ads account `765-694-1360`: imported `ahmedabadinktattoo.com - GA4 (web) generate_lead` as Primary, count One, no invented monetary value. The mixed Submit lead form account-default goal remains off because it includes other Business Profile actions. Future campaigns must select only the intended lead action through campaign-specific/custom goals.
- GA4 property `421316530` has contact_phone and contact_whatsapp marked as key events. On 11 September they were not yet offered in the Google Ads import picker; their secondary imports remain unfinished. Do not substitute generic page/click events or create duplicate lead actions.
- Remaining launch gates: verify the phone click on a real phone, finish secondary contact imports, inspect Meta browser/server deduplication, and approve campaign-specific goals and campaign budget. The Meta server acknowledgement alone does not prove browser/server deduplication.
- Automated checks: 11 focused tests passed; lint and production build passed. Keep campaigns paused until remaining verification and launch approval are complete.

## Follow-up verification — 12 September 2026

- Google Ads import picker for property 421316530 still offers only `contact_click` when filtered by `contact_`; neither separate contact event is available. No substitute or duplicate conversion was created.
- Meta Lead event details for 15 August–11 September show one browser event and three server events received, event match quality 7.4/10, and **Event deduplication: Not available**. These aggregate totals do not prove deduplication of the controlled test.
- GitHub pull request: https://github.com/ahmedabadinktattoo-creator/ahmedabad-ink-tattoo/pull/1 . Open against main; all three Vercel preview deployment checks and the preview comment check passed. The owner can review and merge; main was not modified directly.
