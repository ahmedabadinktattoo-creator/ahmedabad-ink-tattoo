alter table public.consultation_bookings
  add column if not exists notification_delivery jsonb not null default '[]'::jsonb,
  add column if not exists notifications_sent_at timestamptz;

comment on column public.consultation_bookings.notification_delivery is
  'Delivery result for customer/admin email and WhatsApp booking notifications.';
