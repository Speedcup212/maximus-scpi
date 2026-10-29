-- Second pass of eight issuer PDFs after independently verified extended
-- subscription price was made available for printed-column QA.
-- Apply only AFTER the parser fix is merged, to avoid old-code reclaims.
WITH targets AS (
 SELECT d.*
 FROM maximus_agents.scpi_bulletin_replay_documents d
 WHERE d.scpi_slug IN ('corum-origin','corum-xl')
  AND d.source_period IN ('2023-T4','2024-T1','2024-T2','2024-T3')
  AND d.status='extracted'
  AND d.processing_complete=true
  AND d.field_coverage->>'capitalisation'='needs_review'
  AND d.metrics ? 'prix_souscription'
  AND d.metrics ? 'nombre_parts'
)
INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
SELECT 'corum-extended-price-context-replay-'||d.scpi_slug||'-'||d.source_period,
 'Second source-column QA after both extended PDF readers validate the issue subscription price',
 to_jsonb(d)
FROM targets d
ON CONFLICT(event_key) DO NOTHING;

UPDATE maximus_agents.scpi_bulletin_replay_documents d
SET status='queued',parser_version=NULL,financial_complete=false,
    next_try_at=now(),updated_at=now()
WHERE d.scpi_slug IN ('corum-origin','corum-xl')
  AND d.source_period IN ('2023-T4','2024-T1','2024-T2','2024-T3')
  AND d.status='extracted' AND d.processing_complete=true
  AND d.field_coverage->>'capitalisation'='needs_review'
  AND d.metrics ? 'prix_souscription' AND d.metrics ? 'nombre_parts';
