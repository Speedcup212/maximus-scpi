// Read-only evidence contract for the existing maximus_agents release circuit.
// NO mutation and NO publication approval. Only a protected, independently
// configured executor may transform verified evidence into a release decision.
import {createHash} from 'node:crypto';
import {PILOTS,SURFACES} from './admissionPhases.mjs';
const SHA40=/^[a-f0-9]{40}$/;
const SHA256=/^[a-f0-9]{64}$/;
const WIDTHS=[390,1440];
const REVIEW_GATES=[
 'legal_identity_passed','verified_field_display_passed','annual_quarter_coherence_passed',
 'debt_and_leverage_review_passed','liquidity_risk_review_passed','fees_and_redemption_review_passed',
 'dic_risk_sfdr_review_passed','frontend_contract_smoke_passed'
];
const REGULATORY_KINDS=['dic','note','statutes'];
const AUDIT_GATES=[
 'historical_consistency_pass','financial_coverage_pass','liquidity_risk_pass',
 'document_regulatory_pass','public_display_mapping_pass'
];
const DB_GATES=[
 'current_pdf_identity_verified','source_financial_gate','allocation_gate',
 'candidate_indicator_gate','analysis_gate','independent_review_gate',
 'independent_audit_gate','responsible_batch_gate','six_surface_browser_gate',
 'final_release_gate','registry_links_verified','regulatory_legal_review_gate',
 'prepublication_history_consistency_ready','technical_financial_minimum_met',
 'regulatory_pdf_identity_minimum_met','liquidity_disclosure_gate'
];
const BATCH_ID='RECOVERY-100-THREE-PILOTS-20261105';
const unique=(xs,key)=>new Set(xs.map(x=>x?.[key])).size===xs.length;
const date=x=>{const n=Date.parse(x);return Number.isFinite(n)?n:NaN;};
const isStr=x=>typeof x==='string'&&x.trim().length>0;
const row=(rows,slug)=>Array.isArray(rows)?rows.find(x=>x?.scpi_slug===slug)||{}:{};
const isHttpsDocumentUrl=url=>{
  try{const u=new URL(url);return u.protocol==='https:'&&!u.username&&!u.password;}
  catch{return false;}
};
export const EVIDENCE_CONTRACT={pilots:PILOTS,surfaces:SURFACES,widths:WIDTHS,batch_id:BATCH_ID};

