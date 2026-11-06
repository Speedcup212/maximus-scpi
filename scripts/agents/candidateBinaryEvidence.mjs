// RECOVERY-120: independent QA contract on binary PDF evidence created by
// another GitHub Actions job. No financial approval, database or repo writes.
const isCandidate=task=>task?.payload?.mode==='candidate_documentary_audit';
const isSha=s=>typeof s==='string'&&/^[0-9a-f]{64}$/i.test(s);

export function verifyCandidateBinaryEvidence(task,proof){
 if(!isCandidate(task))return {required:false,financial_certified:false};
 const snap=task.payload?.candidate_evidence;
 const docs=snap?.documents;
 if(!snap||snap.scpi_slug!==task.payload.scpi_slug||!Array.isArray(docs)||
    !proof||proof.candidate_slug!==snap.scpi_slug||
    proof.financial_certified!==false||proof.deploy_allowed!==false||
    !Array.isArray(proof.documents))
   throw Error('INVALID_CANDIDATE_BINARY_PROOF_ENVELOPE');
 if(!docs.length){
   if(proof.status!=='no_verified_documents'||proof.documents.length!==0)
     throw Error('UNVERIFIED_EMPTY_DOCUMENT_EVIDENCE');
   return {required:true,kind:'source_gap',candidate_slug:snap.scpi_slug,
     documents:0,finance_certified:false,financial_certified:false};
 }
 if(proof.status!=='verified'||docs.length!==proof.documents.length)
   throw Error('INCOMPLETE_LIVE_PDF_PROOF');
 const actual=new Map();
 for(const item of proof.documents){
   const key=[item.source_period,item.document_kind,item.source_url].join('|');
   if(actual.has(key))throw Error('DUPLICATE_LIVE_PDF_PROOF');
   actual.set(key,item);
 }
 for(const doc of docs){
   const key=[doc.source_period,doc.document_kind,doc.source_url].join('|');
   const item=actual.get(key);
   if(!item||item.status!=='verified'||!isSha(item.pdf_sha256)||
      item.pdf_sha256!==doc.pdf_sha256||
      item.page_count!==doc.page_count||
      item.binary_hash_matches_registered!==true||
      item.identity_verified!==true||item.period_verified!==true||
      item.financial_certified!==false||
      JSON.stringify(item.reader_engines)!==JSON.stringify(['MuPDF','Poppler']))
     throw Error('BINARY_PDF_PROVENANCE_DISAGREEMENT');
 }
 return {required:true,kind:'live_binary_proof',candidate_slug:snap.scpi_slug,
   documents:docs.length,financial_certified:false,
   document_refs:docs.map(d=>({
     source_url:d.source_url,source_period:d.source_period,
     pdf_sha256:d.pdf_sha256,page_count:d.page_count
   }))};
}
