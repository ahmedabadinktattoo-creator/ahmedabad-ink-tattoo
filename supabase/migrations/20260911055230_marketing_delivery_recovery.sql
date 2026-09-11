-- Persist delivery intent in the same insert as the enquiry. Existing enquiries
-- remain unqueued: do not replay historical leads into advertising platforms.
alter table public.consultation_enquiries
  add column if not exists marketing_event_id uuid,
  add column if not exists marketing_delivery jsonb not null default '{}'::jsonb,
  add column if not exists marketing_locked_until timestamptz;

comment on column public.consultation_enquiries.marketing_delivery is
  'Per-destination delivery result, attempts and last-attempt time. Pending/failed deliveries can be retried by a studio admin; no medical details or API credentials.';
