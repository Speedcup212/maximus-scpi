// A score is a measured inventory of demonstrated capabilities, never a release certificate.
export const maturityRubric=Object.freeze([
 ['architecture',15,[['registry',5],['bounded_execution',5],['targeted_retests',5]]],
 ['collection',15,[['trusted_sources',5],['three_issuer_binaries',5],['current_regulatory_documents',5]]],
 ['extraction',15,[['immutable_page_evidence',5],['units_and_periods',5],['all_financial_fields_reviewed',5]]],
 ['certification',20,[['mandatory_gates',5],['uncertified_recommendation_exclusion',5],['independent_review',5],['three_pilots_eligible',5]]],
 ['remediation',15,[['derived_repairs_only',5],['permanent_adversarial_tests',5],['affected_controls_executed',5]]],
 ['publication',10,[['exact_sha_and_private_rights',5],['authorized_production_readback',5]]],
 ['traceability',10,[['hashed_reports',5],['hundred_identity_scalability',5]]],
]);
export function evaluateMaturity(evidence) {
 const demonstrated=id=>evidence?.criteria?.[id]?.status==='PASS'&&
  Array.isArray(evidence.criteria[id].proofs)&&evidence.criteria[id].proofs.length>0&&
  evidence.criteria[id].proofs.every(p=>typeof p==='string'&&p.trim().length>0);
 const domains=maturityRubric.map(([domain,weight,criteria])=>({domain,weight,
  score:criteria.reduce((sum,[id,points])=>sum+(demonstrated(id)?points:0),0),
  criteria:criteria.map(([id,points])=>({id,points,awarded:demonstrated(id)?points:0,status:evidence?.criteria?.[id]?.status||'NOT_DEMONSTRATED'}))}));
 const score=domains.reduce((s,x)=>s+x.score,0);
 const constraints={critical_integrity_pass:evidence?.critical_integrity_pass===true,
  typecheck_pass:evidence?.typecheck_pass===true,
  three_pilots_eligible:demonstrated('three_pilots_eligible'),
  no_existing_regression:evidence?.no_existing_regression===true,
  production_readback:demonstrated('authorized_production_readback')};
 return {score,max:100,domains,constraints,decision:score>=90&&Object.values(constraints).every(Boolean)?'GO':'NO_GO',publication_authorized:false};
}
