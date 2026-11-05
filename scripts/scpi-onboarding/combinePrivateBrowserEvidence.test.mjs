import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {combinePrivateBrowserEvidence} from './combinePrivateBrowserEvidence.mjs';
const SHA='a'.repeat(40);
const sha=b=>createHash('sha256').update(b).digest('hex');
function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'scpi-browser-bundle-'));
 const baseDir=path.join(root,'base'),trajectoryDir=path.join(root,'trajectory');
 fs.mkdirSync(baseDir);fs.mkdirSync(trajectoryDir);
 function make(surface,width,folder){
  const proof_file='sofidynamic-'+width+'-'+surface+'.png';
  const bytes=Buffer.from('PUPPETEER_SYNTHETIC_TEST_ONLY:'+width+':'+surface);
  fs.writeFileSync(path.join(folder,proof_file),bytes);
  return {slug:'sofidynamic',surface,width,source_period:'2026-T2',status:'PASS',
   proof_file,proof_sha256:sha(bytes),proof_kind:'PUPPETEER_SCREENSHOT'};
 }
 const baseCases=[1440,390].flatMap(width=>['profile','comparator_analysis','radar','simulator','client_card'].map(surface=>make(surface,width,baseDir)));
 const trajCases=[1440,390].map(width=>make('trajectory',width,trajectoryDir));
 const base={status:'PASS',commit:SHA,mode:'generic-private-stage-integration-not-production',cases:baseCases};
 const traj={status:'PASS',commit:SHA,cases:trajCases};
 const save=()=>{fs.writeFileSync(path.join(baseDir,'report-sofidynamic.json'),JSON.stringify(base));
  fs.writeFileSync(path.join(trajectoryDir,'report.json'),JSON.stringify(traj));};
 save();
 return {root,baseDir,trajectoryDir,base,traj,save,close(){fs.rmSync(root,{recursive:true,force:true});}};
}
test('replay 10+2 independent SHA-bound files into one complete source-period-preserving bundle',()=>{
 const f=fixture();
 try{
  const result=combinePrivateBrowserEvidence(f);
  assert.equal(result.screenshot_count,12);
  const report=JSON.parse(fs.readFileSync(path.join(f.baseDir,'browser-cases-sofidynamic.json'),'utf8'));
  assert.equal(report.cases.length,12);
  assert.equal(report.source_period,'2026-T2');
  assert.equal(report.publication_authorized,false);
  assert.equal(report.current_financial_certification,false);
  assert.equal(report.postdeploy_100_proven,false);
  assert.equal(report.cases.filter(x=>x.surface==='trajectory').length,2);
 }finally{f.close();}
});
test('missing or modified screenshot never becomes a valid proof',()=>{
 for(const mutate of [
  f=>fs.writeFileSync(path.join(f.baseDir,'sofidynamic-1440-profile.png'),'MODIFIED'),
  f=>fs.rmSync(path.join(f.trajectoryDir,'sofidynamic-390-trajectory.png')),
  f=>{f.traj.commit='b'.repeat(40);f.save();},
  f=>{f.base.cases[0].source_period='2026-T3';f.save();},
  f=>{f.base.cases[0].proof_sha256='0'.repeat(64);f.save();},
  f=>{f.base.cases[0].status='FAIL';f.save();},
  f=>{f.base.cases[0].proof_file='../attack.png';f.save();},
  f=>{f.traj.cases[1].width=1440;f.save();}
 ]){
  const f=fixture();
  try{mutate(f);assert.throws(()=>combinePrivateBrowserEvidence(f));}
  finally{f.close();}
 }
});
test('ten cases are never called a 12-surface proof without independent trajectory',()=>{
 const f=fixture();
 try{f.traj.cases=[];f.save();assert.throws(()=>combinePrivateBrowserEvidence(f),/TEN_PLUS_TWO/);}
 finally{f.close();}
});
