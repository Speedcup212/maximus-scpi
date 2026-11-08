-- RECOVERY-182 — semantic proof mismatches, not missing-document shortcuts.
-- This view raises REVIEW alerts only. It is not a financial certifier and
-- must never automatically "correct" a value from a flattened PDF excerpt.
CREATE OR REPLACE VIEW maximus_agents.scpi_semantic_evidence_review_v1
WITH (security_invoker=true) AS
WITH extracts AS (
 SELECT c.id AS certificate_id,c.scpi_slug,c.source_period,c.metric,
   c.value_numeric AS recorded_value,c.verification_status,
   c.source_url,c.source_page,left(c.evidence_text,500) AS evidence_excerpt,
   (regexp_match(c.evidence_text,
     'Valeur[[:space:]]+de[[:space:]]+reconstitution[[:space:]]+([0-9]+[.,][0-9]+)','i'))[1] AS labelled_reconstitution,
   (regexp_match(c.evidence_text,
     '([0-9]+[.,][0-9]+)[[:space:]]*€[[:space:]]+Valeur[[:space:]]+de[[:space:]]+réalisation','i'))[1] AS labelled_realisation,
   (regexp_match(c.evidence_text,
     '([0-9]+)[[:space:]]*M€[[:space:]]+Collecte[[:space:]]+nette','i'))[1] AS labelled_collecte,
   c.evidence_text ~* 'WALB résiduelle de cet actif' AS refers_to_one_asset,
   c.evidence_text ~* 'Végétalisation de [0-9]+ immeubles' AS refers_to_sustainability_project,
   c.evidence_text ~* '6[[:space:]]*%[[:space:]]+PGA' AS refers_to_pga_target
 FROM public.scpi_metric_certifications c
 WHERE c.source_page>0 AND c.evidence_text IS NOT NULL
   AND c.value_numeric IS NOT NULL
   AND c.verification_status='auto_verified_with_evidence'
   AND c.metric IN ('prix_reconstitution','valeur_realisation',
      'collecte_nette','nombre_immeubles','walb','td')
), flags AS (
 SELECT e.*,
   CASE
    WHEN e.metric='prix_reconstitution' AND e.labelled_reconstitution IS NOT NULL AND
       replace(e.labelled_reconstitution,',','.')::numeric<>e.recorded_value
     THEN 'LABEL_NUMBER_MISMATCH_RECONSTITUTION'
    WHEN e.metric='valeur_realisation' AND e.labelled_realisation IS NOT NULL AND
       replace(e.labelled_realisation,',','.')::numeric<>e.recorded_value
     THEN 'LABEL_NUMBER_MISMATCH_REALISATION'
    WHEN e.metric='collecte_nette' AND e.labelled_collecte IS NOT NULL AND
       replace(e.labelled_collecte,',','.')::numeric*1000000<>e.recorded_value
     THEN 'LABEL_NUMBER_MISMATCH_COLLECTE'
    WHEN e.metric='nombre_immeubles' AND e.refers_to_sustainability_project
     THEN 'SINGLE_PROJECT_NOT_FUND_PORTFOLIO'
    WHEN e.metric='walb' AND e.refers_to_one_asset
     THEN 'SINGLE_ASSET_NOT_FUND_WALB'
    WHEN e.metric='td' AND e.recorded_value=6 AND e.refers_to_pga_target
     THEN 'PGA_TARGET_NOT_DISTRIBUTION'
    ELSE NULL END AS review_reason
 FROM extracts e
)
SELECT f.certificate_id,f.scpi_slug,f.source_period,f.metric,f.recorded_value,
  f.source_url,f.source_page,f.evidence_excerpt,f.review_reason,
  'SUSPECTED_REQUIRES_INDEPENDENT_QA'::text AS review_status,
  false::boolean AS changes_financial_data,
  false::boolean AS authorizes_certification
FROM flags f WHERE f.review_reason IS NOT NULL;
REVOKE ALL ON maximus_agents.scpi_semantic_evidence_review_v1
  FROM PUBLIC,anon,authenticated;
COMMENT ON VIEW maximus_agents.scpi_semantic_evidence_review_v1 IS
 'Non-authoritative PDF flattening anomaly candidates. Label proximity alone can be misleading in multi-column layouts; mandatory independent page QA before numeric change.';

