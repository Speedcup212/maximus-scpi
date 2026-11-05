// Read-only protocol. PR evidence cannot authorize production, even if every claim is PASS.
// The trusted Ed25519 public key MUST be injected by a protected executor
// running code from the protected default branch, never from a PR checkout.
import { createPublicKey, verify } from 'node:crypto';
const SHA = /^[0-9a-f]{40}$/;
const BASE64URL = /^[A-Za-z0-9_-]+$/;
const PILOTS = Object.freeze(['aew-opportunites-europe','opus-real','sofidynamic']);
const SURFACES = Object.freeze(['fiche','comparateur','simulateurs','radar','trajectoire','espace-client']);
const REQUIRED = Object.freeze([
 'current_regulatory_documents','financial_review_complete','legal_review_complete',
 'history_reconciled_or_approved_exception','private_browser_12_cases',
 'independent_review','independent_audit','final_release_ready',
]);
export { PILOTS, SURFACES, REQUIRED };

export function evaluatePrepublication(observed) {
 const blockers=[];
 const rows=observed?.pilot_rows;
 if(!Array.isArray(rows) || rows.length!==3 ||
    new Set(rows.map(x=>x?.scpi_slug)).size!==3 ||
    PILOTS.some(slug=>!rows.some(row=>row?.scpi_slug===slug)))
   blockers.push('THREE_EXPECTED_PILOTS_NOT_PRESENT_ONCE');
 const gates=[
   ['source_financial_gate','FINANCIAL_SOURCE_NOT_VERIFIED'],
   ['analysis_gate','SOURCE_BACKED_ANALYSIS_NOT_APPROVED'],
   ['independent_review_gate','INDEPENDENT_REVIEW_MISSING'],
   ['independent_audit_gate','INDEPENDENT_AUDIT_MISSING'],
   ['six_surface_browser_gate','PRIVATE_SIX_SURFACE_EVIDENCE_MISSING'],
   ['responsible_batch_gate','RESPONSIBLE_BATCH_DECISION_MISSING'],
   ['final_release_gate','FINAL_RELEASE_NOT_READY'],
 ];
 for(const slug of PILOTS) {
   const row=(rows||[]).find(x=>x?.scpi_slug===slug)||{};
   for(const [key,reason] of gates) if(row[key]!==true) blockers.push(slug+':'+reason);
   if(row.regulatory_binary_count!==3) blockers.push(slug+':CURRENT_REGULATORY_SET_INCOMPLETE');
 }
 if(observed?.publication_authorized!==false) blockers.push('OBSERVATION_MUST_NEVER_AUTHORIZE_PUBLICATION');
 return {phase:'PREPUBLICATION',status:blockers.length?'BLOCKED':'CANDIDATE_FOR_PROTECTED_REVIEW',
   blockers,authoritative:false,publication_authorized:false,postdeploy_100_proven:false};
}

// Authenticate an external, short-lived signature bound to an exact production
// deploy SHA, live protected Supabase readback, and 12 browser cases per pilot.
// The protected signer must verify these claims independently before signing.
// Do not use this verifier as an automatic publication authorizer.
function isProductionUrl(url) {
 try { const u=new URL(url); return u.origin==='https://maximusscpi.com' && !u.username && !u.password; }
 catch { return false; }
}

