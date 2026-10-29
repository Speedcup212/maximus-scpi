-- Moniwan is operated by La Française Finance Services, a company of
-- Groupe La Française (publisher's legal CGU, 17/06/2025). This is NOT
-- an ASPIM, aggregator, marketplace or unrelated third-party quote.
-- Trust EXACTLY TWO first-party 2025-T2 issuer-distributed PDFs, not the
-- whole Moniwan domain. Identity, period, SHA, page-by-page and two
-- independent reader requirements remain unchanged. No TOF copy-in.
DO $migration$
DECLARE fn text;fn_oid oid;anchor text :=
 ') SELECT EXISTS(SELECT 1 FROM host,official';
 extra text :=
 '  UNION SELECT ''moniwan.fr'' WHERE '||
 ' (p_slug=''lf-avenir-sante'' AND p_url=''https://www.moniwan.fr/documents/bulletin-trimestriel-scpi-lf-avenir-sante-30062025'')'||
 ' OR (p_slug=''lf-europimmo'' AND p_url=''https://www.moniwan.fr/documents/bulletin-trimestriel-lf-europimmo-30062025'')'||
 E'\n ) SELECT EXISTS(SELECT 1 FROM host,official';
BEGIN
 SELECT p.oid INTO STRICT fn_oid FROM pg_proc p
 JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname='scpi_bulletin_replay_source_trusted';
 fn:=pg_get_functiondef(fn_oid);
 IF position('bulletin-trimestriel-scpi-lf-avenir-sante-30062025' in fn)>0
 THEN RETURN; END IF;
 IF position(anchor in fn)=0 THEN
  RAISE EXCEPTION 'Issuer trust rule template changed - abort without broadening hosts';
 END IF;
 EXECUTE replace(fn,anchor,extra);
END $migration$;

WITH candidates(scpi_slug,source_period,source_url) AS (VALUES
 ('lf-avenir-sante','2025-T2','https://www.moniwan.fr/documents/bulletin-trimestriel-scpi-lf-avenir-sante-30062025'),
 ('lf-europimmo','2025-T2','https://www.moniwan.fr/documents/bulletin-trimestriel-lf-europimmo-30062025')
)
INSERT INTO maximus_agents.scpi_bulletin_replay_documents
 (document_key,scpi_slug,source_period,source_url,origin,status,result)
SELECT 'ref:'||md5(c.scpi_slug||':'||c.source_period||':'||c.source_url),
 c.scpi_slug,c.source_period,c.source_url,
 'backfill_reference','queued',
 jsonb_build_object('discovery',jsonb_build_object(
  'method','issuer_group_moniwan_official_distribution',
  'parent_group','La Française','operator','La Française Finance Services',
  'trust_scope','exact_url_per_fund_period',
  'observed_on','2026-10-29',
  'issuer_document_financial_qa','pending_independent_readers'))
FROM candidates c
WHERE public.scpi_bulletin_replay_source_trusted(c.scpi_slug,c.source_url)
ON CONFLICT(scpi_slug,source_period,source_url) DO NOTHING;
