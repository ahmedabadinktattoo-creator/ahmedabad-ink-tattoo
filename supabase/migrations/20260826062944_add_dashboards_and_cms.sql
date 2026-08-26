alter table public.consultation_bookings add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists consultation_bookings_user_id_idx on public.consultation_bookings (user_id);
grant select on public.consultation_bookings to authenticated;
grant update on public.consultation_bookings to authenticated;

create policy "Customers view their own bookings" on public.consultation_bookings for select to authenticated using ((select auth.uid()) = user_id);
create policy "Admins view all bookings" on public.consultation_bookings for select to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins update bookings" on public.consultation_bookings for update to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create table if not exists public.studio_artists (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
  role text not null, bio text not null default '', specialties text[] not null default '{}',
  image_url text, active boolean not null default true, display_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.portfolio_entries (
  id uuid primary key default gen_random_uuid(), title text not null, category text not null,
  artist_id uuid references public.studio_artists(id) on delete set null, image_url text not null,
  alt_text text not null default '', published boolean not null default false, featured boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null,
  excerpt text not null default '', body text not null default '', cover_image_url text,
  published boolean not null default false, published_at timestamptz, author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists portfolio_entries_artist_id_idx on public.portfolio_entries (artist_id);
create index if not exists blog_posts_author_id_idx on public.blog_posts (author_id);
create index if not exists portfolio_entries_published_idx on public.portfolio_entries (published, created_at desc);
create index if not exists blog_posts_published_idx on public.blog_posts (published, published_at desc);

alter table public.studio_artists enable row level security;
alter table public.portfolio_entries enable row level security;
alter table public.blog_posts enable row level security;
grant select on public.studio_artists, public.portfolio_entries, public.blog_posts to anon, authenticated;
grant insert, update, delete on public.studio_artists, public.portfolio_entries, public.blog_posts to authenticated;
grant all on public.studio_artists, public.portfolio_entries, public.blog_posts to service_role;

create policy "Public reads active artists" on public.studio_artists for select to anon, authenticated using (active or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Public reads published portfolio" on public.portfolio_entries for select to anon, authenticated using (published or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Public reads published posts" on public.blog_posts for select to anon, authenticated using (published or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins manage artists" on public.studio_artists for all to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins manage portfolio" on public.portfolio_entries for all to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins manage posts" on public.blog_posts for all to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into public.studio_artists (slug, name, role, specialties, display_order) values
  ('vishal', 'Vishal', 'Founder & Lead Artist', array['Realism','Portrait','Cover Up'], 1),
  ('aarav', 'Aarav', 'Senior Tattoo Artist', array['Mandala','Geometric','Blackwork'], 2),
  ('mira', 'Mira', 'Fine Line Specialist', array['Fine Line','Minimal','Botanical'], 3)
on conflict (slug) do nothing;

-- Grant admin access by setting app_metadata from a trusted server or the SQL editor:
-- update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb where email = 'owner@example.com';
