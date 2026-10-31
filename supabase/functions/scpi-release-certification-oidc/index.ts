// Read-only, GitHub OIDC-authenticated release certification snapshot.
// Service role remains on Supabase. No anonymous API key or CI service secret.
import {createRemoteJWKSet, jwtVerify} from 'npm:jose@6.1.0';
import {createClient} from 'npm:@supabase/supabase-js@2.58.0';

const repository='Speedcup212/maximus-scpi';
const expectedRef='refs/heads/main';
const expectedWorkflow=repository+'/.github/workflows/build-verification.yml@'+expectedRef;
const audience='maximus-scpi-release-certification-ygvsddcpohsnaowofuwc';
const issuer='https://token.actions.githubusercontent.com';
const jwks=createRemoteJWKSet(new URL(issuer+'/.well-known/jwks'));
const noStore={'Cache-Control':'no-store'};
const deny=(status:number,error:string)=>Response.json({ok:false,error},{status,headers:noStore});

Deno.serve(async(req:Request)=>{
  if(req.method!=='POST')return deny(405,'POST required');
  let claim;
  try {
    claim=(await jwtVerify(
      (req.headers.get('authorization')||'').replace(/^Bearer /,''),
      jwks,{issuer,audience,algorithms:['RS256'],clockTolerance:'30s'}
    )).payload;
  } catch {return deny(401,'unauthorized');}

  if(claim.repository!==repository || String(claim.repository_id)!=='1125202916' ||
     claim.ref!==expectedRef || claim.workflow_ref!==expectedWorkflow ||
     claim.event_name!=='push' || !/^[0-9a-f]{40}$/.test(String(claim.sha))) {
    return deny(403,'forbidden');
  }
  let body;
  try {
    const raw=await req.text();
    if(raw.length>2000)return deny(413,'payload too large');
    body=JSON.parse(raw);
  } catch{return deny(400,'invalid JSON');}
  if(body?.op!=='attest_release' || body?.sha!==claim.sha)return deny(403,'release SHA mismatch');

  const base=Deno.env.get('SUPABASE_URL');
  const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!base||!key)return deny(500,'release database configuration unavailable');
  const db=createClient(base,key,{auth:{persistSession:false,autoRefreshToken:false}});

  try {
    const {data:pilot,error:pilotError}=await db.from('scpi_trajectory_pilot')
      .select('scpi_slug').eq('enabled',true);
    if(pilotError)throw pilotError;
    const allowed=new Set((pilot||[]).map(row=>String(row.scpi_slug)));
    // Inspect only active SCPI. Staged / disabled SCPI must not change
    // the attested release cohort before their coordinated activation.
    const {data:analyses,error:analysisError}=await db.from('scpi_bulletin_analysis')
      .select('scpi_slug,current_period,previous_period,risk_level,improvements,deteriorations,alerts,watch_points,analysis_version,certification_status,certification_reasons,current_source_certified,comparison_certified,structural_event_detected,certified_source_url')
      .in('scpi_slug',[...allowed]).limit(5000);
    if(analysisError)throw analysisError;
    const observed=new Set((analyses||[]).map(row=>String(row.scpi_slug)));
    if(allowed.size!==65 || (analyses||[]).length!==65 ||
       observed.size!==65 || [...allowed].some(slug=>!observed.has(slug))) {
      return deny(409,'Release coverage mismatch: exact 65 active SCPI analyses required');
    }
    return Response.json({
      ok:true,sha:claim.sha,enabled_scpi:allowed.size,
      analyses
    },{headers:noStore});
  } catch (error) {
    return deny(422,error instanceof Error?error.message:'release verification unavailable');
  }
});
