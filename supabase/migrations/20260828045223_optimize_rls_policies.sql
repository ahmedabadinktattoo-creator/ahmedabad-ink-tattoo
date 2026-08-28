-- Consolidate overlapping policies and evaluate JWT claims once per statement.
drop policy if exists "Customers view their own bookings" on public.consultation_bookings;
drop policy if exists "Admins view all bookings" on public.consultation_bookings;
drop policy if exists "Admins update bookings" on public.consultation_bookings;

create policy "Customers or admins view bookings"
on public.consultation_bookings for select to authenticated
using ((select auth.uid()) = user_id or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins update bookings"
on public.consultation_bookings for update to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Public reads active artists" on public.studio_artists;
drop policy if exists "Public reads published portfolio" on public.portfolio_entries;
drop policy if exists "Public reads published posts" on public.blog_posts;
drop policy if exists "Admins manage artists" on public.studio_artists;
drop policy if exists "Admins manage portfolio" on public.portfolio_entries;
drop policy if exists "Admins manage posts" on public.blog_posts;

create policy "Readers view active artists" on public.studio_artists for select to anon, authenticated
using (active or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "Readers view published portfolio" on public.portfolio_entries for select to anon, authenticated
using (published or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "Readers view published posts" on public.blog_posts for select to anon, authenticated
using (published or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins insert artists" on public.studio_artists for insert to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins update artists" on public.studio_artists for update to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin') with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins delete artists" on public.studio_artists for delete to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins insert portfolio" on public.portfolio_entries for insert to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins update portfolio" on public.portfolio_entries for update to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin') with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins delete portfolio" on public.portfolio_entries for delete to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins insert posts" on public.blog_posts for insert to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins update posts" on public.blog_posts for update to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin') with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins delete posts" on public.blog_posts for delete to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
