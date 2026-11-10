-- RECOVERY-200 (10/11/2026) — certifications T3 « prouvées » mais fausses, détectées par la simulation
-- de promotion par métrique (sauts > 30 % ou TOF hors bornes), revues sur leur extrait.
insert into scpi_internal.metric_certification_rejections
  (scpi_slug, source_period, metric, rejected_value, rejection_status, reason, evidence_excerpt, decided_by)
values
  ('atream-hotel', '2026-T3', 'endettement', 40, 'invalid_value_contradicted_by_evidence',
   '40 % est le plafond statutaire d''endettement, pas le ratio constaté (22,86 % au T2).',
   'Pour rappel, ratio d''endettement max. 40 %.', 'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('atream-hotel', '2026-T3', 'nombre_parts', 6195, 'invalid_value_contradicted_by_evidence',
   '6 195 est le nombre d''associés ; le nombre de parts est 330 294.',
   'Nombre d''associés 6 048 6 195 Nombre de parts 327 606 parts 330 294 parts', 'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('primovie', '2026-T3', 'endettement', 40, 'invalid_value_contradicted_by_evidence',
   '40 % est la limite statutaire de recours à l''endettement, pas le ratio constaté (30,1 % au T2).',
   'La SCPI Primovie peut recourir à l''endettement pour le financement de ses investissements dans la limite de 40 %', 'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('novaxia-neo', '2026-T3', 'parts_attente_retrait', 26, 'invalid_value_contradicted_by_evidence',
   'Le bulletin indique 170 415 parts en attente au 30/09/2026 (7,45 % des parts) ; 26 n''est pas ce chiffre.',
   'Parts en attente de retrait au 30/09/26 (soit 7,45 % des parts totales) 170 415', 'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('novaxia-neo', '2026-T3', 'tof', 3, 'invalid_value_contradicted_by_evidence',
   'Le TOF publié est 88,3 % ; 3 % est une ligne de répartition sectorielle.',
   '85,6 % TOP 85,6 % 11,7 % 2,7 % 88 ,3 % TOF', 'claude-session-recovery-200 (revue outillée, non humaine)')
on conflict (scpi_slug, source_period, metric, rejected_value) do nothing;

update public.scpi_metric_certifications c
set verification_status = c.verification_status
from scpi_internal.metric_certification_rejections x
where x.scpi_slug = c.scpi_slug and x.source_period = c.source_period and x.metric = c.metric
  and x.rejected_value = c.value_numeric and c.verification_status not ilike 'manual_verified%'
  and x.source_period = '2026-T3' and x.scpi_slug in ('atream-hotel', 'primovie', 'novaxia-neo');
