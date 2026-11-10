-- RECOVERY-207: additive private, source-bound fractional-SCPI share-flow diagnostic.
-- This intentionally DOES NOT replace the legacy BIGINT view or authorize release.
-- Source claims are read as NUMERIC with no ::bigint, ::integer or float casts.
create or replace view maximus_agents.scpi_candidate_share_flow_decimal_review_v1
with (security_invoker = true)
as
with quarterly as (
  select p.scpi_slug,p.source_period,p.source_url,p.pdf_sha256,
         substring(p.source_period from 1 for 4)::integer * 4 +
           substring(p.source_period from 7 for 1)::integer as sequence,
         max(e.numeric_value) filter (where e.metric='nombre_parts' and e.unit='PARTS') as closing_parts,
         max(e.qa_status) filter (where e.metric='nombre_parts' and e.unit='PARTS') as closing_parts_qa,
         max(e.numeric_value) filter (where e.metric='nombre_parts_nouvelles_souscrites' and e.unit='PARTS') as subscribed_parts,
         max(e.qa_status) filter (where e.metric='nombre_parts_nouvelles_souscrites' and e.unit='PARTS') as subscribed_parts_qa,
         max(e.numeric_value) filter (where e.metric='nombre_parts_retires' and e.unit='PARTS') as withdrawn_parts,
         max(e.qa_status) filter (where e.metric='nombre_parts_retires' and e.unit='PARTS') as withdrawn_parts_qa,
         max(e.numeric_value) filter (where e.metric='prix_souscription' and e.unit='EUR_PER_PART') as share_price,
         max(e.qa_status) filter (where e.metric='prix_souscription' and e.unit='EUR_PER_PART') as share_price_qa,
         max(e.numeric_value) filter (where e.metric='capitalisation' and e.unit='EUR') as issuer_capitalisation,
         max(e.qa_status) filter (where e.metric='capitalisation' and e.unit='EUR') as issuer_capitalisation_qa
  from maximus_agents.scpi_candidate_pdf_validation p
  join maximus_agents.scpi_universe u on u.scpi_slug=p.scpi_slug
    and u.lifecycle='candidate' and not u.publication_authorized
  left join maximus_agents.scpi_candidate_metric_evidence e
    on e.scpi_slug=p.scpi_slug and e.source_period=p.source_period
    and e.document_kind=p.document_kind and e.source_url=p.source_url
    and e.source_page between 1 and p.page_count
  where p.document_kind='quarterly_bulletin'
    and p.source_period ~ '^20[0-9]{2}-T[1-4]$'
    and p.document_identity_verified
    and p.pdf_sha256~'^[0-9a-f]{64}$'
    and maximus_agents.is_verified_candidate_issuer_source(p.source_url)
  group by p.scpi_slug,p.source_period,p.source_url,p.pdf_sha256
),
compared as (
  select q.*,
    lag(q.source_period) over (partition by q.scpi_slug order by q.sequence) as opening_period,
    lag(q.sequence) over (partition by q.scpi_slug order by q.sequence) as opening_sequence,
    lag(q.closing_parts) over (partition by q.scpi_slug order by q.sequence) as opening_parts,
    lag(q.closing_parts_qa) over (partition by q.scpi_slug order by q.sequence) as opening_parts_qa
  from quarterly q
),
calculated as (
 select c.*,
        c.opening_parts + c.subscribed_parts - c.withdrawn_parts as expected_closing_parts,
        c.closing_parts - (c.opening_parts + c.subscribed_parts - c.withdrawn_parts) as exact_parts_delta,
        c.closing_parts * c.share_price as exact_calculated_capitalisation,
        c.issuer_capitalisation - c.closing_parts * c.share_price as capitalisation_rounding_difference,
        (c.closing_parts_qa='qa_pass'
        and c.opening_parts_qa='qa_pass'
        and c.subscribed_parts_qa='qa_pass'
        and c.withdrawn_parts_qa='qa_pass'
        and c.share_price_qa='qa_pass'
        and c.issuer_capitalisation_qa='qa_pass') as six_fields_qa_pass
 from compared c
)
select c.scpi_slug,c.source_period,c.source_url,c.pdf_sha256,
       c.opening_period,c.opening_parts,c.subscribed_parts,c.withdrawn_parts,
       c.closing_parts,c.expected_closing_parts,c.exact_parts_delta,
       c.share_price,c.issuer_capitalisation,c.exact_calculated_capitalisation,
       c.capitalisation_rounding_difference,
       coalesce(c.six_fields_qa_pass,false) as six_fields_qa_pass,
       case
         when c.opening_period is null then 'NO_PRECEDING_ISSUER_QUARTER'
         when c.sequence-c.opening_sequence<>1 then 'NON_ADJACENT_ISSUER_QUARTERS'
         when c.opening_parts is null or c.subscribed_parts is null
              or c.withdrawn_parts is null or c.closing_parts is null
              or c.share_price is null or c.issuer_capitalisation is null
              then 'SOURCE_PARTS_OR_CAPITALISATION_MISSING'
         when coalesce(c.six_fields_qa_pass,false) is not true then 'SOURCE_VALUES_NOT_INDEPENDENTLY_QA_PASSED'
         when c.exact_parts_delta<>0 then 'SOURCE_PARTS_ARITHMETIC_MISMATCH'
         when abs(c.capitalisation_rounding_difference)>0.01 then 'ISSUER_CAPITALISATION_ROUNDING_MISMATCH'
         else 'DECIMAL_ARITHMETIC_RECONCILED_TECHNICAL_ONLY'
       end as qa_reconciliation_status,
       false as independent_legal_certified,
       false as publication_authorized
from calculated c;

revoke all on maximus_agents.scpi_candidate_share_flow_decimal_review_v1 from anon,authenticated;
comment on view maximus_agents.scpi_candidate_share_flow_decimal_review_v1 is
'RECOVERY-207 source QA diagnostic; NUMERIC exact fractional units, no financial certification or publishing; legacy BIGINT share flow remains unsafe for fractional parts until replaced.';
