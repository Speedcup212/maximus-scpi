/**
 * RECOVERY-081: production-only, Netlify-native scheduled publication.
 *
 * This job uses the project's existing server-only service key, never
 * client-side VITE_ credentials or missing GitHub Actions secrets.
 * No HTTP route: scheduled invocations alone. The SQL RPC independently
 * validates official documents and transactional QA before making anything
 * visible to the anonymous reader.
 */
import {createClient} from '@supabase/supabase-js';
import {createHash} from 'node:crypto';
import type {Config,Context} from '@netlify/functions';

const UUID24=/^[a-f0-9]{24}$/;
const SHA40=/^[a-f0-9]{40}$/;
const SHA64=/^[a-f0-9]{64}$/;
const candidate='sofidynamic';
const origin='https://maximusscpi.com';
const repo='Speedcup212/maximus-scpi';
const error=(code:string):never=>{throw new Error('NETLIFY_PROGRESSIVE_PUBLICATION:'+code)};
const fetchJson=async(url:string)=>{
 const response=await fetch(url,{
  headers:{Accept:'application/vnd.github+json','User-Agent':'MaximusSCPI-release-evidence','Cache-Control':'no-store'},
  signal:AbortSignal.timeout(9000)
 });
 if(!response.ok)error('EVIDENCE_HTTP_'+response.status);
 return response.json() as Promise<any>;
};
const fetchText=async(url:string)=>{
 const response=await fetch(url,{headers:{'Cache-Control':'no-store'},signal:AbortSignal.timeout(9000)});
 if(!response.ok)error('LIVE_PAGE_HTTP_'+response.status);
 return response.text();
};
const validatedReport=(report:any,sha:string)=>{
 const required=['profile','fintech-card','fintech-row','client','dates','blocked-actions'];
 if(report?.status!=='PASS'||report?.candidate!==candidate||report?.commit!==sha||
   report?.publication_authorized!==false||report?.source_period!=='2026-T2'||
   !Array.isArray(report?.cases)||report.cases.length!==12)error('BROWSER_REPORT_BAD');
 const seen=new Set<string>();
 for(const c of report.cases){
  if(!required.includes(c.surface)||c.status!=='PASS'||![390,1440].includes(c.width))
   error('BROWSER_CASE_NOT_PASS');
  seen.add(c.surface+':'+c.width);
 }
 if(seen.size!==12||required.some(name=>![390,1440].every(w=>seen.has(name+':'+w))))
  error('BROWSER_MATRIX_MISSING');
};
export default async (_req:Request,context:Context)=>{
 // Scheduled functions have no public endpoint; still require a true current,
 // production-published deployment, not a preview or untrusted branch build.
 const deploy=context.deploy;
 if(!deploy || deploy.context!=='production'||deploy.published!==true||
    !UUID24.test(deploy.id||'')){
   console.log('PROGRESSIVE_NATIVE_SKIP_NON_PUBLISHED_PRODUCTION');
   return;
 }
 const supabaseUrl=process.env.SUPABASE_URL;
 const backendKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
 const anon=process.env.VITE_SUPABASE_ANON_KEY;
 if(!supabaseUrl||!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(supabaseUrl)||
    !backendKey||!anon)error('NETLIFY_SERVER_VARIABLES_INCOMPLETE');
 // Netlify project values are server-only inside a function; do not send or
 // print the service key or attach it to a VITE_ variable.
 const admin=createClient(supabaseUrl,backendKey,{
  auth:{persistSession:false,autoRefreshToken:false},
 });
 const {data:already,error:readError}=await admin.from('scpi_indicators')
  .select('scpi_slug').eq('scpi_slug',candidate).limit(1);
 if(readError)error('SUPABASE_READ:'+readError.code);
 if(already?.length){
   console.log('PROGRESSIVE_NATIVE_ALREADY_PUBLIC',candidate);
   return;
 }
 const evidence=await fetchJson(origin+'/.well-known/scpi-progressive-evidence.json?d='+deploy.id);
 if(evidence?.schema_version!==1||evidence.project!=='maximusscpi'||
    evidence.environment!=='production'||evidence.candidate!==candidate||
    evidence.source_period!=='2026-T2'||evidence.full_certification_claim!==false||
    !SHA40.test(evidence.commit||'')||!SHA64.test(evidence.source_pdf_sha256||'')||
    !SHA64.test(evidence.browser_report_sha256||''))error('BUILD_PROVENANCE_INVALID');
 validatedReport(evidence.browser_report,evidence.commit);
 const reportString=JSON.stringify(evidence.browser_report,null,2);
 if(createHash('sha256').update(reportString).digest('hex')!==evidence.browser_report_sha256)
   error('BROWSER_REPORT_SHA_MISMATCH');
 // The live deployment serves this manifest; require a completed, successful
 // first-party GitHub push build for *exactly* that source revision.
 const runs=await fetchJson(
  'https://api.github.com/repos/'+repo+'/actions/runs?head_sha='+evidence.commit+'&per_page=30'
 );
 const ci=(runs.workflow_runs||[]).find((run:any)=>
  run.head_sha===evidence.commit&&run.head_branch==='main'&&run.event==='push'&&
  run.name==='Build verification'&&run.status==='completed'&&run.conclusion==='success');
 if(!ci||!Number.isSafeInteger(ci.id))error('CI_NOT_PASSED_FOR_NETLIFY_SOURCE_SHA');

 const sitemap=await fetchText(origin+'/sitemap.xml?d='+deploy.id);
 if(!sitemap.includes('<loc>'+origin+'/sofidynamic/</loc>'))error('SITEMAP_PUBLIC_ROUTE_MISSING');
 const page=await fetchText(origin+'/sofidynamic/?d='+deploy.id);
 if(!/<title[ >]/i.test(page)||!page.includes('/sofidynamic/')||
     /<meta[^>]+noindex/i.test(page))error('CANONICAL_PUBLIC_ROUTE_MISSING');
 const ciRunUrl='https://github.com/'+repo+'/actions/runs/'+ci.id;

 const {data:prepared,error:prepareError}=await admin.rpc('maximus_prepare_progressive_release',{
  p_release_sha:evidence.commit,
  p_scpi_slug:candidate,
  p_expected_source_sha256:evidence.source_pdf_sha256,
  p_browser_report:evidence.browser_report,
  p_browser_report_sha256:evidence.browser_report_sha256,
  p_browser_run_url:ciRunUrl,
 });
 if(prepareError||prepared?.prepared!==true||prepared?.release_sha!==evidence.commit||
    prepared?.certified!==false){
  console.error('PROGRESSIVE_NATIVE_PREPARE_REFUSED',prepareError?.code||'gate_false');
  return;
 }
 const {data:published,error:publishError}=await admin.rpc('maximus_publish_verified_progressive_release',{
  p_release_sha:evidence.commit,p_netlify_deploy_id:deploy.id,
 });
 if(publishError||published?.published!==true||published?.certified!==false||
    published?.after!==published?.before+1||!published?.candidate_slugs?.includes(candidate)){
  console.error('PROGRESSIVE_NATIVE_PUBLISH_REFUSED',publishError?.code||'readback_failure');
  return;
 }
 const pub=createClient(supabaseUrl,anon,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:publicRow,error:publicError}=await pub.from('scpi_indicators')
  .select('scpi_slug,qa_status').eq('scpi_slug',candidate);
 if(publicError||publicRow?.length!==1||
    publicRow?.[0]?.qa_status!=='verified_primary_source_with_reserves')
   error('ANON_READBACK_FAILED');
 console.log('PROGRESSIVE_NATIVE_SUCCESS',JSON.stringify({
   candidate,commit:evidence.commit,deployId:deploy.id,publicCount:published.after,
   certification:'partial_with_reserves',ciRunUrl,
 }));
};
export const config:Config={schedule:'*/10 * * * *'};
