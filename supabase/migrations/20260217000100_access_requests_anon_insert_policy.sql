-- Allow anonymous inserts into access_requests (public request-access form)
create policy "anon_insert_access_requests"
  on public.access_requests
  for insert
  to anon, authenticated
  with check (status = 'PENDING');

-- Admin-only read access
create policy "admin_select_access_requests"
  on public.access_requests
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.role = 'ADMIN'
    )
  );

-- Admin-only update
create policy "admin_update_access_requests"
  on public.access_requests
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.role = 'ADMIN'
    )
  );
