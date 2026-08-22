create extension if not exists pgcrypto;

do $$ begin
  create type public.booking_status as enum ('pending_payment', 'confirmed', 'cancelled', 'completed');
exception when duplicate_object then null;
end $$;

create table if not exists public.consultation_bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  email text not null,
  phone text not null,
  artist_slug text not null,
  tattoo_style text not null,
  appointment_date date not null,
  appointment_time time not null,
  placement text not null,
  approximate_size text not null,
  idea text not null check (char_length(idea) between 10 and 1500),
  reference_path text,
  status public.booking_status not null default 'pending_payment',
  deposit_amount integer not null check (deposit_amount > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists one_active_booking_per_slot on public.consultation_bookings (artist_slug, appointment_date, appointment_time) where status in ('pending_payment', 'confirmed');
create index if not exists consultation_bookings_date_idx on public.consultation_bookings (appointment_date);
alter table public.consultation_bookings enable row level security;
revoke all on public.consultation_bookings from anon, authenticated;
grant all on public.consultation_bookings to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('booking-references', 'booking-references', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- No storage.objects policies are intentionally created. Reference images are
-- written and read only by trusted server code using the service-role key.
create or replace function public.set_booking_updated_at()
returns trigger language plpgsql security invoker set search_path = ''
as $$ begin new.updated_at = now(); return new; end $$;

revoke execute on function public.set_booking_updated_at() from public, anon, authenticated;
grant execute on function public.set_booking_updated_at() to service_role;
drop trigger if exists consultation_bookings_updated_at on public.consultation_bookings;
create trigger consultation_bookings_updated_at before update on public.consultation_bookings for each row execute function public.set_booking_updated_at();