export function evaluateProtectedReleaseEvidence(snapshot,{expectedSha}={}) {
 const blockers=[];
 const add=(slug,reason)=>blockers.push((slug?slug+':':'')+reason);
 if(!SHA40.test(expectedSha||''))add(null,'EXPECTED_SHA_INVALID');
 const groups=[
  ['pilot_rows','scpi_slug'],['reviews','scpi_slug'],['audits','scpi_slug']
 ];
 for(const [name,key] of groups) {
  const rows=snapshot?.[name];
  if(!Array.isArray(rows)||rows.length!==3||!unique(rows,key)||
      PILOTS.some(slug=>!rows.some(x=>x?.[key]===slug)))
   add(null,name.toUpperCase()+'_THREE_IDENTITIES_MISSING_OR_DUPLICATE');
 }
 const batch=snapshot?.batch||{};
 if(batch.batch_id!==BATCH_ID||!Array.isArray(batch.candidate_slugs)||
    batch.candidate_slugs.length!==3||new Set(batch.candidate_slugs).size!==3||
    PILOTS.some(slug=>!batch.candidate_slugs.includes(slug)))
   add(null,'BATCH_IDENTITY_MISMATCH');
 if(batch.decision!=='approved'||!isStr(batch.responsible_name)||!Number.isFinite(date(batch.decided_at))||
    !SHA256.test(batch.dossier_digest_sha256||''))
   add(null,'BATCH_NOT_APPROVED_WITH_SIGNED_DIGEST');
 const delegates=Array.isArray(snapshot?.delegations)?snapshot.delegations:[];
 const authorization=delegates.find(d=>d.actor===batch.responsible_name && d.active===true &&
    isStr(d.authorization_source)&&Number.isFinite(date(d.authorized_at))&&
    date(d.authorized_at)<=date(batch.decided_at));
 if(!authorization)add(null,'RESPONSIBLE_ACTOR_NOT_EXPLICITLY_DELEGATED');
 const identities=new Set();
 for(const slug of PILOTS) {
  const observation=row(snapshot?.pilot_rows,slug);
  const review=row(snapshot?.reviews,slug);
  const audit=row(snapshot?.audits,slug);
  for(const gate of DB_GATES)
   if(observation[gate]!==true)add(slug,'LIVE_'+gate.toUpperCase()+'_FALSE');
  if(observation.regulatory_binary_count!==3)add(slug,'THREE_CURRENT_REGULATORY_PDFS_REQUIRED');
  if(!(Number.isSafeInteger(observation.prepublication_verified_history_periods)&&
       observation.prepublication_verified_history_periods>=2))
    add(slug,'TWO_SOURCE_VERIFIED_HISTORY_PERIODS_REQUIRED');
  const documents=(Array.isArray(snapshot?.regulatory_documents)?snapshot.regulatory_documents:[])
    .filter(d=>d?.scpi_slug===slug);
  for(const kind of REGULATORY_KINDS){
    const matching=documents.filter(d=>d?.document_kind===kind);
    if(matching.length!==1 || matching[0]?.identity_verified!==true||
       matching[0]?.kind_verified!==true || !SHA256.test(matching[0]?.pdf_sha256||'')||
       !Number.isSafeInteger(matching[0]?.page_count)||matching[0]?.page_count<1||
       !Number.isFinite(date(matching[0]?.checked_at))||
       !isHttpsDocumentUrl(matching[0]?.source_url))
      add(slug,'REGULATORY_PDF_PROVENANCE_INVALID:'+kind);
  }
  if(!isStr(observation.source_period))add(slug,'SOURCE_PERIOD_MISSING');
  for(const gate of REVIEW_GATES)
   if(review[gate]!==true)add(slug,'REVIEW_'+gate.toUpperCase()+'_FALSE');
  if(!isStr(review.reviewed_by)||!Number.isFinite(date(review.reviewed_at)))
   add(slug,'REVIEWER_IDENTITY_OR_DATE_MISSING');
  if(audit.audit_status!=='approved'||!isStr(audit.approved_by)||
     !Number.isFinite(date(audit.approved_at))||!isStr(audit.independent_qa_reference)||
     !SHA256.test(audit.evidence_digest_sha256||''))
   add(slug,'INDEPENDENT_AUDIT_SIGNATURE_OR_DIGEST_MISSING');
  for(const gate of AUDIT_GATES)
   if(audit[gate]!==true)add(slug,'AUDIT_'+gate.toUpperCase()+'_FALSE');
  if(review.reviewed_by===audit.approved_by || review.reviewed_by===batch.responsible_name ||
     audit.approved_by===batch.responsible_name)
   add(slug,'REVIEW_AUDIT_RESPONSIBLE_ACTOR_NOT_SEPARATED');
  if(Number.isFinite(date(audit.approved_at))&&Number.isFinite(date(review.reviewed_at))&&
      date(audit.approved_at)<date(review.reviewed_at))
   add(slug,'AUDIT_PRECEDES_FINANCIAL_LEGAL_REVIEW');
  if(isStr(review.reviewed_by))identities.add(review.reviewed_by);
  if(isStr(audit.approved_by))identities.add(audit.approved_by);

  // Legacy database browser flags are only a starting point. The immutable
  // artifact and each individual proof must be present and bound to the SHA.
  const browser=review.review_evidence?.browser_smoke||{};
  if(browser.status!=='PASS'||browser.commit_sha!==expectedSha||
     !/^https:\/\/github\.com\/Speedcup212\/maximus-scpi\/actions\/runs\/[0-9]+$/.test(browser.run_url||'')||
     !SHA256.test(browser.artifact_zip_sha256||'')||
     !Number.isSafeInteger(browser.artifact_id)||browser.artifact_id<=0)
   add(slug,'BROWSER_RUN_ARTIFACT_OR_SHA_UNVERIFIED');
  const cases=Array.isArray(browser.cases)?browser.cases:[];
  if(cases.length!==12)add(slug,'BROWSER_12_CASES_REQUIRED');
  for(const width of WIDTHS)for(const surface of SURFACES){
   const matching=cases.filter(c=>c?.slug===slug&&c?.surface===surface&&c?.width===width);
   if(matching.length!==1||matching[0]?.status!=='PASS'||
      !SHA256.test(matching[0]?.proof_sha256||''))
     add(slug,'BROWSER_CASE_INDIVIDUAL_PROOF_MISSING:'+surface+':'+width);
  }
 }
 if(identities.size<2)add(null,'INDEPENDENT_IDENTITIES_NOT_EVIDENCED');
 const status=blockers.length===0?'CANDIDATE_FOR_PROTECTED_PUBLISH_APPROVAL':'BLOCKED';
 return {
  phase:'PREPUBLICATION_INDEPENDENT_EVIDENCE',
  status,blockers,blocker_count:blockers.length,
  candidate_sha:SHA40.test(expectedSha||'')?expectedSha:null,
  verified_by_protected_executor:false,
  publication_authorized:false,
  postdeploy_100_proven:false,
 };
}
export function hashEvidenceSnapshot(snapshot) {
 // SHA covers bytes of this exported readback JSON, not authenticity of
 // the upstream source; only an independently authenticated read provides that.
 const canonical=JSON.stringify(snapshot);
 return createHash('sha256').update(canonical).digest('hex');
}
