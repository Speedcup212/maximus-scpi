drop policy if exists profiles_self_update on public.profiles;

create or replace function public.update_my_profile(p_full_name text, p_phone text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  update public.profiles
  set full_name = nullif(btrim(p_full_name), ''),
      phone = nullif(btrim(p_phone), ''),
      updated_at = now()
  where user_id = auth.uid();

  if not found then
    raise exception 'Profile not found';
  end if;
end;
$$;

revoke all on function public.update_my_profile(text, text) from public;
revoke all on function public.update_my_profile(text, text) from anon;
grant execute on function public.update_my_profile(text, text) to authenticated;
