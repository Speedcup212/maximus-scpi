/**
 * RECOVERY-081: native Netlify build/plugin release.
 * GitHub CI certifies source; Netlify onSuccess is the only final deploy
 * attestation. No GitHub-hosted Netlify or Supabase credentials are needed.
 */
import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
const SLUG='sofidynamic';
const ROOT=process.cwd();
const HEX40=/^[a-f0-9]{40}$/;
const HEX24=/^[a-f0-9]{24}$/;
const HEX64=/^[a-f0-9]{64}$/;
const SITE_ID='e4f16f87-663d-4965-8de8-00f6840f1aa7';
const URL='https://ygvsddcpohsnaowofuwc.supabase.co';
const REPO='Speedcup212/maximus-scpi';
const EXPECTED=['profile','fintech-card','fintech-row','client','dates','blocked-actions'];
const error=(code)=>{throw Error('NETLIFY_NATIVE_SCPI_RELEASE_'+code)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export const isProductionDeploy=(env)=>{
 const sha=env.COMMIT_REF||'';
 if(env.CONTEXT!=='production'||env.BRANCH!=='main')return false;
 if(!HEX40.test(sha)||!HEX24.test(env.DEPLOY_ID||'')||
   env.SITE_ID!==SITE_ID)return false;
 return true;
};
export function validateNativeReport(report,sha) {
 if(!HEX40.test(sha)||report?.status!=='PASS'||report?.commit!==sha||
    report?.candidate!==SLUG||report?.source_period!=='2026-T2'||
    report?.publication_authorized!==false||report?.cases?.length!==12)
   error('BROWSER_REPORT_UNTRUSTWORTHY');
 const seen=new Set();
 for(const c of report.cases){
   if(!EXPECTED.includes(c.surface)||![1440,390].includes(c.width)||
     c.status!=='PASS')error('UNVERIFIED_REAL_BROWSER_CASE');
   seen.add(c.surface+':'+c.width);
 }
 if(seen.size!==12||EXPECTED.some(s=>![1440,390].every(w=>seen.has(s+':'+w))))
    error('BROWSER_MATRIX_INCOMPLETE');
 return true;
}
export function normalizeSecretHeaders(key) {
 if(!key||key.length<25)error('NETLIFY_SERVER_SECRET_UNAVAILABLE');
 if(/^sb_secret_[a-zA-Z0-9_-]+$/.test(key))return {apikey:key};
 if(key.split('.').length===3)return {apikey:key,Authorization:'Bearer '+key};
 error('UNRECOGNIZED_SUPABASE_BACKEND_CREDENTIAL');
}
export function validateCandidateCatalog(){
 const cohort=JSON.parse(readFileSync(join(ROOT,'src/data/certified_scpi_cohort.json'),'utf8'));
 const catalog=JSON.parse(readFileSync(join(ROOT,'src/data/scpi_complet.json'),'utf8'));
 const slug=name=>String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
 if(cohort.count!==cohort.slugs?.length||!cohort.slugs.includes(SLUG))error('PUBLIC_COHORT_NOT_STAGED');
 const rows=catalog.filter(row=>slug(row['Nom SCPI'])===SLUG);
 if(rows.length!==1)error('AMBIGUOUS_PROVISIONAL_CATALOG');
 const row=rows[0];
 const p=row.maximus_metric_provenance?.capitalisation;
 if(row.maximus_publication_status!=='published_with_reserves'||
   row.maximus_publication_disclosure?.status!=='visible'||
   !row.maximus_publication_reservations?.includes('LATEST_STATUTES_UNVERIFIED')||
   !row.maximus_publication_reservations?.includes('UNRECONCILED_SHARE_FLOW')||
   !row.maximus_disabled_features?.includes('suitability_recommendations')||
   !row.maximus_disabled_features?.includes('uncertified_history_comparison')||
   !row.maximus_disabled_features?.includes('share_movement_trend')||
   row['Surcote/décote (%)']!==null||
   row['Décote/Surcote QA']==='publishable'||
   !HEX64.test(p?.pdf_sha256||'')||p?.source_period!=='2026-T2')error('UNQUALIFIED_PROVISIONAL_CATALOG');
 return {cohort,sourceSha:p.pdf_sha256};
}
async function json(url,options={}){
 const response=await fetch(url,{...options,signal:AbortSignal.timeout(30000)});
 const content=await response.text();
 if(!response.ok)error('BACKEND_HTTP_'+response.status+':'+new URL(url).pathname+':'+content.slice(0,100));
 try{return JSON.parse(content)}catch{error('BACKEND_NOT_JSON:'+new URL(url).pathname)}
}
async function api(path,secret,body=undefined){
 const headers={...normalizeSecretHeaders(secret)};
 if(body!==undefined)headers['Content-Type']='application/json';
 const result=await json(URL+'/rest/v1/'+path,{
  method:body===undefined?'GET':'POST',headers,
  ...(body===undefined?{}:{body:JSON.stringify(body)})
 });
 return result;
}
async function checkGithubSuccessfulBuild(sha){
 const link='https://api.github.com/repos/'+REPO+'/actions/runs?head_sha='+sha+'&per_page=50';
 for(let i=0;i<40;i++){
  const data=await json(link,{headers:{Accept:'application/vnd.github+json','User-Agent':'maximusscpi-native-release'}});
  const runs=(data.workflow_runs||[]).filter(x=>x.name==='Build verification' &&
    x.event==='push'&&x.head_branch==='main'&&x.head_sha===sha);
  const passed=runs.find(x=>x.status==='completed'&&x.conclusion==='success');
  if(passed)return 'https://github.com/'+REPO+'/actions/runs/'+passed.id;
  if(runs.some(x=>x.status==='completed'&&x.conclusion==='failure'))error('GITHUB_BUILD_NOT_GREEN');
  await sleep(9000);
 }
 error('GITHUB_BUILD_NOT_CONFIRMED');
}
async function checkPublishedManifest(sha,deployId){
 const manifestUrl='https://maximusscpi.com/scpi-release-manifest.json?sha='+sha;
 const r=await json(manifestUrl,{headers:{'Cache-Control':'no-cache'}});
 if(r.sha!==sha||r.deploy_id!==deployId||r.issuer!==REPO||
    r.context!=='production')error('LIVE_NETLIFY_MANIFEST_SHA_MISMATCH');
 const map=await fetch('https://maximusscpi.com/sitemap.xml?sha='+sha,
  {headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(30000)});
 if(!map.ok)error('SITEMAP_NOT_LIVE');
 const xml=await map.text();
 if(!xml.includes('<loc>https://maximusscpi.com/sofidynamic/</loc>'))error('SITEMAP_CANDIDATE_MISSING');
 const page=await fetch('https://maximusscpi.com/sofidynamic/?sha='+sha,{
  headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(30000)});
 if(!page.ok)error('LIVE_CANDIDATE_ROUTE_MISSING');
 const html=await page.text();
 if(!/<title[ >]/i.test(html)||/noindex/i.test(html))error('LIVE_SEO_NOT_VALID');
}
async function publishPreparedCertified(secret,sha,deployId){
 const prepared=await api('rpc/maximus_prepared_release_slugs',secret,{p_sha:sha});
 if(!Array.isArray(prepared)||prepared.length===0)return null;
 const result=await api('rpc/maximus_publish_verified_prepared_release',secret,
   {p_release_sha:sha,p_netlify_deploy_id:deployId});
 if(result?.published!==true||result?.after!==result?.before+prepared.length)
   error('CERTIFIED_ATOMIC_RELEASE_FAILED');
 return {status:'certified',after:result.after};
}
export async function onPostBuildSourceCheck(env) {
 if(!isProductionDeploy(env))return 'SKIPPED_NONPRODUCTION';
 const {cohort}=validateCandidateCatalog();
 const secret=env.SUPABASE_SERVICE_ROLE_KEY;
 const prior=await api('scpi_indicators?select=scpi_slug&scpi_slug=eq.sofidynamic',secret);
 if(!Array.isArray(prior))error('INVALID_SOURCE_BACKEND_RESPONSE');
 if(prior.length)return 'ALREADY_PUBLIC';
 const testEnv={...env,VITE_SUPABASE_URL:'https://progressive-preview.supabase.co',VITE_SUPABASE_ANON_KEY:'test-only'};
 delete testEnv.SUPABASE_SERVICE_ROLE_KEY;
 delete testEnv.SUPABASE_SECRET_KEYS;
 execFileSync(process.execPath,['scripts/scpi-onboarding/progressivePublicBrowser.mjs'],
  {cwd:ROOT,env:testEnv,stdio:'inherit',timeout:180000});
 const file=join(ROOT,'test-results/scpi-progressive-public/report.json');
 if(!existsSync(file))error('NETLIFY_BROWSER_REPORT_ABSENT');
 const report=JSON.parse(readFileSync(file,'utf8'));
 validateNativeReport(report,env.COMMIT_REF);
 if(cohort.count!==69)error('UNEXPECTED_PUBLIC_COHORT_NUMBER');
 return 'PASS_12_REAL_CHROMIUM_CASES';
}
export async function onSuccessRelease(env){
 if(!isProductionDeploy(env))return {status:'SKIPPED_NONPRODUCTION'};
 const sha=env.COMMIT_REF,deployId=env.DEPLOY_ID;
 const secret=env.SUPABASE_SERVICE_ROLE_KEY;
 if(!secret)error('NETLIFY_SERVER_SECRET_UNAVAILABLE');
 if(env.SUPABASE_URL!==URL)error('NETLIFY_SUPABASE_PROJECT_MISMATCH');
 if(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()!==sha)error('CHECKOUT_SHA_MISMATCH');
 await checkPublishedManifest(sha,deployId);
 const runUrl=await checkGithubSuccessfulBuild(sha);
 let certified=await publishPreparedCertified(secret,sha,deployId);
 const prior=await api('scpi_indicators?select=scpi_slug&scpi_slug=eq.sofidynamic',secret);
 if(prior.length)return {status:'ALREADY_PUBLIC',certified,sha,deployId};
 const {sourceSha}=validateCandidateCatalog();
 const file=join(ROOT,'test-results/scpi-progressive-public/report.json');
 if(!existsSync(file))error('EXACT_NETLIFY_BROWSER_PROOF_MISSING');
 const bytes=readFileSync(file),report=JSON.parse(bytes.toString('utf8'));
 validateNativeReport(report,sha);
 const proofHash=createHash('sha256').update(bytes).digest('hex');
 const prepared=await api('rpc/maximus_prepare_progressive_release',secret,{
   p_release_sha:sha,p_scpi_slug:SLUG,p_expected_source_sha256:sourceSha,
   p_browser_report:report,p_browser_report_sha256:proofHash,p_browser_run_url:runUrl
 });
 if(prepared?.prepared!==true||prepared?.certified!==false||
    prepared?.release_sha!==sha)error('PROVISIONAL_PREPARE_FAILED');
 const result=await api('rpc/maximus_publish_verified_progressive_release',secret,{
   p_release_sha:sha,p_netlify_deploy_id:deployId
 });
 if(result?.published!==true||result?.certified!==false||
    result.after!==result.before+1||!result.candidate_slugs?.includes(SLUG))
    error('PROVISIONAL_ATOMIC_RELEASE_FAILED');
 const anon=env.VITE_SUPABASE_ANON_KEY;
 if(!anon)error('PUBLIC_ANON_KEY_NOT_SET');
 const publicRows=await json(URL+'/rest/v1/scpi_indicators?select=scpi_slug,qa_status&scpi_slug=eq.sofidynamic',{
   headers:normalizeSecretHeaders(anon)
 });
 if(publicRows.length!==1||
    publicRows[0].qa_status!=='verified_primary_source_with_reserves')
   error('PUBLIC_ANON_RLS_READBACK_FAILED');
 return {status:'PUBLISHED_WITH_RESERVES',after:result.after,sha,deployId,certified};
}
export function writeBuildManifest(env){
 if(!isProductionDeploy(env))return;
 if(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()!==env.COMMIT_REF)
    error('BUILD_SOURCE_SHA_MISMATCH');
 const manifest={sha:env.COMMIT_REF,deploy_id:env.DEPLOY_ID,
   issuer:REPO,context:'production'};
 mkdirSync(join(ROOT,'public'),{recursive:true});
 writeFileSync(join(ROOT,'public/scpi-release-manifest.json'),JSON.stringify(manifest)+'\n');
}
