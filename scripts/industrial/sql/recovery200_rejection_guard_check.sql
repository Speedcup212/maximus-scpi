-- RECOVERY-200 — contrôle exécutable de la garde des rejets revus (aucune donnée persistée).
-- Exécution : psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/industrial/sql/recovery200_rejection_guard_check.sql
begin;

insert into scpi_internal.metric_certification_rejections
  (scpi_slug, source_period, metric, rejected_value, rejection_status, reason, decided_by)
values ('ficommerce-proximite', '1999-T1', 'parts_attente_retrait', 0, 'invalid_value_contradicted_by_evidence',
        'Contrôle automatique', 'recovery200_rejection_guard_check');

do $check$
declare
  st text;
begin
  -- 1. Un zéro auto-certifié sur une métrique où zéro n'est pas plausible passe en revue.
  insert into public.scpi_metric_certifications (scpi_slug, source_period, metric, value_numeric, source_url, source_page,
    evidence_text, verification_status, verification_method, verified_at)
  values ('ficommerce-proximite', '1999-T1', 'distribution_par_part', 0, 'https://example.invalid/b.pdf', 1,
    'Dividende … 0,00 %', 'auto_verified_with_evidence', 'pdf_page_text_match', now())
  returning verification_status into st;
  assert st = 'review_required_zero_value', 'zéro auto non bloqué : ' || st;

  -- 2. Une valeur rejetée après revue reste rejetée quand l'automate la réécrit.
  insert into public.scpi_metric_certifications (scpi_slug, source_period, metric, value_numeric, source_url, source_page,
    evidence_text, verification_status, verification_method, verified_at)
  values ('ficommerce-proximite', '1999-T1', 'parts_attente_retrait', 0, 'https://example.invalid/b.pdf', 1,
    '0 part en attente', 'auto_verified_with_evidence', 'pdf_page_text_match', now())
  returning verification_status into st;
  assert st = 'invalid_value_contradicted_by_evidence', 'rejet non rejoué à l''insertion : ' || st;

  update public.scpi_metric_certifications set verification_status = 'auto_verified_with_evidence'
  where scpi_slug = 'ficommerce-proximite' and source_period = '1999-T1' and metric = 'parts_attente_retrait'
  returning verification_status into st;
  assert st = 'invalid_value_contradicted_by_evidence', 'rejet levé automatiquement : ' || st;

  -- 3. Une ligne rejetée reste rejetée, valeur comprise, même si l'automate propose une autre valeur.
  update public.scpi_metric_certifications set value_numeric = 1493, verification_status = 'auto_verified_with_evidence'
  where scpi_slug = 'ficommerce-proximite' and source_period = '1999-T1' and metric = 'parts_attente_retrait'
  returning verification_status into st;
  assert st = 'invalid_value_contradicted_by_evidence', 'rejet revalidé automatiquement : ' || st;
  assert (select value_numeric from public.scpi_metric_certifications
          where scpi_slug = 'ficommerce-proximite' and source_period = '1999-T1' and metric = 'parts_attente_retrait') = 0,
         'valeur d''une ligne rejetée remplacée automatiquement';

  -- 3 bis. Une nouvelle ligne avec une valeur différente n'hérite pas d'un rejet de valeur.
  insert into public.scpi_metric_certifications (scpi_slug, source_period, metric, value_numeric, source_url, source_page,
    evidence_text, verification_status, verification_method, verified_at)
  values ('ficommerce-proximite', '1999-T1', 'nombre_associes', 1200, 'https://example.invalid/b.pdf', 1,
    'Nombre d''associés 1 200', 'auto_verified_with_evidence', 'pdf_page_text_match', now())
  returning verification_status into st;
  assert st = 'auto_verified_with_evidence', 'nouvelle valeur bloquée à tort : ' || st;

  -- 4. Une vérification manuelle reste souveraine.
  update public.scpi_metric_certifications set value_numeric = 0, verification_status = 'manual_verified_official'
  where scpi_slug = 'ficommerce-proximite' and source_period = '1999-T1' and metric = 'parts_attente_retrait'
  returning verification_status into st;
  assert st = 'manual_verified_official', 'décision manuelle écrasée : ' || st;

  -- 5. Les décisions de production du 10/11/2026 sont bien appliquées.
  assert not exists (
    select 1 from scpi_internal.metric_certification_rejections x
    join public.scpi_metric_certifications c using (scpi_slug, source_period, metric)
    where x.recovery_task = 'RECOVERY-200' and x.decided_by <> 'recovery200_rejection_guard_check'
      and c.value_numeric = x.rejected_value and c.verification_status not ilike 'manual_verified%'
      and c.verification_status <> x.rejection_status
  ), 'une décision de rejet n''est pas appliquée en base';

  raise notice 'recovery200_rejection_guard_check: 8/8 PASS';
end
$check$;

rollback;
