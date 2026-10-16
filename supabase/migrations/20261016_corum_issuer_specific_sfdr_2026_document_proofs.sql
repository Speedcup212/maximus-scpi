-- 2026 issuer document SFDR classification, only if specifically evidenced.
-- NOTE issuer's earlier 2024 Article-29 report labelled Origin/XL Article 8,
-- while more recent issuer market-target sheets classify them Article 6.
-- Use latest issuer PRODUCT document, not an obsolete group-wide historic label.
-- CORUM USA remains NULL pending current fund-specific issuer confirmation.
DO $preflight$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM maximus_agents.scpi_universe u
 WHERE u.scpi_slug IN ('corum-origin','corum-xl','corum-eurion')
  AND u.lifecycle='candidate' AND NOT u.publication_authorized;
 IF n<>3 THEN RAISE EXCEPTION 'Cannot update SFDR until 3 products private'; END IF;
END;
$preflight$;

WITH issuer_docs(scpi_slug,classification,source_link) AS (
VALUES
 ('corum-origin','Article 6',
 'https://content.corum.fr/app/uploads/corum-fr/CAM_MAJ-marche-cible-des-scpi_Origin_2.pdf'),
 ('corum-eurion','Article 8',
 'https://content.corum.fr/app/uploads/corum-fr/CAM_MAJ-marche-cible-des-scpi_EURION.pdf'),
 ('corum-xl','Article 6',
 'https://content.corum.fr/app/uploads/corum-fr/CAM_MAJ-marche-cible-des-scpi_XL.pdf')
)
UPDATE public.scpi_indicators i
SET sfdr=d.classification,
 source_document=coalesce(i.source_document,'')||
 ' | SFDR documentation issuer CORUM market-target sheet classification '||
 d.classification||' (read 2026-10-16): '||d.source_link||
 '. Warning: historic group 2024 disclosure can differ; do not infer USA from these three.'
FROM issuer_docs d
JOIN maximus_agents.scpi_universe u ON u.scpi_slug=d.scpi_slug
WHERE i.scpi_slug=d.scpi_slug AND i.source_period='2026-T2'
 AND i.sfdr IS NULL AND u.lifecycle='candidate'
 AND NOT u.publication_authorized;

WITH issuer_docs(scpi_slug,classification,source_link) AS (
VALUES
 ('corum-origin','Article 6',
 'https://content.corum.fr/app/uploads/corum-fr/CAM_MAJ-marche-cible-des-scpi_Origin_2.pdf'),
 ('corum-eurion','Article 8',
 'https://content.corum.fr/app/uploads/corum-fr/CAM_MAJ-marche-cible-des-scpi_EURION.pdf'),
 ('corum-xl','Article 6',
 'https://content.corum.fr/app/uploads/corum-fr/CAM_MAJ-marche-cible-des-scpi_XL.pdf')
)
UPDATE maximus_agents.scpi_candidate_final_audit a
SET audit_summary=a.audit_summary || jsonb_build_object(
  'sfdr_source_classification',d.classification,
  'sfdr_issuer_market_target_document',d.source_link,
  'sfdr_fund_specific_review','source-linked, candidate not public; latest 2026 DIC and interface still need signoff',
  'risk_note','Earlier 2024 group Article-29 SFDR labels may differ; use product-specific later issuer documentation'
),updated_at=now()
FROM issuer_docs d
WHERE a.scpi_slug=d.scpi_slug AND a.audit_status='pending' AND a.approved_at IS NULL;

UPDATE maximus_agents.scpi_candidate_final_audit a
SET audit_summary=a.audit_summary||jsonb_build_object(
 'sfdr_source_classification',NULL,
 'sfdr_fund_specific_review','CORUM USA Article 6 reported in issuer 2024 annual group article-29 document; latest fund-specific 2026 SFDR disclosure still to check before setting live classification',
 'risk_note','US FX exposure and US REIT tax apply; currency and fiscal disclosures must be reviewed in final audit'
),updated_at=now()
WHERE a.scpi_slug='corum-usa' AND a.audit_status='pending' AND a.approved_at IS NULL;

DO $verify$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM public.scpi_indicators
 WHERE (scpi_slug='corum-origin' AND sfdr='Article 6')
    OR (scpi_slug='corum-eurion' AND sfdr='Article 8')
    OR (scpi_slug='corum-xl' AND sfdr='Article 6');
 IF n<>3 THEN RAISE EXCEPTION 'Source-backed SFDR classification incomplete: %',n; END IF;
 IF EXISTS(SELECT 1 FROM public.scpi_indicators WHERE scpi_slug='corum-usa' AND sfdr IS NOT NULL) THEN
 RAISE EXCEPTION 'USA classification not current-fund independently source verified'; END IF;
 IF EXISTS(SELECT 1 FROM maximus_agents.scpi_candidate_final_audit
 WHERE scpi_slug IN ('corum-origin','corum-eurion','corum-usa','corum-xl')
  AND audit_status='approved') THEN RAISE EXCEPTION 'Final audit may not be approved by SFDR source metadata'; END IF;
END;
$verify$;
