-- Include invalidated TOF periods in quality counts: never allow PASS by simply excluding quarantined rows.
CREATE OR REPLACE VIEW public.scpi_crash_test_status AS  WITH base AS (
         SELECT o.pilot_order,
            o.scpi_slug,
            o.last_document_period,
            o.quarterly_blockers,
            o.quarterly_qa_review,
            o.annual_blockers,
            o.annual_uncertified,
            o.annual_certified,
            o.source_ready,
            o.trajectory_ready,
            o.operational_status
           FROM scpi_operational_status o
        ), canon AS (
         SELECT h.id,
            h.scpi_slug,
            h.snapshot_at,
            h.source_period,
            h.source_type,
            h.source_document,
            h.source_url,
            h.td,
            h.tof,
            h.capitalisation,
            h.prix_souscription,
            h.prix_reconstitution,
            h.prix_retrait,
            h.valeur_realisation,
            h.endettement,
            h.walt,
            h.walb,
            h.collecte_nette,
            h.nb_cessions_trimestre,
            h.distribution_par_part,
            h.nombre_locataires,
            h.nombre_immeubles,
            h.parts_attente_retrait,
            h.created_at,
            h.nombre_parts,
            h.nombre_associes,
            h.retraits_executes_trimestre,
            h.capital_type,
            h.qa_status,
            h.source_confidence,
            h.liquidity_basis,
            h.liquidity_sell_orders,
            h.liquidity_buy_orders
           FROM scpi_indicator_history h
             JOIN base b_1 USING (scpi_slug)
          WHERE h.source_period ~ '^20[0-9]{2}-T[1-4]$'::text AND h.source_period <= b_1.last_document_period AND (COALESCE(h.qa_status, ''::text) !~~ 'invalid%'::text OR h.qa_status = 'invalid_tof_bulletin_source_policy')
        ), q AS (
         SELECT canon.scpi_slug,
            count(*) FILTER (WHERE canon.tof IS NULL AND COALESCE(canon.qa_status, ''::text) !~~ '%tof_not_reported%'::text AND COALESCE(canon.qa_status, ''::text) !~~ '%tof_not_applicable%'::text) AS missing_tof,
            count(*) FILTER (WHERE canon.source_url IS NULL) AS missing_source,
            count(*) FILTER (WHERE COALESCE(canon.source_confidence, 0::numeric) < 0.95) AS low_confidence,
            count(*) FILTER (WHERE canon.capitalisation IS NOT NULL AND canon.nombre_parts IS NOT NULL AND canon.prix_souscription IS NOT NULL AND canon.nombre_parts > 0 AND canon.prix_souscription > 0::numeric AND ((canon.capitalisation / (canon.nombre_parts::numeric * canon.prix_souscription / 1000000.0)) < 0.75 OR (canon.capitalisation / (canon.nombre_parts::numeric * canon.prix_souscription / 1000000.0)) > 1.25)) AS cap_inconsistency
           FROM canon
          GROUP BY canon.scpi_slug
        ), nc AS (
         SELECT h.scpi_slug,
            count(*) FILTER (WHERE COALESCE(h.qa_status, ''::text) !~~ 'invalid%'::text) AS active_noncanonical
           FROM scpi_indicator_history h
             JOIN base b_1 USING (scpi_slug)
          WHERE h.source_period IS NOT NULL AND h.source_period !~ '^20[0-9]{2}-T[1-4]$'::text
          GROUP BY h.scpi_slug
        )
 SELECT b.pilot_order,
    b.scpi_slug,
    b.operational_status AS legacy_status,
    COALESCE(q.missing_tof, 0::bigint) AS missing_tof,
    COALESCE(q.missing_source, 0::bigint) AS missing_source,
    COALESCE(q.low_confidence, 0::bigint) AS low_confidence,
    COALESCE(q.cap_inconsistency, 0::bigint) AS cap_inconsistency,
    COALESCE(nc.active_noncanonical, 0::bigint) AS active_noncanonical,
        CASE
            WHEN COALESCE(q.missing_tof, 0::bigint) = 0 AND COALESCE(q.missing_source, 0::bigint) = 0 AND COALESCE(q.low_confidence, 0::bigint) = 0 AND COALESCE(q.cap_inconsistency, 0::bigint) = 0 AND COALESCE(nc.active_noncanonical, 0::bigint) = 0 THEN 'PASS'::text
            ELSE 'FAIL'::text
        END AS crash_status
   FROM base b
     LEFT JOIN q USING (scpi_slug)
     LEFT JOIN nc USING (scpi_slug)
  ORDER BY b.pilot_order;;
