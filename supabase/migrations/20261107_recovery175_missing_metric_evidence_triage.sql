-- RECOVERY-175: private, read-only per-field evidence triage over the EXISTING queues.
-- No automatic financial certifications; no PASS_100, source status, or historic value changes.
-- A dual-PDF "not_found_after_full_read" result is NOT an official non-disclosure.
-- The current financial acceptance gates and independent QA remain unchanged.
CREATE OR REPLACE VIEW maximus_agents.scpi_missing_metric_triage_v1
WITH (security_invoker=true)
AS
WITH slots AS (
  SELECT v.scpi_slug, v.last_document_period AS target_period,
         v.crash_test_status, v.source_ready,
         m.metric
  FROM public.scpi_crash_test_strict_v2 v
  JOIN maximus_agents.scpi_universe u USING(scpi_slug)
  CROSS JOIN LATERAL unnest(ARRAY[
    'td','tof','capitalisation','prix_souscription','prix_reconstitution',
    'prix_retrait','valeur_realisation','endettement','walt','walb',
    'collecte_nette','distribution_par_part','nombre_locataires',
    'nombre_immeubles','nombre_parts','nombre_associes',
    'parts_attente_retrait','retraits_executes_trimestre'
  ]::text[]) AS m(metric)
  WHERE u.lifecycle='existing'
    AND v.last_document_period ~ '^20[0-9]{2}-T[1-4]$'
), evidence AS (
  SELECT s.*,
         recent.value_numeric AS current_value,
         recent.source_url AS current_source_url,
         recent.source_page AS current_source_page,
         old.value_numeric AS last_official_value,
         old.source_period AS last_official_period,
         old.source_url AS last_official_source_url,
         old.source_page AS last_official_source_page,
         absence.verification_status AS verified_absence_status,
         absence.source_url AS absence_source_url,
         absence.source_page AS absence_source_page,
         doc.document_key, doc.pdf_sha256, doc.status AS replay_status,
         doc.field_status AS extraction_status,
         doc.processing_complete, doc.identity_verified,doc.period_verified,
         conflict.conflicting_evidence,
         h.recorded_value
  FROM slots s
  LEFT JOIN LATERAL (
    SELECT c.value_numeric,c.source_url,c.source_page
    FROM public.scpi_metric_certifications c
    WHERE c.scpi_slug=s.scpi_slug AND c.metric=s.metric
      AND c.source_period=s.target_period AND c.value_numeric IS NOT NULL
      AND c.verification_status !~ '^invalid'
      AND c.verification_status NOT LIKE 'manual_verified_official_not_%'
      AND c.extraction_confidence>=0.95
      AND c.source_page>0 AND c.source_url LIKE 'https://%'
      AND length(btrim(coalesce(c.evidence_text,'')))>=12
    ORDER BY c.verified_at DESC NULLS LAST,c.id
    LIMIT 1
  ) recent ON true
  LEFT JOIN LATERAL (
    SELECT c.value_numeric,c.source_period,c.source_url,c.source_page
    FROM public.scpi_metric_certifications c
    WHERE c.scpi_slug=s.scpi_slug AND c.metric=s.metric
      AND c.source_period < s.target_period
      AND c.source_period ~ '^20[0-9]{2}-T[1-4]$'
      AND c.value_numeric IS NOT NULL AND c.verification_status !~ '^invalid'
      AND c.verification_status NOT LIKE 'manual_verified_official_not_%'
      AND c.extraction_confidence>=0.95
      AND c.source_page>0 AND c.source_url LIKE 'https://%'
      AND length(btrim(coalesce(c.evidence_text,'')))>=12
    ORDER BY c.source_period DESC,c.verified_at DESC NULLS LAST,c.id
    LIMIT 1
  ) old ON true
  LEFT JOIN LATERAL (
    SELECT c.verification_status,c.source_url,c.source_page
    FROM public.scpi_metric_certifications c
    WHERE c.scpi_slug=s.scpi_slug AND c.metric=s.metric
      AND c.source_period=s.target_period AND c.value_numeric IS NULL
      AND (
        c.verification_status='manual_verified_official_not_reported'
        OR c.verification_status LIKE 'manual_verified_official_not_applicable%'
      )
      AND c.extraction_confidence>=0.95 AND c.source_page>0
      AND c.source_url LIKE 'https://%'
      AND length(btrim(coalesce(c.evidence_text,'')))>=12
    ORDER BY c.verified_at DESC NULLS LAST,c.id
    LIMIT 1
  ) absence ON true
  LEFT JOIN LATERAL (
    SELECT d.document_key,d.pdf_sha256,d.status,d.processing_complete,
      d.field_coverage->>s.metric AS field_status,
      (d.result->>'identity_verified')::boolean AS identity_verified,
      (d.result->>'period_verified')::boolean AS period_verified
    FROM maximus_agents.scpi_bulletin_replay_documents d
    WHERE d.scpi_slug=s.scpi_slug AND d.source_period=s.target_period
    ORDER BY (d.origin='registered_bulletin') DESC,
       (d.status='extracted' AND d.processing_complete) DESC,
       d.processed_at DESC NULLS LAST,d.document_key
    LIMIT 1
  ) doc ON true
  LEFT JOIN LATERAL (
    SELECT bool_or(
      c.verification_status LIKE 'invalid%'
      OR (recent.value_numeric IS NOT NULL AND
          c.value_numeric IS NOT NULL AND c.value_numeric<>recent.value_numeric)
    ) AS conflicting_evidence
    FROM public.scpi_metric_certifications c
    WHERE c.scpi_slug=s.scpi_slug AND c.metric=s.metric
      AND c.source_period=s.target_period
  ) conflict ON true
  LEFT JOIN LATERAL (
    SELECT to_jsonb(hist)->>s.metric AS recorded_value
    FROM public.scpi_indicator_history hist
    WHERE hist.scpi_slug=s.scpi_slug AND hist.source_period=s.target_period
    LIMIT 1
  ) h ON true
)
SELECT e.scpi_slug,e.target_period,e.metric,e.crash_test_status,e.source_ready,
       CASE
         WHEN coalesce(e.conflicting_evidence,false) OR
              e.extraction_status='parser_disagreement'
           THEN 'CONFLICT'
         WHEN e.current_value IS NOT NULL AND e.verified_absence_status IS NOT NULL
           THEN 'CONFLICT'
         WHEN e.current_value IS NOT NULL THEN 'VERIFIED'
         WHEN e.verified_absence_status LIKE 'manual_verified_official_not_applicable%'
           THEN 'NOT_APPLICABLE'
         WHEN e.verified_absence_status='manual_verified_official_not_reported'
           THEN 'NOT_DISCLOSED'
         WHEN e.last_official_value IS NOT NULL THEN 'LAST_OFFICIAL_VALUE'
         WHEN e.replay_status IN (
           'fetch_error','extraction_error','source_access_blocked',
           'source_reference_review','source_period_mismatch',
           'html_pending_semantic_extraction')
           THEN 'SOURCE_UNAVAILABLE'
         WHEN e.extraction_status='not_found_after_full_read'
              AND e.processing_complete IS TRUE
              AND e.identity_verified IS TRUE AND e.period_verified IS TRUE
           THEN 'UNVERIFIED_ABSENCE'
         WHEN e.extraction_status IN ('needs_review','verified','parser_disagreement')
           THEN 'EXTRACTION_FAILED'
         ELSE 'UNRESOLVED'
       END AS evidence_status,
       e.current_value,e.current_source_url,e.current_source_page,
       e.last_official_value,e.last_official_period,
       e.last_official_source_url,e.last_official_source_page,
       e.verified_absence_status,e.absence_source_url,e.absence_source_page,
       e.document_key,e.pdf_sha256,e.replay_status,e.extraction_status,
       e.processing_complete,e.recorded_value,
       -- Previous values remain dated context; never allow a silent same-period
       -- substitute in calculations or personalized recommendations.
       (e.current_value IS NOT NULL AND e.source_ready IS TRUE
          AND NOT coalesce(e.conflicting_evidence,false)
          AND e.verified_absence_status IS NULL
          AND e.extraction_status IS DISTINCT FROM 'parser_disagreement')
         AS safe_for_current_calculation,
       -- Read-only triage cannot modify any existing strict acceptance status.
       false::boolean AS authorizes_financial_certification
