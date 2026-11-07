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
  // RECOVERY-149: existing protected GitHub OIDC replay workflow may inspect
  // ONLY these two issuer-registered PDFs already in PRIVATE Storage. This
  // repairs official publisher HTTP 502 without opening the bucket and without
  // exposing service_role. No arbitrary paths, slugs, PDFs or presigned URLs.
  if(body.op==='archived_exact_source_probe'){
   const allowlist=[
    {slug:'paref-evo',period:'2024-T4',
     sha:'c9abf92651017d3d83400949a07d5a41aef594775c48bd7e0065da391d1e17d9',
     url:'https://paref-gestion.com/wp-content/uploads/2025/04/05c7e184-d5e4-4cdd-bf9f-7ee2c008b217-BTI-T4-2024-PAREF-Evo.pdf'},
    {slug:'paref-hexa',period:'2026-T3',
     sha:'ca4a3569a990f99b376268875440ebc1e1aadefa85aab582ebca96cbce0c62ce',
     url:'https://paref-gestion.com/wp-content/uploads/2026/10/dc0cd675-deb0-4ab0-b928-040f9aafd157-BTI-T3-2026-PAREF-Hexa.pdf'},
   ];
   const matched=allowlist.find(x=>x.slug===body.slug&&x.period===body.period&&x.sha===body.sha256);
   if(!matched)return fail(403,'archive source not explicitly allowlisted');
   const {data:rows,error:rowError}=await db.from('scpi_bulletins')
    .select('id,scpi_slug,period,source_url,pdf_sha256,pdf_path,qa_status')
    .eq('scpi_slug',matched.slug).eq('period',matched.period).limit(2);
   if(rowError)throw rowError;
   if(!rows||rows.length!==1)return fail(409,'registered issuer PDF expected exactly once');
   const row=rows[0];
   const pinnedPath=matched.slug+'/'+matched.period+'/'+matched.sha+'.pdf';
   if(row.pdf_sha256!==matched.sha||row.source_url!==matched.url||
      row.pdf_path!==pinnedPath||!row.id)return fail(409,'source registry immutable identity mismatch');
   const {data:signed,error:signError}=await db.storage.from('scpi-bulletins')
     .createSignedUrl(pinnedPath,120);
   if(signError||!signed?.signedUrl)return fail(404,'source binary archive inaccessible');
   // The signed URL MUST stay only in the authenticated runner process:
   // never log, save it in an artifact or include it in financial evidence.
   return Response.json({status:'exact_registered_archived_issuer_source',
    slug:matched.slug,period:matched.period,sha256:matched.sha,
    signed_url:signed.signedUrl,expires_in_seconds:120},
    {headers:{'Cache-Control':'no-store'}});
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
