-- Private CORUM XL T2 proof: PDF physical page 3 independently cross-checked
-- against CORUM-sourced public fund statistics on 30/06/2026.
-- This independently resolves the 5 vs 9 leading-digit OCR ambiguity;
-- it does NOT certify the entire PDF analysis, other quarters or release.
WITH verified AS (
 SELECT e.scpi_slug,e.metric
 FROM maximus_agents.scpi_candidate_metric_evidence e
 JOIN public.scpi_bulletins b
  ON b.scpi_slug=e.scpi_slug AND b.period=e.source_period AND b.source_url=e.source_url
 WHERE e.scpi_slug='corum-xl' AND e.source_period='2026-T2'
   AND e.document_kind='quarterly_bulletin' AND e.metric='nombre_associes'
   AND e.numeric_value=54340 AND e.source_page=3
   AND e.qa_status='pending_independent_qa'
   AND b.pdf_sha256='fbac6a2efac56bc75bd90f4548656a7bdff86ab22f6d81e0a3c715e21cd819cd'
)
UPDATE maximus_agents.scpi_candidate_metric_evidence e
SET qa_status='qa_pass',
    independently_reviewed_at=now(),
    independently_reviewed_by='independent_cross_source_corum_cited_laplace_20261016',
    evidence_text=e.evidence_text||
      ' | Contrôle indépendant 16/10/2026 : la fiche Laplace-Groupe CORUM XL, chiffres au 30/06/2026 et explicitement « source CORUM », recoupe exactement « 54 340 associés » et capitalisation 2,168 Md€. URL: https://laplace-groupe.com/nos-produits/placements-immobiliers/scpi-opci/corum-xl . Également contrôlé via https://zenith-is.com/nos-produits/placements-immobiliers/scpi-opci/corum-xl (même présentation, non comptée comme seconde preuve indépendante). Le PDF source officiel enregistré page 3 et SHA existant sont conservés. Ne certifie aucune analyse ni publication.'
FROM verified v
WHERE e.scpi_slug=v.scpi_slug AND e.metric=v.metric
  AND e.source_period='2026-T2' AND e.qa_status='pending_independent_qa';