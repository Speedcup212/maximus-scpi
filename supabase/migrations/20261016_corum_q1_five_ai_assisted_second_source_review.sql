-- Five Q1/2026 price/TOF fields: exact official issuer PDF SHA/pages validated
-- in separate Github original-byte runs 38946639824 and 38948631161.
-- This is a SECOND SOURCE/VALUE TECHNICAL REVIEW (AI-assisted reading of
-- original publisher PDF page contexts), NOT a human financial/legal signoff.
-- Preserve partial overall bulletin and private public-cohort statuses.
DO $pre$
DECLARE eligible integer;
BEGIN
 SELECT count(*) INTO eligible FROM maximus_agents.scpi_universe
 WHERE scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
   AND lifecycle='candidate' AND NOT publication_authorized AND NOT analysis_certified;
 IF eligible<>4 THEN RAISE EXCEPTION 'Expected four private CORUM candidates, got %',eligible; END IF;
 SELECT count(*) INTO eligible
 FROM maximus_agents.scpi_candidate_metric_evidence e
 JOIN public.scpi_metric_certifications c
  ON c.scpi_slug=e.scpi_slug AND c.source_period=e.source_period
   AND c.metric=e.metric AND c.value_numeric=e.numeric_value
   AND c.source_page=e.source_page AND c.source_url=e.source_url
 JOIN public.scpi_bulletins b
  ON b.scpi_slug=e.scpi_slug AND b.period=e.source_period AND b.source_url=e.source_url
 JOIN maximus_agents.scpi_candidate_pdf_validation d
  ON d.scpi_slug=b.scpi_slug AND d.source_period=b.period
   AND d.document_kind='quarterly_bulletin' AND d.source_url=b.source_url
   AND d.pdf_sha256=b.pdf_sha256 AND d.document_identity_verified
   AND e.source_page BETWEEN 1 AND d.page_count
 WHERE e.source_period='2026-T1' AND e.document_kind='quarterly_bulletin'
   AND e.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
   AND ((e.metric='prix_souscription' AND e.numeric_value =
         CASE e.scpi_slug WHEN 'corum-origin' THEN 1135.00
         WHEN 'corum-eurion' THEN 215.00 WHEN 'corum-usa' THEN 200.00 WHEN 'corum-xl' THEN 195.00 ELSE NULL END
         AND e.source_page=3 AND e.unit='EUR_PER_PART')
        OR (e.scpi_slug='corum-origin' AND e.metric='tof'
            AND e.numeric_value=95.71 AND e.source_page=4 AND e.unit='PERCENT'))
   AND e.qa_status='pending_independent_qa'
   AND e.independently_reviewed_at IS NULL
   AND c.verification_status='source_page_verified_pending_independent_review'
   AND b.qa_status='candidate_page_checked_partial'
   AND b.pdf_sha256 ~ '^[a-f0-9]{64}$'
   AND e.evidence_text LIKE '%exact official PDF SHA-256%';
 IF eligible<>5 THEN RAISE EXCEPTION 'Refuse to review changed/unverified Q1 sources: %/5',eligible; END IF;
END $pre$;

WITH expected(scpi_slug,metric) AS (VALUES
 ('corum-origin','prix_souscription'),('corum-eurion','prix_souscription'),
 ('corum-usa','prix_souscription'),('corum-xl','prix_souscription'),('corum-origin','tof'))
UPDATE maximus_agents.scpi_candidate_metric_evidence e
 SET qa_status='qa_pass',
 independently_reviewed_at=now(),
 independently_reviewed_by='AI-assisted second original-PDF page/context review; NOT statutory signoff',
 evidence_text=e.evidence_text ||
 '; second cross-read of original CORUM publisher SHA-identical PDF page from GitHub runs 38946639824 and 38948631161. '||
 ' Technical numeric QA only; independent human legal/financial final audit still required.'
FROM expected x
WHERE e.scpi_slug=x.scpi_slug AND e.metric=x.metric
 AND e.source_period='2026-T1' AND e.document_kind='quarterly_bulletin'
 AND e.qa_status='pending_independent_qa'
 AND e.independently_reviewed_at IS NULL;

WITH expected(scpi_slug,metric) AS (VALUES
 ('corum-origin','prix_souscription'),('corum-eurion','prix_souscription'),
 ('corum-usa','prix_souscription'),('corum-xl','prix_souscription'),('corum-origin','tof'))
UPDATE public.scpi_metric_certifications c
 SET verification_status='ai_assisted_exact_primary_pdf_rechecked',
 verification_method='two_source_parsers_original_SHA_PDF_page_20261016; NOT human final approval',
 evidence_text=c.evidence_text ||
 ' | Original issuer file independently re-downloaded and SHA checked GitHub Actions run 38948631161;'||
 ' original page context checked GitHub Actions run 38946639824;'||
 ' AI-assisted technical verification only (not an independent statutory compliance signature).',
 verified_at=now()
FROM expected x
WHERE c.scpi_slug=x.scpi_slug AND c.metric=x.metric
 AND c.source_period='2026-T1'
 AND c.verification_status='source_page_verified_pending_independent_review';

