-- Replay exactly the nine historical CORUM issuers blocked by impossible
-- geometry (8 current-vs-prior capitalisation columns, 1 concatenated queue).
-- Original candidate, source, PDF hash and failure remain in private audit.
WITH targets AS (
 SELECT d.*
 FROM maximus_agents.scpi_bulletin_replay_documents d
 WHERE d.scpi_slug IN ('corum-origin','corum-xl')
   AND d.status='canonical_guard_review'
   AND (
     (d.source_period IN ('2023-T4','2024-T1','2024-T2','2024-T3')
        AND d.result->>'canonical_guard_error' LIKE '%capitalisation incohérente%')
      OR (d.scpi_slug='corum-origin' AND d.source_period='2015-T1'
        AND d.result->>'canonical_guard_error' LIKE '%retraits en attente > parts totales%')
   )
)
INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
SELECT 'corum-historical-column-replay-'||t.scpi_slug||'-'||t.source_period,
  'Previous dual-reader geometry selected historical neighbour or merged count; financial QA blocked publication',
  to_jsonb(t)
FROM targets t
ON CONFLICT(event_key) DO NOTHING;

UPDATE maximus_agents.scpi_bulletin_replay_documents d
 SET status='queued',parser_version=NULL,financial_complete=false,
   next_try_at=now(),updated_at=now(),
   result=d.result||jsonb_build_object(
     'historical_column_qa_reprocess','20261029',
     'pre_reprocess_snapshot','corum-historical-column-replay-'||d.scpi_slug||'-'||d.source_period)
 WHERE d.status='canonical_guard_review' AND d.scpi_slug IN ('corum-origin','corum-xl')
 AND (
    (d.source_period IN ('2023-T4','2024-T1','2024-T2','2024-T3')
       AND d.result->>'canonical_guard_error' LIKE '%capitalisation incohérente%')
    OR (d.scpi_slug='corum-origin' AND d.source_period='2015-T1'
       AND d.result->>'canonical_guard_error' LIKE '%retraits en attente > parts totales%')
 );
