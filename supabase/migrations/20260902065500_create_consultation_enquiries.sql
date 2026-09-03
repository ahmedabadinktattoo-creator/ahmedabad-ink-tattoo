create table if not exists public.consultation_enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  customer_name text not null,
  email text not null,
  phone text not null,
  tattoo_style text not null,
  placement text not null,
  approximate_size text not null,
  idea text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'booked', 'closed')),
  source text not null default 'website',
  notification_delivery jsonb not null default '{}'::jsonb,
  notifications_sent_at timestamptz
);

create index if not exists consultation_enquiries_created_at_idx
  on public.consultation_enquiries (created_at desc);
create index if not exists consultation_enquiries_status_idx
  on public.consultation_enquiries (status);

alter table public.consultation_enquiries enable row level security;
revoke all on public.consultation_enquiries from anon, authenticated;
grant all on public.consultation_enquiries to service_role;
grant select, update on public.consultation_enquiries to authenticated;

create policy "Admins view all enquiries"
on public.consultation_enquiries for select to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins update enquiries"
on public.consultation_enquiries for update to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
