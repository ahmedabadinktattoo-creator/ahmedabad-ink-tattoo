drop policy if exists "Admins view all enquiries" on public.consultation_enquiries;
drop policy if exists "Admins update enquiries" on public.consultation_enquiries;

create policy "Admins view all enquiries"
on public.consultation_enquiries for select to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins update enquiries"
on public.consultation_enquiries for update to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