-- The 24 Q1 verified metric values (6 per fund) are reflected in the REAL
-- original bulletins' metrics JSON; no QA status is upgraded here.
DO $no_conflict$
DECLARE conflicts integer;
BEGIN
 WITH matched AS (
  SELECT b.id,e.scpi_slug,e.numeric_value,
    CASE WHEN e.metric='distribution_brute_par_part' THEN 'distribution_par_part'
    ELSE e.metric END AS data_key,
    b.extraction_json->'metrics' AS payload
  FROM maximus_agents.scpi_candidate_metric_evidence e
  JOIN public.scpi_bulletins b
   ON b.scpi_slug=e.scpi_slug AND b.period=e.source_period
    AND b.source_url=e.source_url
  JOIN maximus_agents.scpi_candidate_pdf_validation d
   ON d.scpi_slug=e.scpi_slug AND d.source_period=e.source_period
    AND d.document_kind='quarterly_bulletin' AND d.document_identity_verified
    AND d.pdf_sha256=b.pdf_sha256 AND d.source_url=b.source_url
    AND e.source_page BETWEEN 1 AND d.page_count
  WHERE e.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
    AND e.source_period='2026-T1' AND e.qa_status='qa_pass'
    AND e.independently_reviewed_at IS NOT NULL AND e.document_kind='quarterly_bulletin'
 )
 SELECT count(*) INTO conflicts FROM matched m
 WHERE m.payload ? m.data_key AND
    (m.payload->>m.data_key)::numeric IS DISTINCT FROM m.numeric_value;
 IF conflicts>0 THEN RAISE EXCEPTION 'Reject % contradictory existing Q1 bulletin numbers',conflicts; END IF;
END $no_conflict$;

WITH proven AS (
 SELECT b.id, e.scpi_slug,
   jsonb_object_agg(
    CASE WHEN e.metric='distribution_brute_par_part' THEN 'distribution_par_part' ELSE e.metric END,
    to_jsonb(e.numeric_value)) AS metrics, count(*) as proof_count
 FROM maximus_agents.scpi_candidate_metric_evidence e
 JOIN public.scpi_bulletins b
   ON b.scpi_slug=e.scpi_slug AND b.period=e.source_period AND b.source_url=e.source_url
 JOIN maximus_agents.scpi_candidate_pdf_validation d
   ON d.scpi_slug=e.scpi_slug AND d.source_period=e.source_period
   AND d.document_kind='quarterly_bulletin' AND d.pdf_sha256=b.pdf_sha256
   AND d.source_url=b.source_url AND d.document_identity_verified
   AND e.source_page BETWEEN 1 AND d.page_count
 WHERE e.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
 AND e.source_period='2026-T1' AND e.document_kind='quarterly_bulletin'
 AND e.qa_status='qa_pass' AND e.independently_reviewed_at IS NOT NULL
 GROUP BY b.id,e.scpi_slug
 HAVING count(*)=6
)
UPDATE public.scpi_bulletins b
SET extraction_json=jsonb_set(coalesce(b.extraction_json,'{}'::jsonb),
 '{metrics}',coalesce(b.extraction_json->'metrics','{}'::jsonb)||p.metrics,true)
FROM proven p WHERE b.id=p.id AND b.qa_status='candidate_page_checked_partial'
 AND coalesce(b.extraction_json->'metrics','{}'::jsonb) IS DISTINCT FROM
 (coalesce(b.extraction_json->'metrics','{}'::jsonb)||p.metrics);

DO $post$
DECLARE cnt integer;
BEGIN
 SELECT count(*) INTO cnt
 FROM maximus_agents.scpi_candidate_metric_evidence e
 WHERE e.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
  AND e.source_period='2026-T1' AND e.qa_status='qa_pass'
  AND e.document_kind='quarterly_bulletin' AND e.independently_reviewed_at IS NOT NULL;
 IF cnt<>24 THEN RAISE EXCEPTION 'Technical Q1 metric signoffs not 24: %',cnt; END IF;
 SELECT count(*) INTO cnt FROM public.scpi_bulletins b
 WHERE b.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
   AND b.period='2026-T1' AND b.qa_status='candidate_page_checked_partial'
   AND jsonb_object_length(b.extraction_json->'metrics')=6;
 IF cnt<>4 THEN RAISE EXCEPTION 'Official Q1 bulletin snapshots not 6/6: %',cnt; END IF;
 IF EXISTS(
  SELECT 1 FROM maximus_agents.scpi_universe u
  WHERE u.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
  AND (u.publication_authorized OR u.analysis_certified))
 THEN RAISE EXCEPTION 'No automatic issuer QA promotion to public'; END IF;
 IF EXISTS(SELECT 1 FROM public.scpi_bulletin_analysis a
  WHERE a.scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
    AND (a.current_source_certified OR a.comparison_certified OR a.certification_status='certified'))
 THEN RAISE EXCEPTION 'Whole-bulletin analysis must still have independent final review'; END IF;
END $post$;
