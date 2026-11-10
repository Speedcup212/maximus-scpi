-- RECOVERY-200 (10/11/2026) — certifications automatiques contredites par leur propre extrait
-- (écarts « valeur publiée ≠ valeur certifiée » de metric_public_quality_v1, revus un par un).
insert into scpi_internal.metric_certification_rejections
  (scpi_slug, source_period, metric, rejected_value, rejection_status, reason, evidence_excerpt, decided_by)
values
  ('aestiam-agora', '2026-T2', 'nombre_associes', 467, 'invalid_value_contradicted_by_evidence',
   'Mise en page valeurs-puis-libellés : 7 820 = nombre d''associés, 467 M€ = capitalisation.',
   '829,80 € Prix de retrait 7 820 Nombre d''associés 467 M€ Capitalisation', 'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('coeur-d-europe', '2026-T3', 'td', 3.52, 'invalid_value_contradicted_by_evidence',
   'Le taux de distribution brut 2025 est 6,25 % ; 3,52 % est une autre colonne du même tableau.',
   'Le taux de distribution 6,25 % 8,25 % 5,23 % 3,52 % Taux de distribution brut 2025 (1) Performance Globale Annuelle 2025 (2) TRI 10 ans (3)', 'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('coeur-de-ville', '2026-T3', 'td', 4.85, 'invalid_value_contradicted_by_evidence',
   'Le taux de distribution brut 2025 est 6,20 % ; 4,85 % est le TRI 10 ans.',
   'Le taux de distribution 6,20 % 6,20 % 4,85 % Taux de distribution brut 2025 (1) Performance Globale Annuelle 2025 (2) TRI 10 ans (3)', 'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('cristal-life', '2026-T2', 'nombre_associes', 13291, 'invalid_value_contradicted_by_evidence',
   '13 291 associés au 01/04/2026 (début de trimestre) ; 14 724 au 30/06/2026 (fin du T2).',
   'Nombre d''associés 13 291 Au 01/04/2026 14 724 Au 30/06/2026', 'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('epargne-pierre-europe', '2026-T2', 'nombre_locataires', 5, 'invalid_value_contradicted_by_evidence',
   '« 5 locataires » décrit un seul immeuble multilocataire à Londres, pas la SCPI.',
   'ROYAUME UNI Londres Multilocataires (5 locataires) Bureaux 1 575 m²', 'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('pierval-sante', '2026-T2', 'nombre_locataires', 1, 'invalid_value_contradicted_by_evidence',
   'Le « 1 » est un renvoi de note de bas de page (WALT (1)).',
   'WALT (1) 14,83 ans WALB (2) : 14,00 ans Nombre d''actifs', 'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('pierval-sante', '2026-T2', 'walb', 14.83, 'invalid_value_contradicted_by_evidence',
   '14,83 ans est la WALT ; la WALB est 14,00 ans.',
   'WALT (1) 14,83 ans WALB (2) : 14,00 ans', 'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('primovie', '2026-T2', 'nombre_immeubles', 19, 'invalid_value_contradicted_by_evidence',
   'L''extrait cité traite de fiscalité (micro-foncier) et ne contient aucun nombre d''immeubles.',
   'régime micro-foncier à la condition de détenir également des revenus fonciers provenant d''immeubles détenus « en direct »', 'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('remake-live', '2026-T2', 'nombre_associes', 904, 'invalid_value_contradicted_by_evidence',
   'Mise en page valeurs-puis-libellés : 13 135 = nombre d''associés, 904 M€ = capitalisation.',
   'Au 30/06/2026 13 135 Nombre d''associés 904 M€ de capitalisation', 'claude-session-recovery-200 (revue outillée, non humaine)'),
  ('perial-grand-paris', '2026-T3', 'capitalisation', 441.304564, 'review_required_ambiguous_label',
   '441 304 564 € suit le libellé « Le capital de la SCPI » (capital nominal probable) ; la capitalisation publiée est 484,55 M€.',
   'Le capital de la SCPI 441 304 564 € Capitalisation La taille réelle de votre SCPI', 'claude-session-recovery-200 (revue outillée, non humaine)')
on conflict (scpi_slug, source_period, metric, rejected_value) do nothing;

update public.scpi_metric_certifications c
set verification_status = c.verification_status
from scpi_internal.metric_certification_rejections x
where x.scpi_slug = c.scpi_slug and x.source_period = c.source_period and x.metric = c.metric
  and x.rejected_value = c.value_numeric and c.verification_status not ilike 'manual_verified%'
  and x.decided_at::date = date '2026-11-10';
