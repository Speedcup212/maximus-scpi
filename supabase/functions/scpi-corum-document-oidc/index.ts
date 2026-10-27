import {createRemoteJWKSet,jwtVerify} from 'npm:jose@6.1.0';
import {createClient} from 'npm:@supabase/supabase-js@2.58.0';
const issuer='https://token.actions.githubusercontent.com';
const jwks=createRemoteJWKSet(new URL(issuer+'/.well-known/jwks'));
const repo='Speedcup212/maximus-scpi';
const refs=['refs/heads/main','refs/heads/recovery/corum-backfill-20261027'];
const funds=['corum-origin','corum-xl','corum-eurion','corum-usa'];
const fail=(status:number,error:string)=>Response.json({error},{status,headers:{'Cache-Control':'no-store'}});
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return fail(405,'POST required');
 const token=(req.headers.get('authorization')||'').replace(/^Bearer /,'');
 let jwt;
 try{jwt=(await jwtVerify(token,jwks,{issuer,audience:'maximus-corum-documents-ygvsddcpohsnaowofuwc',algorithms:['RS256'],clockTolerance:'30s'})).payload;}
 catch{return fail(401,'unauthorized');}
 if(jwt.repository!==repo||String(jwt.repository_id)!=='1125202916'||!refs.includes(String(jwt.ref))||
    jwt.workflow_ref!==repo+'/.github/workflows/maximus-corum-document-pipeline.yml@'+jwt.ref||
    !['push','schedule','workflow_dispatch'].includes(String(jwt.event_name)))return fail(403,'forbidden');
 const base=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!base||!key)return fail(500,'runtime configuration unavailable');
 const db=createClient(base,key,{auth:{persistSession:false,autoRefreshToken:false}});
 try{
  const raw=await req.text();if(raw.length>1200000)return fail(413,'payload too large');
  const body=JSON.parse(raw);
  if(body.op==='registry'){
   const {data,error}=await db.from('scpi_source_registry')
    .select('scpi_slug,bulletin_url,annual_report_url,official_scpi_page_url')
    .eq('automation_enabled',true).eq('ingestion_driver','corum_dual_pdf_v1').in('scpi_slug',funds);
   if(error)throw error;
   return Response.json({ok:true,registry:data},{headers:{'Cache-Control':'no-store'}});
  }
  if(body.op==='record'){
   if(!funds.includes(String(body.doc?.slug)))return fail(400,'unapproved fund');
   const {data:registry,error:registryError}=await db.from('scpi_source_registry')
    .select('automation_enabled,ingestion_driver').eq('scpi_slug',body.doc.slug).single();
   if(registryError||!registry?.automation_enabled||registry.ingestion_driver!=='corum_dual_pdf_v1')return fail(409,'driver disabled');
   const {data,error}=await db.rpc('scpi_corum_record_document',{p_doc:body.doc});
   if(error)throw error;
   const checked=new Date().toISOString();
   const progress:any={last_checked_at:checked,next_check_at:new Date(Date.now()+24*3600*1000).toISOString()};
   if(['certified_core','certified_core_existing','source_verified','unchanged','duplicate_sha256'].includes(String(data?.status)))progress.last_success_at=checked;
   const {error:progressError}=await db.from('scpi_source_registry').update(progress).eq('scpi_slug',body.doc.slug);
   if(progressError)throw progressError;
   return Response.json(data,{headers:{'Cache-Control':'no-store'}});
  }
  return fail(400,'invalid operation');
 }catch(err){return fail(422,err instanceof Error?err.message:String((err as any)?.message||'document transaction rejected'));}
});
