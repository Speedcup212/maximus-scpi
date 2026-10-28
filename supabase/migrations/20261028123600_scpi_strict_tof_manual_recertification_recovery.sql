-- A quarantined TOF blocks strict PASS only until independently recertified from issuer PDF and restored in history. Original immutable evidence stays in private audit table.
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
            WHEN b.operational_status = 'DONE'::text AND COALESCE(h.missing_source_url, 0::bigint) = 0 AND COALESCE(h.source_host_violations, 0::bigint) = 0 AND COALESCE(m.missing_tof, 0::bigint) = 0 AND COALESCE(m.cap_consistency_issues, 0::bigint) = 0 AND COALESCE(c.uncertified_tof_periods, 0::bigint) = 0 AND NOT (EXISTS (
          SELECT 1
          FROM scpi_internal.tof_policy_quarantine_audit_20261028 quarantine
          LEFT JOIN public.scpi_metric_certifications certified ON certified.id=quarantine.certificate_id
          LEFT JOIN public.scpi_indicator_history hist
            ON hist.scpi_slug=quarantine.scpi_slug AND hist.source_period=quarantine.source_period
          WHERE quarantine.scpi_slug=b.scpi_slug
            AND (certified.id IS NULL
              OR certified.verification_status NOT LIKE 'manual_verified_official%'
              OR certified.value_numeric IS NULL
              OR certified.source_page IS NULL
              OR certified.source_page <= 0
              OR scpi_internal.tof_bulletin_source_rejection_reason(
                   certified.scpi_slug,certified.source_url,certified.evidence_text,
                   certified.verification_method,certified.verification_status
                 ) IS NOT NULL
              OR hist.id IS NULL
              OR hist.qa_status LIKE 'invalid%'
              OR hist.tof IS DISTINCT FROM certified.value_numeric
            )
        )) THEN 'PASS_100'::text
            ELSE 'FAIL_STRICT'::text
        END AS crash_test_status
   FROM base b
     LEFT JOIN host_issues h USING (scpi_slug)
     LEFT JOIN metric_issues m USING (scpi_slug)
     LEFT JOIN cert c USING (scpi_slug)
     LEFT JOIN dirty d USING (scpi_slug)
  ORDER BY b.pilot_order;;
