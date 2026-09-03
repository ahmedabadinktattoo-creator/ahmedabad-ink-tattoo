create or replace function public.submit_consultation_enquiry(
  p_reference text,
  p_customer_name text,
  p_email text,
  p_phone text,
  p_tattoo_style text,
  p_placement text,
  p_approximate_size text,
  p_idea text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if length(trim(p_reference)) < 8 or length(trim(p_reference)) > 32
    or length(trim(p_customer_name)) < 2 or length(trim(p_customer_name)) > 80
    or length(trim(p_email)) > 160 or trim(p_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or length(trim(p_phone)) < 8 or length(trim(p_phone)) > 24
    or length(trim(p_tattoo_style)) < 2 or length(trim(p_tattoo_style)) > 80
    or length(trim(p_placement)) < 2 or length(trim(p_placement)) > 80
    or length(trim(p_approximate_size)) < 1 or length(trim(p_approximate_size)) > 80
    or length(trim(p_idea)) < 10 or length(trim(p_idea)) > 1500 then
    raise exception 'Invalid enquiry details';
  end if;

  insert into public.consultation_enquiries (
    reference, customer_name, email, phone, tattoo_style, placement, approximate_size, idea
  ) values (
    trim(p_reference), trim(p_customer_name), lower(trim(p_email)), trim(p_phone),
    trim(p_tattoo_style), trim(p_placement), trim(p_approximate_size), trim(p_idea)
  );
end;
$$;

revoke all on function public.submit_consultation_enquiry(text, text, text, text, text, text, text, text) from public;
grant execute on function public.submit_consultation_enquiry(text, text, text, text, text, text, text, text) to anon, authenticated, service_role;
