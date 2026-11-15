-- RECOVERY-215: correct issuer T3 2026 TOF, without changing strict certification gates.
-- Original issuer PDF sha256 ca4a3569a990f99b376268875440ebc1e1aadefa85aab582ebca96cbce0c62ce,
-- 1775561 bytes, page 5. MuPDF and Poppler + rendered page: TOF T3 2026 = 86.0%.
-- 84.5% is occupied premises, NOT total TOF. No human attestation.
DO $fix$
DECLARE
 h public.scpi_indicator_history%ROWTYPE;
 c public.scpi_metric_certifications%ROWTYPE;
 b public.scpi_bulletins%ROWTYPE;
 live_before jsonb;
 proof_before jsonb;
 pass_before text[];
 ev jsonb;
 provenance jsonb;
 actual jsonb;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('recovery215:paref-hexa:2026-T3'));
 SELECT array_agg(scpi_slug ORDER BY scpi_slug) INTO pass_before
 FROM public.scpi_crash_test_strict_v2 WHERE crash_test_status='PASS_100';
 SELECT * INTO STRICT h FROM public.scpi_indicator_history
 WHERE scpi_slug='paref-hexa' AND source_period='2026-T3' FOR UPDATE;
 SELECT * INTO STRICT c FROM public.scpi_metric_certifications
 WHERE scpi_slug=h.scpi_slug AND source_period=h.source_period AND metric='tof' FOR UPDATE;
 SELECT * INTO STRICT b FROM public.scpi_bulletins
 WHERE scpi_slug=h.scpi_slug AND period=h.source_period FOR UPDATE;
 SELECT to_jsonb(i) INTO STRICT live_before FROM public.scpi_indicators i
 WHERE scpi_slug=h.scpi_slug AND source_period=h.source_period FOR UPDATE;
 SELECT to_jsonb(p) INTO STRICT proof_before FROM maximus_agents.scpi_independent_tof_geometry_proofs p
 WHERE scpi_slug=h.scpi_slug AND source_period=h.source_period FOR UPDATE;
 IF h.tof IS DISTINCT FROM 84.5 OR c.value_numeric IS DISTINCT FROM 84.5
 OR (live_before->>'tof')::numeric IS DISTINCT FROM 84.5
 OR b.pdf_sha256 IS DISTINCT FROM 'ca4a3569a990f99b376268875440ebc1e1aadefa85aab582ebca96cbce0c62ce'
 OR b.source_url IS DISTINCT FROM 'https://paref-gestion.com/wp-content/uploads/2026/10/dc0cd675-deb0-4ab0-b928-040f9aafd157-BTI-T3-2026-PAREF-Hexa.pdf'
 OR c.source_url IS DISTINCT FROM b.source_url OR h.source_url IS DISTINCT FROM b.source_url
 OR c.source_page IS DISTINCT FROM 5 OR c.verification_status IS DISTINCT FROM 'auto_verified_with_evidence'
 OR NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id='scpi-bulletins'
   AND name='paref-hexa/2026-T3/'||b.pdf_sha256||'.pdf' AND (metadata->>'size')::bigint=1775561)
 OR NOT EXISTS (SELECT 1 FROM public.scpi_source_connectors WHERE scpi_slug=h.scpi_slug
   AND 'paref-gestion.com'=ANY(allowed_hosts))
 THEN RAISE EXCEPTION 'REC215_SOURCE_OR_BASELINE_CHANGED'; END IF;
 INSERT INTO maximus_agents.scpi_replay_provenance_quarantine(event_key,reason,snapshot)
 VALUES ('recovery215:paref-hexa:2026-T3:occupied-component-not-tof',
 'Original issuer PDF p5: total TOF 86.0%; 84.5% occupied premises is a component. Dual PDF readers and visual review, no human attestation. Strict gate unchanged.',
 jsonb_build_object('history_before',to_jsonb(h),'certificate_before',to_jsonb(c),
 'bulletin_before',to_jsonb(b),'live_before',live_before,'geometry_before',proof_before));
 ev:=jsonb_build_object('page',5,'text','TOF T3 2026 86,0 %. Evolution du TOF: T3 2026 86,0 %. Methodologie ASPIM. 84,5 % Locaux occupes is a component, not total TOF.',
 'unit','%','method','pdf_page_dual_reader_total_tof','raw_value',86.0,'value_match',true,
 'independent_engines',jsonb_build_array('MuPDF','Poppler'),'human_attestation',false);
 provenance:=jsonb_build_object('value',86.0,'unit','%','definition','issuer_reported_total_tof_ASPIM',
 'sha256',b.pdf_sha256,'source_url',b.source_url,'source_page',5,'document_period',h.source_period,
 'reference_date','2026-09-30','verification_method','pdf_page_dual_reader_total_tof',
 'readers',jsonb_build_array('MuPDF','Poppler'),'human_attestation',false,'recovery_task','RECOVERY-215');
 UPDATE public.scpi_indicator_history SET tof=86.0,qa_status='auto_verified_dual_pdf_evidence',
 metric_provenance=jsonb_set(metric_provenance,'{tof}',provenance) WHERE id=h.id;
 -- Correct the upstream extraction too, so a normal refresh uses the total.
 UPDATE public.scpi_bulletins SET extraction_json=jsonb_set(jsonb_set(extraction_json,
 '{metrics,tof}','86.0'::jsonb),'{evidence,tof}',ev) WHERE id=b.id;
 UPDATE public.scpi_metric_certifications SET value_numeric=86.0,value_text='86,0 %',
 source_page=5,evidence_text=ev->>'text',verification_method=ev->>'method',
 verification_status='auto_verified_with_evidence',extraction_confidence=1,verified_at=now()
 WHERE id=c.id;
 UPDATE public.scpi_indicators SET tof=86.0,
 metric_provenance=jsonb_set(metric_provenance,'{tof}',provenance)
 WHERE scpi_slug=h.scpi_slug AND source_period=h.source_period;
 INSERT INTO scpi_internal.metric_certification_rejections
 (scpi_slug,source_period,metric,rejected_value,rejection_status,reason,evidence_excerpt,decided_by,recovery_task)
 VALUES(h.scpi_slug,h.source_period,'tof',84.5,'invalid_tof_occupied_component',
 '84.5% is the occupied-premises component. Issuer total TOF is 86.0%, explicitly printed in the chart and T3 history.',
 'TOF / T3 2026 / 86,0 % ; 84,5 % Locaux occupés ; 1,5 % Locaux occupés sous franchise',
 'Codex dual-reader and rendered-PDF review; non-human','RECOVERY-215');
 -- Preserve the old geometric finding for audit, explicitly invalidate its semantic claim.
 UPDATE maximus_agents.scpi_independent_tof_geometry_proofs SET detailed_evidence=
 detailed_evidence || jsonb_build_object('status','invalid_occupied_component_not_total_tof',
 'invalidated_by','RECOVERY-215','correct_total_tof',86.0,'human_attestation',false)
 WHERE scpi_slug=h.scpi_slug AND source_period=h.source_period;
 SELECT to_jsonb(i) INTO STRICT actual FROM public.scpi_indicators i WHERE scpi_slug=h.scpi_slug;
 IF (actual->>'tof')::numeric IS DISTINCT FROM 86.0
 OR actual-ARRAY['tof','metric_provenance','updated_at'] IS DISTINCT FROM live_before-ARRAY['tof','metric_provenance','updated_at']
 OR (actual->'metric_provenance')-'tof' IS DISTINCT FROM (live_before->'metric_provenance')-'tof'
 THEN RAISE EXCEPTION 'REC215_LIVE_NONTOF_MUTATION'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.scpi_indicator_history WHERE id=h.id AND tof=86.0
   AND qa_status='auto_verified_dual_pdf_evidence')
 OR NOT EXISTS (SELECT 1 FROM public.scpi_metric_certifications WHERE id=c.id AND value_numeric=86.0
   AND source_page=5 AND verification_status='auto_verified_with_evidence')
 THEN RAISE EXCEPTION 'REC215_CORRECTION_NOT_RETAINED'; END IF;
 IF EXISTS (SELECT 1 FROM public.scpi_crash_test_strict_v2
   WHERE scpi_slug=ANY(pass_before) AND crash_test_status<>'PASS_100')
 OR NOT EXISTS (SELECT 1 FROM public.scpi_crash_test_strict_v2 WHERE scpi_slug=h.scpi_slug AND crash_test_status='FAIL_STRICT')
 THEN RAISE EXCEPTION 'REC215_STRICT_REGRESSION_OR_FALSE_PASS'; END IF;
END $fix$;
