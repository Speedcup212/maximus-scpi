import {createRemoteJWKSet,jwtVerify} from 'npm:jose@6.1.0';
import {createClient} from 'npm:@supabase/supabase-js@2.58.0';
const issuer='https://token.actions.githubusercontent.com';
const jwks=createRemoteJWKSet(new URL(issuer+'/.well-known/jwks'));
const repo='Speedcup212/maximus-scpi';
const refs=['refs/heads/main','refs/heads/recovery/all-bulletins-completeness-20261027'];
const fail=(status:number,error:string)=>Response.json({error},{status,headers:{'Cache-Control':'no-store'}});
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return fail(405,'POST required');
 let jwt;
 try{jwt=(await jwtVerify((req.headers.get('authorization')||'').replace(/^Bearer /,''),jwks,{issuer,audience:'maximus-scpi-bulletin-replay-ygvsddcpohsnaowofuwc',algorithms:['RS256'],clockTolerance:'30s'})).payload;}
 catch{return fail(401,'unauthorized');}
 if(jwt.repository!==repo||String(jwt.repository_id)!=='1125202916'||!refs.includes(String(jwt.ref))||
    jwt.workflow_ref!==repo+'/.github/workflows/maximus-all-bulletins-replay.yml@'+jwt.ref||
    !['push','schedule','workflow_dispatch'].includes(String(jwt.event_name)))return fail(403,'forbidden');
 const base=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!base||!key)return fail(500,'runtime configuration unavailable');
 const db=createClient(base,key,{auth:{persistSession:false,autoRefreshToken:false}});
 try{
  const raw=await req.text();if(raw.length>2500000)return fail(413,'payload too large');
  const body=JSON.parse(raw);
  if(body.op==='health'){
   const {data,error}=await db.rpc('scpi_bulletin_replay_health',{p_version:body.parser_version});if(error)throw error;
   return Response.json(data,{headers:{'Cache-Control':'no-store'}});
  }
  if(body.op==='seed'){
   const {data,error}=await db.rpc('scpi_bulletin_replay_seed');if(error)throw error;
   return Response.json({ok:true,seeded:data},{headers:{'Cache-Control':'no-store'}});
  }
  if(body.op==='claim'){
   if(!/^all-bulletins-[a-zA-Z0-9-]+$/.test(String(body.parser_version)))return fail(400,'invalid version');
   const {data,error}=await db.rpc('scpi_bulletin_replay_claim',{p_version:body.parser_version});if(error)throw error;
   // Download only the already-archived registered object; no arbitrary Storage paths.
   if(data?.task?.pdf_path&&!/(^|[.\-])(?:extranet|intranet|private|login|auth)([.\-]|$)/i.test(new URL(data.task.source_url).hostname)){
    const {data:signed}=await db.storage.from('scpi-bulletins').createSignedUrl(data.task.pdf_path,600);
    if(signed?.signedUrl)data.task.archived_download_url=signed.signedUrl;
   }
   return Response.json(data,{headers:{'Cache-Control':'no-store'}});
  }
  if(body.op==='record'){
   if(!/^[0-9a-f-]{36}$/i.test(String(body.lease_token)))return fail(400,'invalid lease');
   const {data,error}=await db.rpc('scpi_bulletin_replay_record',{p_doc:body.doc,p_lease:body.lease_token});if(error)throw error;
   return Response.json(data,{headers:{'Cache-Control':'no-store'}});
  }
  if(body.op==='register_link'){
   const {data,error}=await db.rpc('scpi_bulletin_replay_register_link',{p_parent:body.document_key,p_lease:body.lease_token,p_link:body.link});if(error)throw error;
   return Response.json(data,{headers:{'Cache-Control':'no-store'}});
  }
  if(body.op==='archive_prepare'){
   const {data:target,error}=await db.rpc('scpi_bulletin_replay_archive_target',{p_key:body.document_key,p_lease:body.lease_token,p_sha:body.sha256});if(error)throw error;
   const {data:signed,error:signError}=await db.storage.from('scpi-bulletins').createSignedUploadUrl(target.path);
   if(signError){
    if(/already exists|duplicate/i.test(signError.message))return Response.json({ok:true,path:target.path,already_archived:true},{headers:{'Cache-Control':'no-store'}});
    throw signError;
   }
   return Response.json({ok:true,path:target.path,signed_url:signed.signedUrl},{headers:{'Cache-Control':'no-store'}});
  }
  return fail(400,'unsupported operation');
 }catch(err){return fail(422,err instanceof Error?err.message:String((err as any)?.message||'replay transaction rejected'));}
});
