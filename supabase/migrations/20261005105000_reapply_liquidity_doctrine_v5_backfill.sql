-- MaximusSCPI — backfill de cohérence après doctrine de liquidité v5
--
-- Cette migration est volontairement idempotente. Elle rejoue la doctrine v5
-- et le nettoyage public sur toutes les analyses existantes afin d'éviter qu'une
-- ligne historique restée en v4 conserve une alerte de liquidité élevée sans le
-- format/certification attendu par le gate de build.
--
-- Les fonctions appelées sont définies par
-- 20260930150000_liquidity_doctrine_v5.sql.

do $backfill$
declare
  r record;
begin
  for r in
    select scpi_slug
    from public.scpi_bulletin_analysis
    order by scpi_slug
  loop
    perform public.enforce_scpi_liquidity_doctrine_v5(r.scpi_slug);
    perform public.enforce_scpi_public_risk_cleanup_v5(r.scpi_slug);
  end loop;
end;
$backfill$;
