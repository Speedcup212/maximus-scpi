-- RECOVERY-200 (10/11/2026) — faux zéro historique trouvé en rejouant les preuves stockées
-- avec le nouveau rapprocheur (supabase/functions/scpi-evidence-certify/matcher.mjs).
insert into scpi_internal.metric_certification_rejections
  (scpi_slug, source_period, metric, rejected_value, rejection_status, reason, evidence_excerpt, decided_by)
values
  ('ncap-education-sante', '2019-T3', 'parts_attente_retrait', 0, 'invalid_value_contradicted_by_evidence',
   'Le tableau cité donne « Parts en attente de retrait 0 part 250 parts » (T2 puis T3 2019) : le 0 retenu est celui du trimestre précédent.',
   'Souscriptions compensant des retraits 0 part 0 part Parts en attente de retrait 0 part 250 parts Cessions / Transferts 0 part 6 parts',
   'claude-session-recovery-200 (revue outillée, non humaine)')
on conflict (scpi_slug, source_period, metric, rejected_value) do nothing;

update public.scpi_metric_certifications
set verification_status = verification_status
where scpi_slug = 'ncap-education-sante'
  and source_period = '2019-T3'
  and metric = 'parts_attente_retrait'
  and value_numeric = 0
  and verification_status not ilike 'manual_verified%';