export function verifyPostdeployAttestation({attestation, trustedPublicKeyPem, expectedSha, now=Date.now()}) {
 const fail = reason => ({phase:'POSTDEPLOY',status:'NO_GO',reason,
   publication_authorized:false,postdeploy_100_proven:false});
 if(!SHA.test(expectedSha||'')) return fail('EXPECTED_SHA_INVALID');
 if(!trustedPublicKeyPem || !attestation || typeof attestation!=='object' ||
     typeof attestation.payload!=='string' || typeof attestation.signature!=='string' ||
     !BASE64URL.test(attestation.payload) || !BASE64URL.test(attestation.signature))
   return fail('EXTERNAL_SIGNATURE_OR_TRUST_ANCHOR_MISSING');
 let payload,raw,signature;
 try {
   const key=createPublicKey(trustedPublicKeyPem);
   if(key.asymmetricKeyType!=='ed25519') return fail('SIGNER_KEY_NOT_ED25519');
   raw=Buffer.from(attestation.payload,'base64url');
   signature=Buffer.from(attestation.signature,'base64url');
   if(raw.length<100||raw.length>65536||signature.length!==64 ||
     raw.toString('base64url')!==attestation.payload ||
     signature.toString('base64url')!==attestation.signature ||
     !verify(null,raw,key,signature)) return fail('INVALID_SIGNATURE');
   payload=JSON.parse(raw.toString('utf8'));
 } catch { return fail('INVALID_SIGNATURE_OR_PAYLOAD'); }
 if(!Number.isFinite(now) || payload?.schema!=='scpi-industrial-postdeploy/v1' ||
     payload?.site!=='maximusscpi.com' || payload?.environment!=='production')
   return fail('ATTESTATION_CONTEXT_MISMATCH');
 if(payload.commit_sha!==expectedSha || payload?.deployment?.commit_sha!==expectedSha ||
    payload?.supabase_readback?.commit_sha!==expectedSha)
   return fail('DEPLOY_SUPABASE_SHA_MISMATCH');
 if(payload?.deployment?.state!=='ready' || payload.deployment.published!==true ||
     payload.deployment.context!=='production' || payload.deployment.hostname!=='maximusscpi.com' ||
     typeof payload?.deployment?.id!=='string' || !payload.deployment.id.trim())
   return fail('PRODUCTION_DEPLOY_NOT_VERIFIED');
 const issued=Date.parse(payload.issued_at),expires=Date.parse(payload.expires_at);
 const dbTime=Date.parse(payload?.supabase_readback?.observed_at);
 const deployedAt=Date.parse(payload?.deployment?.published_at);
 if(![issued,expires,dbTime,deployedAt].every(Number.isFinite) || deployedAt>issued || issued>now+30000 ||
     issued<now-600000 || expires<=issued || expires>issued+600000 || now>expires ||
     dbTime>issued || dbTime<deployedAt || dbTime<issued-600000)
   return fail('ATTESTATION_STALE_OR_TIME_INVALID');
 if(payload?.supabase_readback?.protected_access!==true ||
     payload?.supabase_readback?.release_authorized!==true ||
     payload?.supabase_readback?.three_pilots_eligible!==true ||
     payload?.responsible_batch_decision!=='APPROVED')
   return fail('PROTECTED_DB_AND_RELEASE_DECISION_INCOMPLETE');
 const pilots=payload.pilots;
 if(!Array.isArray(pilots) || pilots.length!==3 ||
     new Set(pilots.map(x=>x?.slug)).size!==3 ||
     PILOTS.some(slug=>!pilots.some(x=>x?.slug===slug)))
   return fail('PILOT_IDENTITY_OR_COUNT_INVALID');
 for(const pilot of pilots) {
   if(REQUIRED.some(key=>pilot[key]!==true)) return fail('PILOT_REQUIRED_GATE_MISSING:'+pilot.slug);
   if(typeof pilot.reviewed_by!=='string'||!pilot.reviewed_by.trim()||
       typeof pilot.independent_auditor!=='string'||!pilot.independent_auditor.trim()||
       pilot.reviewed_by===pilot.independent_auditor)
     return fail('INDEPENDENCE_NOT_ATTESTED:'+pilot.slug);
   const checks=pilot.browser_checks;
   if(!Array.isArray(checks)||checks.length!==12||
       new Set(checks.map(x=>x?.device+':'+x?.surface)).size!==12)
     return fail('BROWSER_CASE_COVERAGE_INVALID:'+pilot.slug);
   for(const device of ['desktop','mobile'])for(const surface of SURFACES)
     if(!checks.some(c=>c?.device===device&&c?.surface===surface&&c?.status==='PASS'&&
          c?.commit_sha===expectedSha&&c?.deployment_id===payload.deployment.id&&
          isProductionUrl(c?.url)&&Date.parse(c?.observed_at)>=deployedAt&&
          Date.parse(c?.observed_at)<=issued&&typeof c?.proof_sha256==='string'&&/^[0-9a-f]{64}$/.test(c.proof_sha256)))
       return fail('BROWSER_CASE_PROOF_MISSING:'+pilot.slug+':'+device+':'+surface);
 }
 return {phase:'POSTDEPLOY',status:'PROTECTED_ATTESTATION_VERIFIED',
   // A signature proves the protected signer made these claims, not absolute factual truth.
   reason:null,publication_authorized:false,postdeploy_100_proven:true,attested_commit:expectedSha,
   deploy_id:payload.deployment.id,attested_at:payload.issued_at};
}
