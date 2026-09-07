alter table public.consultation_enquiries
  add column if not exists medium text,
  add column if not exists campaign text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists landing_page text,
  add column if not exists referrer text,
  add column if not exists gclid text,
  add column if not exists gbraid text,
  add column if not exists wbraid text,
  add column if not exists fbclid text,
  add column if not exists marketing_consent boolean not null default false;

create index if not exists consultation_enquiries_campaign_idx
  on public.consultation_enquiries (source, medium, campaign);

create index if not exists consultation_enquiries_gclid_idx
  on public.consultation_enquiries (gclid)
  where gclid is not null;

create index if not exists consultation_enquiries_fbclid_idx
  on public.consultation_enquiries (fbclid)
  where fbclid is not null;

comment on column public.consultation_enquiries.marketing_consent is
  'Explicit permission for advertising measurement. Never use this table for medical or screening answers.';
