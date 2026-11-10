-- RECOVERY-200 (10/11/2026) — plusieurs relevés de frais coexistent dans scpi_fee_evidence
-- (un par probe_run_id, pour l'audit). La vue expose la dernière décision par SCPI et par
-- nature de frais ; l'historique complet reste dans la table.
create or replace view public.scpi_fee_evidence_current
with (security_invoker = true) as
select distinct on (scpi_slug, fee_kind) *
from public.scpi_fee_evidence
order by scpi_slug, fee_kind, created_at desc, probe_run_id desc;

revoke all on public.scpi_fee_evidence_current from anon, authenticated;
comment on view public.scpi_fee_evidence_current is
  'RECOVERY-200 : dernière preuve de frais par SCPI et nature de frais (lecture service_role).';
