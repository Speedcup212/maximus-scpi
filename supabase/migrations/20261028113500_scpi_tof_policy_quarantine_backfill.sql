-- Snapshot before any quarantine. Never discard original figures or documentary proof.
INSERT INTO scpi_internal.tof_policy_quarantine_audit_20261028
  (certificate_id,scpi_slug,source_period,rejection_reason,original_certification,original_history,original_live)
SELECT v.id,v.scpi_slug,v.source_period,v.rejection_reason,to_jsonb(c),to_jsonb(h),to_jsonb(i)
FROM scpi_internal.tof_bulletin_source_policy_violations v
JOIN public.scpi_metric_certifications c ON c.id=v.id
LEFT JOIN public.scpi_indicator_history h ON h.scpi_slug=v.scpi_slug AND h.source_period=v.source_period AND h.tof=v.value_numeric
LEFT JOIN public.scpi_indicators i ON i.scpi_slug=v.scpi_slug AND i.source_period=v.source_period AND i.tof=v.value_numeric
ON CONFLICT(certificate_id) DO NOTHING;

-- Only quarantine the same original certification; a later manual recertification stays untouched.
UPDATE public.scpi_metric_certifications c SET
 verification_status='invalid_tof_bulletin_source_policy',
 verification_method='quarantined_'||a.rejection_reason,
 extraction_confidence=0
FROM scpi_internal.tof_policy_quarantine_audit_20261028 a
WHERE a.certificate_id=c.id
AND c.verification_status=a.original_certification->>'verification_status'
AND c.value_numeric=(a.original_certification->>'value_numeric')::numeric;

-- Canonical live metric is unpublished pending evidence. Trigger may copy other
-- fields to history: afterward update history independently and explicitly.
UPDATE public.scpi_indicators i SET
 tof=NULL,qa_status='invalid_tof_bulletin_source_policy'
FROM scpi_internal.tof_policy_quarantine_audit_20261028 a
WHERE a.original_live IS NOT NULL
AND i.scpi_slug=a.scpi_slug AND i.source_period=a.source_period
AND i.tof=(a.original_live->>'tof')::numeric;

UPDATE public.scpi_indicator_history h SET
 tof=NULL,
 qa_status='invalid_tof_bulletin_source_policy',
 source_confidence=0,
 metric_provenance=coalesce(h.metric_provenance,'{}'::jsonb)
    || jsonb_build_object('tof_policy',
      jsonb_build_object('quarantined_on','2026-10-28',
        'reason','issuer_only_or_aspim_metric_rule',
        'backup','scpi_internal.tof_policy_quarantine_audit_20261028'))
FROM scpi_internal.tof_policy_quarantine_audit_20261028 a
WHERE a.original_history IS NOT NULL
AND h.scpi_slug=a.scpi_slug AND h.source_period=a.source_period
AND h.tof=(a.original_history->>'tof')::numeric;
