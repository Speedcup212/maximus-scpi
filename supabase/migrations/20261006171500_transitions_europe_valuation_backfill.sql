-- Backfill des donnees de valorisation officielles de Transitions Europe.
-- Seules les valeurs explicitement publiees par Arkea REIM sont renseignees.
-- Les valeurs de realisation non publiees pour certains trimestres restent NULL.

with valuation(source_period, prix_souscription, prix_reconstitution, valeur_realisation) as (
  values
    ('2023-T1', 200.00::numeric, 199.95::numeric, 167.20::numeric),
    ('2023-T2', 200.00::numeric, 208.20::numeric, null::numeric),
    ('2023-T3', 200.00::numeric, 208.35::numeric, null::numeric),
    ('2023-T4', 200.00::numeric, 201.65::numeric, 171.36::numeric),
    ('2024-T1', 200.00::numeric, 203.39::numeric, null::numeric),
    ('2024-T2', 200.00::numeric, 205.37::numeric, null::numeric),
    ('2024-T3', 200.00::numeric, 207.14::numeric, 176.38::numeric),
    ('2024-T4', 200.00::numeric, 205.84::numeric, 175.37::numeric),
    ('2025-T1', 200.00::numeric, 208.52::numeric, 178.83::numeric),
    ('2025-T2', 200.00::numeric, 207.03::numeric, 178.53::numeric),
    ('2025-T3', 200.00::numeric, 207.02::numeric, 177.48::numeric),
    ('2025-T4', 202.00::numeric, 207.49::numeric, 177.87::numeric),
    ('2026-T1', 202.00::numeric, 208.71::numeric, 179.69::numeric)
)
update public.scpi_indicator_history h
set
  prix_souscription = v.prix_souscription,
  prix_reconstitution = v.prix_reconstitution,
  valeur_realisation = coalesce(v.valeur_realisation, h.valeur_realisation)
from valuation v
where h.scpi_slug = 'transitions-europe'
  and h.source_period = v.source_period;

with valuation(source_period, prix_souscription, prix_reconstitution, valeur_realisation) as (
  values
    ('2023-T1', 200.00::numeric, 199.95::numeric, 167.20::numeric),
    ('2023-T2', 200.00::numeric, 208.20::numeric, null::numeric),
    ('2023-T3', 200.00::numeric, 208.35::numeric, null::numeric),
    ('2023-T4', 200.00::numeric, 201.65::numeric, 171.36::numeric),
    ('2024-T1', 200.00::numeric, 203.39::numeric, null::numeric),
    ('2024-T2', 200.00::numeric, 205.37::numeric, null::numeric),
    ('2024-T3', 200.00::numeric, 207.14::numeric, 176.38::numeric),
    ('2024-T4', 200.00::numeric, 205.84::numeric, 175.37::numeric),
    ('2025-T1', 200.00::numeric, 208.52::numeric, 178.83::numeric),
    ('2025-T2', 200.00::numeric, 207.03::numeric, 178.53::numeric),
    ('2025-T3', 200.00::numeric, 207.02::numeric, 177.48::numeric),
    ('2025-T4', 202.00::numeric, 207.49::numeric, 177.87::numeric),
    ('2026-T1', 202.00::numeric, 208.71::numeric, 179.69::numeric)
),
metrics as (
  select source_period, 'prix_souscription'::text as metric, prix_souscription as value_numeric from valuation
  union all
  select source_period, 'prix_reconstitution', prix_reconstitution from valuation
  union all
  select source_period, 'valeur_realisation', valeur_realisation from valuation where valeur_realisation is not null
)
insert into public.scpi_metric_certifications (
  scpi_slug,
  source_period,
  metric,
  value_numeric,
  value_text,
  unit,
  source_url,
  source_page,
  evidence_text,
  bulletin_id,
  verification_status,
  verification_method,
  extraction_confidence,
  verified_at
)
select
  'transitions-europe',
  m.source_period,
  m.metric,
  m.value_numeric,
  null,
  '€',
  h.source_url,
  null,
  'Backfill manuel depuis le document officiel Arkea REIM de la periode ; valeur recoupee avant publication dans la trajectoire.',
  null,
  'manual_verified_official',
  'manual_official_backfill_2026_10_06',
  1.0,
  now()
from metrics m
join public.scpi_indicator_history h
  on h.scpi_slug = 'transitions-europe'
 and h.source_period = m.source_period
on conflict (scpi_slug, source_period, metric)
do update set
  value_numeric = excluded.value_numeric,
  value_text = excluded.value_text,
  unit = excluded.unit,
  source_url = excluded.source_url,
  source_page = excluded.source_page,
  evidence_text = excluded.evidence_text,
  verification_status = excluded.verification_status,
  verification_method = excluded.verification_method,
  extraction_confidence = excluded.extraction_confidence,
  verified_at = excluded.verified_at;