FROM evidence e;

REVOKE ALL ON maximus_agents.scpi_missing_metric_triage_v1
  FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE VIEW maximus_agents.scpi_missing_metric_summary_v1
WITH (security_invoker=true)
AS
SELECT t.scpi_slug,t.crash_test_status,
       count(*) FILTER(WHERE evidence_status='VERIFIED') AS verified_fields,
       count(*) FILTER(WHERE evidence_status='NOT_DISCLOSED') AS official_not_disclosed,
       count(*) FILTER(WHERE evidence_status='NOT_APPLICABLE') AS officially_not_applicable,
       count(*) FILTER(WHERE evidence_status='LAST_OFFICIAL_VALUE') AS last_official_only,
       count(*) FILTER(WHERE evidence_status='UNVERIFIED_ABSENCE') AS unverified_absences,
       count(*) FILTER(WHERE evidence_status IN ('CONFLICT','EXTRACTION_FAILED','SOURCE_UNAVAILABLE','UNRESOLVED')) AS unresolved_or_conflicting,
       count(*) AS monitored_financial_fields,
       false::boolean AS authorizes_financial_certification
FROM maximus_agents.scpi_missing_metric_triage_v1 t
GROUP BY t.scpi_slug,t.crash_test_status;
REVOKE ALL ON maximus_agents.scpi_missing_metric_summary_v1
  FROM PUBLIC,anon,authenticated;
