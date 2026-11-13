-- RECOVERY-205 : politique de confidentialité du 13/11/2026.
-- Les statistiques de mesure d'audience (funnel_events) sont conservées
-- 25 mois au maximum. Purge quotidienne à 03:17 (UTC).
-- Appliquée en production le 13/11/2026 (version 20261113104709, job pg_cron 76).
select cron.schedule(
  'funnel-events-retention-25-mois',
  '17 3 * * *',
  $$delete from public.funnel_events where created_at < now() - interval '25 months'$$
);
