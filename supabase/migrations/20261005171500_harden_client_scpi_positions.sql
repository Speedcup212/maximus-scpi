-- MaximusSCPI — Espace client V1
-- Les positions déclarées par un client sont forcément externes.
-- Les futures positions issues d'une souscription Maximus seront écrites côté système
-- (service role / backend de confiance) et ne pourront pas être falsifiées côté client.

drop policy if exists "client_scpi_positions_insert_own" on public.client_scpi_positions;
create policy "client_scpi_positions_insert_own"
  on public.client_scpi_positions
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and source = 'external'
  );

drop policy if exists "client_scpi_positions_update_own" on public.client_scpi_positions;
create policy "client_scpi_positions_update_own"
  on public.client_scpi_positions
  for update
  to authenticated
  using (
    (select auth.uid()) = user_id
    and source = 'external'
  )
  with check (
    (select auth.uid()) = user_id
    and source = 'external'
  );

drop policy if exists "client_scpi_positions_delete_own" on public.client_scpi_positions;
create policy "client_scpi_positions_delete_own"
  on public.client_scpi_positions
  for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    and source = 'external'
  );
