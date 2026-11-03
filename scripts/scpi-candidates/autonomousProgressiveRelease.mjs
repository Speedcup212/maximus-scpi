// RECOVERY-078: two-phase provisional publication; no forged certification.
// Executes only in a protected GitHub production workflow, after successful
// build AND the exact build-run Chromium screenshot artifact is downloaded.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {verifyNetlifyState} from './autonomousPreparedRelease.mjs';

const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const HEX40=/^[a-f0-9]{40}$/;
const HEX24=/^[a-f0-9]{24}$/;
const HEX64=/^[a-f0-9]{64}$/;
const env=name=>process.env[name] || (()=>{throw Error('MISSING_'+name)})();
const fail=message=>{throw Error('PROGRESSIVE_RELEASE_FAILED_CLOSED:'+message)};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const normal=name=>String(name||'').normalize('NFD')
 .replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
async function request(url,options={}){
 const res=await fetch(url,{...options,signal:AbortSignal.timeout(25000)});
 const body=await res.text();
 if(!res.ok)fail('HTTP_'+res.status+':'+url.split('?')[0]+':'+body.slice(0,150));
 try{return JSON.parse(body)}catch{fail('NOT_JSON:'+url)}
}
export function validateProvisionalCatalog(cohort,catalog,slug){
 if(!Array.isArray(cohort?.slugs)||cohort.count!==cohort.slugs.length||
  new Set(cohort.slugs).size!==cohort.count||!Array.isArray(catalog))fail('COHORT_NOT_EXACT');
 const rows=catalog.filter(x=>normal(x['Nom SCPI'])===slug);
 if(rows.length!==1||!cohort.slugs.includes(slug))fail('CANDIDATE_NOT_IN_DEPLOYED_CATALOG');
 const row=rows[0];const source=row.maximus_metric_provenance?.capitalisation;
 if(row.maximus_publication_status!=='published_with_reserves'||
  row.maximus_publication_disclosure?.status!=='visible'||
  !Array.isArray(row.maximus_publication_reservations) ||
  !row.maximus_publication_reservations.includes('LATEST_STATUTES_UNVERIFIED')||
  !row.maximus_publication_reservations.includes('UNRECONCILED_SHARE_FLOW')||
  !row.maximus_disabled_features?.includes('suitability_recommendations')||
  !row.maximus_disabled_features?.includes('uncertified_history_comparison')||
  !row.maximus_disabled_features?.includes('share_movement_trend')||
  !HEX64.test(source?.pdf_sha256||'')||
  source?.source_period!=='2026-T2'||
  row.td_reference_period!=='2025-RA'||
  row['Décote/Surcote QA']==='publishable'||
  row['Surcote/décote (%)']!==null)fail('UNSUPPORTED_PROVISIONAL_CATALOG');
 return {slug,sourceSha:source.pdf_sha256};
}
export function validateChromiumReport(report,sha){
 const expected=['profile','fintech-card','fintech-row','client','dates','blocked-actions'];
 if(report?.status!=='PASS'||report?.commit!==sha||
   report?.candidate!=='sofidynamic'||report?.source_period!=='2026-T2'||
   report?.publication_authorized!==false||report?.cases?.length!==12)fail('BROWSER_EVIDENCE_INVALID');
 const actual=new Set();
 for(const c of report.cases){
  if(c.status!=='PASS'||!expected.includes(c.surface)||
    ![1440,390].includes(c.width))fail('BROWSER_SURFACE_NOT_PROVEN');
  actual.add(c.surface+':'+c.width);
 }
 if(actual.size!==12 || expected.some(name=>![1440,390].every(w=>actual.has(name+':'+w))))fail('BROWSER_MATRIX_INCOMPLETE');
 return true;
}
async function checkSite(netlifyHeaders,siteId,sha){
 const site=await request('https://api.netlify.com/api/v1/sites/'+siteId,{headers:netlifyHeaders});
 const id=site.published_deploy?.id||site.published_deploy_id;
 if(!HEX24.test(id||''))return null;
 const deploy=await request('https://api.netlify.com/api/v1/deploys/'+id,{headers:netlifyHeaders});
 if(deploy.commit_ref!==sha)return null;
 return verifyNetlifyState(site,deploy,siteId,sha);
}
async function ensureSite(netlifyHeaders,siteId,sha){
 let id=await checkSite(netlifyHeaders,siteId,sha);
 if(id)return id;
 // A main-branch build is requested only after a real, signed 12/12 browser
 // result and Supabase private QA. Netlify builds the Git-connected branch.
 const result=await request('https://api.netlify.com/api/v1/sites/'+siteId+'/builds',{
  method:'POST',headers:{...netlifyHeaders,'Content-Type':'application/json'},body:'{}'
 });
 console.log('NETLIFY_PRODUCTION_BUILD_REQUESTED',JSON.stringify({id:result.id||null,sha}));
 for(let i=0;i<35;i++){
  await wait(12000);
  id=await checkSite(netlifyHeaders,siteId,sha);
  if(id)return id;
 }
 fail('NO_MATCHING_LIVE_NETLIFY_PRODUCTION_SHA');
}
async function verifyPublicPage(sha,slug){
 const root='https://maximusscpi.com/';
 const map=await fetch(root+'sitemap.xml?release_sha='+sha,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(25000)});
 if(!map.ok)fail('MISSING_LIVE_SITEMAP');
 const sitemap=await map.text();
 if(!sitemap.includes('<loc>'+root+slug+'/</loc>'))fail('PROVISIONAL_CANONICAL_MISSING');
 const response=await fetch(root+slug+'/?release_sha='+sha,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(25000)});
 if(!response.ok)fail('LIVE_PRODUCT_ROUTE_NOT_READY');
 const html=await response.text();
 if(!html.includes(root+slug+'/')||!/<title[ >]/i.test(html)||/<meta[^>]+noindex/i.test(html))fail('LIVE_SEO_CONTRACT_MISSING');
}
async function run(){
 const sha=env('EXPECTED_RELEASE_SHA'),siteId=env('NETLIFY_SITE_ID'),slug='sofidynamic';
 if(!HEX40.test(sha)||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()!==sha)fail('CHECKOUT_NOT_BUILD_SHA');
 const cohort=JSON.parse(fs.readFileSync(path.join(ROOT,'src/data/certified_scpi_cohort.json'),'utf8'));
 const catalog=JSON.parse(fs.readFileSync(path.join(ROOT,'src/data/scpi_complet.json'),'utf8'));
 const source=validateProvisionalCatalog(cohort,catalog,slug);
 const service=env('SUPABASE_SERVICE_ROLE_KEY');
 const baseUrl=env('SUPABASE_URL').replace(/\/$/,'');
 const h={apikey:service,Authorization:'Bearer '+service,'Content-Type':'application/json'};
 const prior=await request(baseUrl+'/rest/v1/scpi_indicators?select=scpi_slug&scpi_slug=eq.'+slug,{headers:h});
 if(prior.length){console.log('PROGRESSIVE_ALREADY_PUBLISHED_SKIP',slug);return}
 const reportPath=path.join(ROOT,'test-results/scpi-progressive-public/report.json');
 if(!fs.existsSync(reportPath))fail('MISSING_EXACT_BUILD_BROWSER_REPORT');
 const bytes=fs.readFileSync(reportPath),report=JSON.parse(bytes.toString('utf8'));
 validateChromiumReport(report,sha);
 const proofHash=crypto.createHash('sha256').update(bytes).digest('hex');
 const runUrl='https://github.com/Speedcup212/maximus-scpi/actions/runs/'+env('SOURCE_BUILD_RUN_ID');
 const prepared=await request(baseUrl+'/rest/v1/rpc/maximus_prepare_progressive_release',{
  method:'POST',headers:h,body:JSON.stringify({
    p_release_sha:sha,p_scpi_slug:slug,p_expected_source_sha256:source.sourceSha,
    p_browser_report:report,p_browser_report_sha256:proofHash,p_browser_run_url:runUrl
  })
 });
 if(prepared.prepared!==true||prepared.release_sha!==sha||prepared.certified!==false)fail('PREPARE_NOT_PRIVATE_QA_APPROVED');
 console.log('PROGRESSIVE_PREPARED',JSON.stringify({candidate:slug,sha,runUrl}));
 const site=await ensureSite({Authorization:'Bearer '+env('NETLIFY_AUTH_TOKEN'),Accept:'application/json'},siteId,sha);
 await verifyPublicPage(sha,slug);
 const result=await request(baseUrl+'/rest/v1/rpc/maximus_publish_verified_progressive_release',{
  method:'POST',headers:h,body:JSON.stringify({p_release_sha:sha,p_netlify_deploy_id:site})
 });
 if(result.published!==true||result.certified!==false||result.after!==result.before+1||
    !result.candidate_slugs?.includes(slug))fail('ATOMIC_RELEASE_READBACK_INVALID');
 const anon=env('SUPABASE_ANON_KEY');
 const rows=await request(baseUrl+'/rest/v1/scpi_indicators?select=scpi_slug,qa_status&scpi_slug=eq.'+slug,{
  headers:{apikey:anon,Authorization:'Bearer '+anon}});
 if(rows.length!==1||rows[0].qa_status!=='verified_primary_source_with_reserves')fail('ANON_VISIBLE_PUBLICATION_MISSING');
 console.log('PROGRESSIVE_PUBLICATION_COMPLETE',JSON.stringify({sha,site,result,anonymousReadback:rows}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 run().catch(e=>{console.error(String(e));process.exitCode=1});
}