CREATE OR REPLACE FUNCTION maximus_agents.quarantine_transitions_europe_t3_semantics_v1()
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO pg_catalog,maximus_agents AS $func$
DECLARE certified integer; changed integer; historical integer; proof_count integer;
  documented text := 'https://www.arkea-reim.com/upload/docs/application/pdf/2026-10/te_t3-2026.pdf';
  pdf_sha text := '55f3596af5933891f0e94cf59356491a93931f080543d5c3ee5e8eef89ace1e1';
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('RECOVERY182:transitions-europe:2026-T3'));
 SELECT count(*)::int INTO certified FROM public.scpi_metric_certifications
 WHERE scpi_slug='transitions-europe' AND source_period='2026-T3'
  AND metric IN ('prix_reconstitution','valeur_realisation','collecte_nette','nombre_immeubles','walb','td')
  AND verification_status='invalid_semantic_mismatch_pending_qa';
 IF certified=6 THEN
    RETURN jsonb_build_object('updated',0,'already_quarantined',true,
      'financial_value_changes',0,'certifications_granted',0);
 ELSIF certified>0 THEN
    RAISE EXCEPTION 'RECOVERY182_PARTIAL_QUARANTINE_REQUIRES_REVIEW';
 END IF;

 SELECT count(*)::int INTO proof_count
 FROM maximus_agents.scpi_bulletin_replay_documents d
 JOIN public.scpi_source_connectors host ON host.scpi_slug=d.scpi_slug
 WHERE d.scpi_slug='transitions-europe' AND d.source_period='2026-T3'
   AND d.source_url=documented AND d.pdf_sha256=pdf_sha
   AND d.status='extracted' AND d.processing_complete IS TRUE
   AND d.result->>'identity_verified'='true'
   AND d.result->>'period_verified'='true'
   AND d.result->>'sha256'=pdf_sha
   AND 'www.arkea-reim.com'=ANY(host.allowed_hosts);
 IF proof_count<>1 THEN RAISE EXCEPTION 'RECOVERY182_EXACT_PDF_PROOF_MISSING'; END IF;

 IF NOT EXISTS(
  SELECT 1 FROM public.scpi_indicator_history h
  WHERE h.scpi_slug='transitions-europe' AND h.source_period='2026-T3'
    AND h.qa_status='auto_verified_product_alias_period_tof'
    AND h.source_url=documented AND h.tof=97.9
    AND h.prix_reconstitution=229.27 AND h.valeur_realisation=181.8
    AND h.collecte_nette=142000000 AND h.nombre_immeubles=6
    AND h.walb=6.76 AND h.td=6
 ) THEN RAISE EXCEPTION 'RECOVERY182_HISTORY_CHANGED_STOP'; END IF;

 -- Quarantine requires all six suspect labels/context clues to match exactly.
 SELECT count(*)::int INTO certified
 FROM public.scpi_metric_certifications c
 WHERE c.scpi_slug='transitions-europe' AND c.source_period='2026-T3'
  AND c.source_url=documented AND c.verification_status='auto_verified_with_evidence'
  AND c.source_page>0 AND c.extraction_confidence>=.95
  AND (
    (c.metric='prix_reconstitution' AND c.value_numeric=229.27
       AND c.evidence_text LIKE '%Valeur de reconstitution 208.43 €%')
    OR
    (c.metric='valeur_realisation' AND c.value_numeric=181.8
       AND c.evidence_text LIKE '%178.95 € Valeur de réalisation%')
    OR
    (c.metric='collecte_nette' AND c.value_numeric=142000000
       AND c.evidence_text LIKE '%116 M€ Collecte nette sur le trimestre%')
    OR
    (c.metric='nombre_immeubles' AND c.value_numeric=6
       AND c.evidence_text LIKE '%Végétalisation de 6 immeubles%')
    OR
    (c.metric='walb' AND c.value_numeric=6.76
       AND c.evidence_text LIKE '%WALB résiduelle de cet actif est de 6.76 ans%')
    OR
    (c.metric='td' AND c.value_numeric=6
       AND c.evidence_text LIKE '%6 % PGA 2 cible long terme%')
  );
 IF certified<>6 THEN RAISE EXCEPTION 'RECOVERY182_SIX_SEMANTIC_PROOFS_NOT_VERIFIED'; END IF;

 UPDATE public.scpi_metric_certifications c
 SET verification_status='invalid_semantic_mismatch_pending_qa'
 WHERE c.scpi_slug='transitions-europe' AND c.source_period='2026-T3'
   AND c.verification_status='auto_verified_with_evidence'
   AND c.metric IN ('prix_reconstitution','valeur_realisation','collecte_nette','nombre_immeubles','walb','td');
 GET DIAGNOSTICS changed=ROW_COUNT;
 IF changed<>6 THEN RAISE EXCEPTION 'RECOVERY182_CERTIFICATE_COUNT_CHANGED'; END IF;

 UPDATE public.scpi_indicator_history h
 SET qa_status='invalid_semantic_mismatch_pending_qa'
 WHERE h.scpi_slug='transitions-europe' AND h.source_period='2026-T3'
   AND h.qa_status='auto_verified_product_alias_period_tof'
   AND h.source_url=documented;
 GET DIAGNOSTICS historical=ROW_COUNT;
 IF historical<>1 THEN RAISE EXCEPTION 'RECOVERY182_HISTORY_NOT_QUARANTINED'; END IF;

 INSERT INTO public.scpi_ingestion_events(
  scpi_slug,status,step,message,bulletin_url,source_period,
  extraction_confidence,metrics_count,ended_at)
 VALUES(
 'transitions-europe','needs_review','recovery182_semantic_metric_quarantine',
 'Before: six auto_verified_with_evidence certificates and history auto_verified_product_alias_period_tof; after six invalid_semantic_mismatch_pending_qa + history invalid_semantic_mismatch_pending_qa. Values unchanged. Archived PDF SHA256='||pdf_sha||
 '; p12 reconstitution 229.27 vs issuer labelled 208.43, realization 181.80 vs 178.95; p5 142M investments vs 116M collecte; p8 WALB specific asset; p22 vegetalisation six buildings not entire portfolio; p7 PGA 6% objective not TD. Independent QA required.',
 documented,'2026-T3',1,6,now());
 RETURN jsonb_build_object('updated_certificates',changed,
   'quarantined_history_rows',historical,'financial_value_changes',0,
   'certifications_granted',0,'deploy_allowed',false,
   'qa_required',true,'document_sha256',pdf_sha);
END
$func$;
REVOKE ALL ON FUNCTION maximus_agents.quarantine_transitions_europe_t3_semantics_v1()
 FROM PUBLIC,anon,authenticated;
COMMENT ON FUNCTION maximus_agents.quarantine_transitions_europe_t3_semantics_v1() IS
 'One-shot fail-closed quarantine of six falsely auto-verified T3 Transitions Europe evidence label/context conflicts. Original numeric data retained only for audit, no false replacement.';
