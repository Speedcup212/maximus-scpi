import test from 'node:test';
import assert from 'node:assert/strict';
import {isProductionDeploy,normalizeSecretHeaders,validateNativeReport} from './release.mjs';
const environment={CONTEXT:'production',BRANCH:'main',
 COMMIT_REF:'a'.repeat(40),DEPLOY_ID:'b'.repeat(24),
 SITE_ID:'e4f16f87-663d-4965-8de8-00f6840f1aa7'};
const labels=['profile','fintech-card','fintech-row','client','dates','blocked-actions'];
const report={status:'PASS',candidate:'sofidynamic',commit:'a'.repeat(40),
 source_period:'2026-T2',publication_authorized:false,
 cases:labels.flatMap(surface=>[1440,390].map(width=>({surface,width,status:'PASS'})))};
test('Netlify production deploy requires exact main context, known site, deploy ID and 40hex SHA',()=>{
 assert.equal(isProductionDeploy(environment),true);
 for(const patch of [{BRANCH:'fix'},{CONTEXT:'deploy-preview'},{DEPLOY_ID:'bad'},
  {COMMIT_REF:'bad'},{SITE_ID:'unknown'}])
  assert.equal(isProductionDeploy({...environment,...patch}),false);
});
test('Netlify locally verified twelve-case report cannot fake a certification',()=>{
 assert.equal(validateNativeReport(report,environment.COMMIT_REF),true);
 for(const patch of [{commit:'b'.repeat(40)},{publication_authorized:true},
  {cases:report.cases.slice(0,11)},{cases:[...report.cases.slice(0,11),report.cases[0]]}])
  assert.throws(()=>validateNativeReport({...report,...patch},environment.COMMIT_REF),/NETLIFY_NATIVE_SCPI_RELEASE/);
});
test('new Supabase secret APIs use apikey header, never Authorization Bearer sb_secret',()=>{
 const key='sb_secret_'+'x'.repeat(31);
 const headers=normalizeSecretHeaders(key);
 assert.equal(headers.apikey,key);
 assert.equal('Authorization' in headers,false);
 const legacy='aa.bb.cc';
 assert.throws(()=>normalizeSecretHeaders('sb_secret_invalid!'),/NETLIFY_NATIVE_SCPI_RELEASE/);
 assert.equal(normalizeSecretHeaders('ey'.repeat(20)+'.ey'.repeat(20)+'.aa'.repeat(12)).Authorization.startsWith('Bearer '),true);
});