-- Strict status must fail whenever this SCPI retains an issuer-source TOF quarantine in historical coverage.
CREATE OR REPLACE VIEW public.scpi_crash_test_strict_v2 AS  WITH base AS (
         SELECT scpi_operational_status.pilot_order,
            scpi_operational_status.scpi_slug,
            scpi_operational_status.last_document_period,
            scpi_operational_status.quarterly_blockers,
            scpi_operational_status.quarterly_qa_review,
            scpi_operational_status.annual_blockers,
            scpi_operational_status.annual_uncertified,
            scpi_operational_status.annual_certified,
            scpi_operational_status.source_ready,
            scpi_operational_status.trajectory_ready,
            scpi_operational_status.operational_status
           FROM scpi_operational_status
        ), active_hist AS (
         SELECT h_1.id,
            h_1.scpi_slug,
            h_1.snapshot_at,
            h_1.source_period,
            h_1.source_type,
            h_1.source_document,
            h_1.source_url,
            h_1.td,
            h_1.tof,
            h_1.capitalisation,
            h_1.prix_souscription,
            h_1.prix_reconstitution,
            h_1.prix_retrait,
            h_1.valeur_realisation,
            h_1.endettement,
            h_1.walt,
            h_1.walb,
            h_1.collecte_nette,
            h_1.nb_cessions_trimestre,
            h_1.distribution_par_part,
            h_1.nombre_locataires,
            h_1.nombre_immeubles,
            h_1.parts_attente_retrait,
            h_1.created_at,
            h_1.nombre_parts,
            h_1.nombre_associes,
            h_1.retraits_executes_trimestre,
            h_1.capital_type,
            h_1.qa_status,
            h_1.source_confidence,
            h_1.liquidity_basis,
            h_1.liquidity_sell_orders,
            h_1.liquidity_buy_orders,
            lower(split_part(split_part(h_1.source_url, '://'::text, 2), '/'::text, 1)) AS source_host
           FROM scpi_indicator_history h_1
          WHERE h_1.source_period ~ '^20[0-9]{2}-T[1-4]$'::text AND ("substring"(h_1.source_period, 1, 4)::integer * 4 + "substring"(h_1.source_period, 7, 1)::integer) <= (EXTRACT(year FROM CURRENT_DATE)::integer * 4 + EXTRACT(quarter FROM CURRENT_DATE)::integer) AND COALESCE(h_1.source_confidence, 0::numeric) >= 0.95 AND COALESCE(h_1.qa_status, ''::text) !~~ 'invalid%'::text AND COALESCE(h_1.qa_status, ''::text) <> 'manual_period_correction'::text
        ), host_issues AS (
         SELECT h_1.scpi_slug,
            count(*) FILTER (WHERE h_1.source_url IS NULL) AS missing_source_url,
            count(*) FILTER (WHERE h_1.source_url IS NOT NULL AND NOT (h_1.source_host = ANY (COALESCE(c_1.allowed_hosts, ARRAY[]::text[]))) AND NOT (h_1.qa_status = 'manual_verified_official_document_mirror'::text AND (EXISTS ( SELECT 1
                   FROM maximus_agents.approved_source_mirrors approved
                  WHERE approved.enabled AND approved.scpi_slug = h_1.scpi_slug AND approved.source_period = h_1.source_period AND approved.source_url = h_1.source_url AND (( SELECT count(*) AS count
                           FROM scpi_metric_certifications mc
                          WHERE mc.scpi_slug = h_1.scpi_slug AND mc.source_period = h_1.source_period AND mc.source_url = h_1.source_url AND mc.verification_status = 'manual_verified_official_document_mirror'::text AND mc.source_page IS NOT NULL AND NULLIF(btrim(mc.evidence_text), ''::text) IS NOT NULL AND COALESCE(mc.extraction_confidence, 0::numeric) >= 0.95)) >= 12)))) AS source_host_violations
           FROM active_hist h_1
             LEFT JOIN scpi_source_connectors c_1 USING (scpi_slug)
          GROUP BY h_1.scpi_slug
        ), metric_issues AS (
         SELECT h_1.scpi_slug,
            count(*) FILTER (WHERE h_1.tof IS NULL AND NOT (EXISTS ( SELECT 1
                   FROM scpi_metric_certifications mc
                  WHERE mc.scpi_slug = h_1.scpi_slug AND mc.source_period = h_1.source_period AND mc.metric = 'tof'::text AND mc.verification_status = 'manual_verified_official_not_reported'::text AND NULLIF(btrim(mc.evidence_text), ''::text) IS NOT NULL AND mc.source_url IS NOT NULL AND COALESCE(mc.extraction_confidence, 0::numeric) >= 0.95))) AS missing_tof,
            count(*) FILTER (WHERE h_1.capitalisation IS NOT NULL AND h_1.nombre_parts IS NOT NULL AND h_1.prix_souscription IS NOT NULL AND h_1.nombre_parts > 0 AND h_1.prix_souscription > 0::numeric AND (abs(h_1.capitalisation - h_1.nombre_parts::numeric * h_1.prix_souscription / 1000000.0) / NULLIF(h_1.nombre_parts::numeric * h_1.prix_souscription / 1000000.0, 0::numeric)) > 0.20) AS cap_consistency_issues
           FROM active_hist h_1
          GROUP BY h_1.scpi_slug
        ), cert AS (
         SELECT h_1.scpi_slug,
            count(*) FILTER (WHERE h_1.tof IS NOT NULL AND NOT (EXISTS ( SELECT 1
                   FROM scpi_metric_certifications mc
                  WHERE mc.scpi_slug = h_1.scpi_slug AND mc.source_period = h_1.source_period AND mc.metric = 'tof'::text AND COALESCE(mc.verification_status, ''::text) !~~ 'invalid%'::text AND COALESCE(mc.extraction_confidence, 0::numeric) >= 0.95))) AS uncertified_tof_periods
           FROM active_hist h_1
          GROUP BY h_1.scpi_slug
        ), dirty AS (
         SELECT scpi_indicator_history.scpi_slug,
            count(*) FILTER (WHERE scpi_indicator_history.source_period IS NULL) AS null_period_rows,
            count(*) FILTER (WHERE scpi_indicator_history.source_period IS NOT NULL AND scpi_indicator_history.source_period !~ '^20[0-9]{2}-T[1-4]$'::text) AS noncanonical_rows,
            count(*) FILTER (WHERE COALESCE(scpi_indicator_history.qa_status, ''::text) ~~ 'invalid%'::text) AS invalid_rows
           FROM scpi_indicator_history
          GROUP BY scpi_indicator_history.scpi_slug
        )
 SELECT b.pilot_order,
    b.scpi_slug,
    b.last_document_period,
    b.quarterly_blockers,
    b.quarterly_qa_review,
    b.annual_blockers,
    b.annual_uncertified,
    b.annual_certified,
    b.source_ready,
    b.trajectory_ready,
    b.operational_status,
    COALESCE(h.missing_source_url, 0::bigint) AS missing_source_url,
    COALESCE(h.source_host_violations, 0::bigint) AS source_host_violations,
    COALESCE(m.missing_tof, 0::bigint) AS missing_tof,
    COALESCE(m.cap_consistency_issues, 0::bigint) AS cap_consistency_issues,
    COALESCE(c.uncertified_tof_periods, 0::bigint) AS uncertified_tof_periods,
    COALESCE(d.null_period_rows, 0::bigint) AS null_period_rows,
    COALESCE(d.noncanonical_rows, 0::bigint) AS noncanonical_rows,
    COALESCE(d.invalid_rows, 0::bigint) AS invalid_rows,
        CASE
            WHEN b.operational_status = 'DONE'::text AND COALESCE(h.missing_source_url, 0::bigint) = 0 AND COALESCE(h.source_host_violations, 0::bigint) = 0 AND COALESCE(m.missing_tof, 0::bigint) = 0 AND COALESCE(m.cap_consistency_issues, 0::bigint) = 0 AND COALESCE(c.uncertified_tof_periods, 0::bigint) = 0 AND NOT EXISTS (SELECT 1 FROM scpi_internal.tof_policy_quarantine_audit_20261028 quarantine WHERE quarantine.scpi_slug=b.scpi_slug) THEN 'PASS_100'::text
            ELSE 'FAIL_STRICT'::text
        END AS crash_test_status
   FROM base b
     LEFT JOIN host_issues h USING (scpi_slug)
     LEFT JOIN metric_issues m USING (scpi_slug)
     LEFT JOIN cert c USING (scpi_slug)
     LEFT JOIN dirty d USING (scpi_slug)
  ORDER BY b.pilot_order;;
