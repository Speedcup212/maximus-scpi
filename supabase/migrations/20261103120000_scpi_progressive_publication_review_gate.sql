-- RECOVERY-077: read-only evidence decision, not a release authorization.
create or replace view maximus_agents.scpi_candidate_progressive_publication_v1
with (security_invoker=true) as
with documents as (
 select scpi_slug,
 bool_or(document_kind='dic' and identity_verified and kind_verified) as dic_ok,
 bool_or(document_kind='note' and identity_verified and kind_verified) as note_ok,
 bool_or(document_kind='statutes' and identity_verified and kind_verified) as statutes_ok
 from maximus_agents.scpi_candidate_regulatory_documents group by scpi_slug
), proof as (
 select c.*,r.review_evidence,r.annual_quarter_coherence_passed,
 r.dic_risk_sfdr_review_passed,coalesce(d.statutes_ok,false) as statutes_ok,
 (c.publisher_pdf_valid and c.current_qa_fields>=12 and c.core_qa_fields>=11
 and c.current_indicators_ready and c.allocations_verified
 and c.bulletin_analysis_ready and c.live_liquidity_ready
 and coalesce(d.dic_ok,false) and coalesce(d.note_ok,false)
 and coalesce(r.verified_field_display_passed,false)
 and coalesce(r.fees_and_redemption_review_passed,false)
 and coalesce(r.debt_and_leverage_review_passed,false)
 and coalesce(r.liquidity_risk_review_passed,false)
 and coalesce(r.frontend_contract_smoke_passed,false)
 and r.review_evidence->'browser_smoke'->>'status'='PASS'
 and coalesce((r.review_evidence->'browser_smoke'->>'case_count')::integer,0)>=12
 and coalesce((r.review_evidence->>'material_falsehood')::boolean,false)=false
 and (r.review_evidence->'share_movement_reconciliation'->>'delta' is null
   or (r.review_evidence->'share_movement_reconciliation'->>'review_status') in
    ('confirmed_arithmetic_discrepancy_not_resolved','unresolved'))
 ) as contained_public_information
 from maximus_agents.scpi_candidate_release_circuit_v3 c
 left join maximus_agents.scpi_candidate_final_review r using(scpi_slug)
 left join documents d using(scpi_slug)
)
select scpi_slug,name,lifecycle,source_period,source_url,pdf_sha256,
 case when final_release_ready then 'READY_CERTIFIED'
 when contained_public_information then 'READY_WITH_RESERVES'
 else 'BLOCKED' end as publication_review_status,
 final_release_ready as complete_certification,
 contained_public_information as factual_listing_qa_pass,
 statutes_ok as latest_statutes_verified,
 array_remove(array[
 case when not statutes_ok then 'LATEST_STATUTES_UNVERIFIED'::text end,
 case when not coalesce(annual_quarter_coherence_passed,false) then 'HISTORY_NOT_RECONCILED'::text end,
 case when not coalesce(dic_risk_sfdr_review_passed,false) then 'RISK_SFDR_TEXT_UNDER_REVIEW'::text end,
 case when coalesce((review_evidence->'share_movement_reconciliation'->>'delta')::integer,0)<>0 then 'UNRECONCILED_SHARE_FLOW'::text end
 ],null::text) as reservations,
 array_remove(array[
 case when not coalesce(annual_quarter_coherence_passed,false) then 'uncertified_history_comparison'::text end,
 case when not coalesce(dic_risk_sfdr_review_passed,false) then 'suitability_recommendations'::text end,
 case when coalesce((review_evidence->'share_movement_reconciliation'->>'delta')::integer,0)<>0 then 'share_movement_trend'::text end,
 case when not statutes_ok then 'legal_terms_currentness'::text end
 ],null::text) as disabled_features,
 false as publication_authorized_by_review,
 current_qa_fields,core_qa_fields,regulatory_documents_verified,
 independent_review_ready,independent_audit_ready,responsible_batch_ready
from proof;
revoke all on maximus_agents.scpi_candidate_progressive_publication_v1 from public,anon,authenticated;
