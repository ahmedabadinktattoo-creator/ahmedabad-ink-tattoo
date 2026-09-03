-- Public enquiry creation is handled by the trusted Next.js server only.
revoke execute on function public.submit_consultation_enquiry(text, text, text, text, text, text, text, text)
from public, anon, authenticated;

create table if not exists public.website_request_limits (
  id bigint generated always as identity primary key,
  fingerprint text not null,
  route text not null,
  requested_at timestamptz not null default now()
);

alter table public.website_request_limits
add column if not exists id bigint generated always as identity;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.website_request_limits'::regclass
      and contype = 'p'
  ) then
    alter table public.website_request_limits
    add constraint website_request_limits_pkey primary key (id);
  end if;
end $$;

create index if not exists website_request_limits_lookup_idx
on public.website_request_limits (fingerprint, route, requested_at desc);

alter table public.website_request_limits enable row level security;
revoke all on public.website_request_limits from public, anon, authenticated;
grant select, insert, delete on public.website_request_limits to service_role;

drop policy if exists "No browser access to request limits" on public.website_request_limits;
create policy "No browser access to request limits"
on public.website_request_limits as restrictive for all to anon, authenticated
using (false) with check (false);

create or replace function public.check_website_rate_limit(
  p_fingerprint text,
  p_route text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  recent_requests integer;
begin
  if length(p_fingerprint) <> 64
    or length(trim(p_route)) < 2
    or p_limit < 1
    or p_limit > 100
    or p_window_seconds < 10
    or p_window_seconds > 86400 then
    return false;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_fingerprint || ':' || p_route, 0));

  delete from public.website_request_limits
  where requested_at < now() - interval '24 hours';

  select count(*) into recent_requests
  from public.website_request_limits
  where fingerprint = p_fingerprint
    and route = p_route
    and requested_at >= now() - make_interval(secs => p_window_seconds);

  if recent_requests >= p_limit then
    return false;
  end if;

  insert into public.website_request_limits (fingerprint, route)
  values (p_fingerprint, p_route);
  return true;
end;
$$;

revoke all on function public.check_website_rate_limit(text, text, integer, integer)
from public, anon, authenticated;
grant execute on function public.check_website_rate_limit(text, text, integer, integer)
to service_role;
