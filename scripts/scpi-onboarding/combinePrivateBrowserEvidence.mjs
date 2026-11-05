// Compose the two EXISTING private browser tests into one auditable archive.
// This only packages stage evidence; it cannot approve T3, authorize publication,
// or certify 12 distinct production routes.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {PILOTS,SURFACES} from './admissionPhases.mjs';

const SHA=/^[0-9a-f]{40}$/;
const DIGEST=/^[0-9a-f]{64}$/;
const EXPECTED=new Set([1440,390].flatMap(width=>SURFACES.map(surface=>width+':'+surface)));
const sha256=(b)=>createHash('sha256').update(b).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const safe=x=>typeof x==='string'&&/^[a-z0-9-]+\.png$/.test(x);

export function combinePrivateBrowserEvidence({baseDir,trajectoryDir,candidate='sofidynamic'}){
 if(!PILOTS.includes(candidate))throw Error('UNKNOWN_PILOT');
 const base=read(path.join(baseDir,'report-sofidynamic.json'));
 const trajectory=read(path.join(trajectoryDir,'report.json'));
 if(base.status!=='PASS'||trajectory.status!=='PASS'||
    !SHA.test(base.commit||'')||base.commit!==trajectory.commit)
  throw Error('PRIVATE_BROWSER_RUN_OR_SHA_NOT_VALID');
 if(base.mode!=='generic-private-stage-integration-not-production')
  throw Error('PRIVATE_TEST_MODE_MISMATCH');
 const baseCases=base.cases.filter(c=>c.slug===candidate);
 const trajCases=trajectory.cases.filter(c=>c.slug===candidate);
 if(baseCases.length!==10||trajCases.length!==2)
  throw Error('TEN_PLUS_TWO_SOURCE_CASES_REQUIRED');
 const out=[];
 for(const [rows,sourceDir] of [[baseCases,baseDir],[trajCases,trajectoryDir]]){
  for(const entry of rows){
   if(entry.status!=='PASS'||entry.proof_kind!=='PUPPETEER_SCREENSHOT'||
      !safe(entry.proof_file)||!DIGEST.test(entry.proof_sha256||'')||
      entry.source_period!=='2026-T2'||!EXPECTED.has(entry.width+':'+entry.surface))
    throw Error('CASE_SOURCE_PROVENANCE_INVALID');
   const original=path.join(sourceDir,entry.proof_file);
   if(!fs.existsSync(original)||sha256(fs.readFileSync(original))!==entry.proof_sha256)
    throw Error('SCREENSHOT_BYTES_HASH_MISMATCH');
   const destination=path.join(baseDir,entry.proof_file);
   if(sourceDir!==baseDir)fs.copyFileSync(original,destination,fs.constants.COPYFILE_EXCL);
   out.push({...entry});
  }
 }
 if(out.length!==12 || new Set(out.map(c=>c.width+':'+c.surface)).size!==12 ||
    EXPECTED.size!==12||out.some(c=>!EXPECTED.has(c.width+':'+c.surface)))
  throw Error('PRIVATE_BROWSER_12_SURFACES_NOT_UNIQUE');
 const manifest={schema:'scpi-browser-cases/v2',candidate_slug:candidate,
  git_commit_sha:base.commit,source_period:'2026-T2',
  data_scope:'PRIVATE_T2_FIXTURE_NOT_CURRENT_T3_NOT_PRODUCTION',
  current_financial_certification:false,independent_qa_approved:false,
  publication_authorized:false,postdeploy_100_proven:false,
  screenshot_count:12,cases:out};
 const filename='browser-cases-'+candidate+'.json';
 fs.writeFileSync(path.join(baseDir,filename),JSON.stringify(manifest,null,2)+'\n');
 return {status:'PRIVATE_EVIDENCE_BUNDLE_PREPARED',file:filename,sha:base.commit,
   screenshot_count:12,source_period:'2026-T2',publication_authorized:false};
}
if(process.argv[1] && fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 try{
  console.log(JSON.stringify(combinePrivateBrowserEvidence({
   baseDir:'test-results/scpi-onboarding',
   trajectoryDir:'test-results/scpi-sofidynamic-trajectory'})));
 }catch(error){console.error('PRIVATE_BROWSER_BUNDLE_BLOCKED:'+String(error.message));process.exitCode=1;}
}
