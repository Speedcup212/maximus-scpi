// RECOVERY-117: read-only parallel agent adapter to the EXISTING maximus_agents
// tasks/runs/agents tables. No model API keys, finance mutations or release.
import { createRemoteJWKSet, jwtVerify } from "npm:jose@6.1.0";
import postgres from "npm:postgres@3.4.7";

const issuer="https://token.actions.githubusercontent.com";
const jwks=createRemoteJWKSet(new URL(issuer+"/.well-known/jwks"));
const audience="maximus-parallel-audit-ygvsddcpohsnaowofuwc";
const repo="Speedcup212/maximus-scpi";
const workflowRef=repo+"/.github/workflows/maximus-agent-parallel.yml@refs/heads/main";
const connection=Deno.env.get("SUPABASE_DB_URL");
if(!connection)throw Error("Database connection unavailable");
const sql=postgres(connection,{max:1,prepare:false,ssl:"require",connect_timeout:10,idle_timeout:15});
const roles=new Set(["DATA","SEARCH","ANALYST","QA"]);

Deno.serve(async request=>{
  if(request.method!=="POST")return new Response("Method not allowed",{status:405});
  const auth=request.headers.get("authorization")||"";
  if(!auth.startsWith("Bearer "))return new Response("Unauthorized",{status:401});
  try{
    const {payload}=await jwtVerify(auth.slice(7),jwks,{
      issuer,audience,algorithms:["RS256"],clockTolerance:"30s"});
    if(payload.repository!==repo||String(payload.repository_id)!=="1125202916"||
       payload.ref!=="refs/heads/main"||payload.workflow_ref!==workflowRef||
       !["schedule","workflow_dispatch","push"].includes(String(payload.event_name)))
      return new Response("Forbidden",{status:403});
    const body=await request.json().catch(()=>({}));
    if(body.op==="prepare"){
      if(Number(payload.run_attempt||1)!==1)
        return Response.json({prepared:false,reason:"rerun_denied"});
      const [r]=await sql`select maximus_agents.prepare_parallel_audit_cycle() as result`;
      return Response.json({prepared:true,cycle:r.result});
    }
    if(body.op==="prepare_candidate"){
      if(Number(payload.run_attempt||1)!==1)
        return Response.json({prepared:false,reason:"rerun_denied"});
      const [r]=await sql`select maximus_agents.prepare_candidate_evidence_pilot() as result`;
      if(r.result?.prepared===true){
        // A CONTROL heartbeat proves orchestration/preparation, NOT model work.
        const summary={mode:"candidate_documentary_audit",cycle:r.result,
          prepared_at:new Date().toISOString(),
          actual_inference_executed:false,deploy_allowed:false};
        await sql`update maximus_agents.agents set
          heartbeat_at=now(),last_summary=${sql.json(summary)}::jsonb
          where role='CONTROL' and enabled=true`;
      }
      return Response.json({prepared:r.result?.prepared===true,cycle:r.result});
    }
    if(body.op==="candidate_manifest"){
      // Return only the selected task's existing, immutable-at-dispatch source
      // references, never an arbitrary user-supplied URL or SCPI.
      const rows=await sql`select t.payload->'candidate_evidence' as evidence
        from maximus_agents.tasks t
        where t.dedupe_key=((now() at time zone 'Europe/Paris')::date::text
          ||':candidate-evidence:DATA')
          and t.kind='audit'
          and t.payload->>'mode'='candidate_documentary_audit'
        limit 1`;
      const evidence=rows[0]?.evidence;
      if(!evidence)return Response.json({exists:false,documents:[],deploy_allowed:false});
      const allowedRows=await sql`select hostname from
        maximus_agents.scpi_candidate_issuer_hosts
        where approved_at is not null`;
      const hosts=new Set(allowedRows.map(row=>String(row.hostname||'').toLowerCase()));
      const documents=evidence.documents;
      if(!/^[a-z0-9-]{2,100}$/.test(String(evidence.scpi_slug||''))||
          typeof evidence.scpi_name!=='string'||
          !Array.isArray(documents)||documents.length>8||
          documents.some(d=>{
            try{
              const u=new URL(d.source_url);
              return u.protocol!=='https:'||u.username||u.password||
                (u.port&&u.port!=='443')||!hosts.has(u.hostname.toLowerCase())||
                d.document_identity_verified!==true||
                !/^[0-9a-f]{64}$/i.test(d.pdf_sha256||'')||
                !Number.isInteger(d.page_count)||d.page_count<1||
                !['quarterly_bulletin','annual_report'].includes(d.document_kind);
            }catch{return true;}
          }))
        return new Response("Untrusted candidate PDF manifest",{status:422});
      return Response.json({
        exists:true,candidate_slug:evidence.scpi_slug,
        candidate_name:evidence.scpi_name,
        allowed_hosts:[...hosts].sort(),
        documents:documents.map(d=>({
          source_url:d.source_url,source_period:d.source_period,
          document_kind:d.document_kind,
          pdf_sha256:d.pdf_sha256,page_count:d.page_count
        })),
        financial_certified:false,deploy_allowed:false
      });
    }
    if(body.op==="candidate_status"){
      const rows=await sql`select role,status,attempts from maximus_agents.tasks
        where cycle_date=(now() at time zone 'Europe/Paris')::date
          and payload->>'mode'='candidate_documentary_audit'
        order by role`;
      return Response.json({tasks:rows,deploy_allowed:false});
    }
    if(body.op==="claim"&&roles.has(body.role)){
      // Every GitHub run may claim at most one task per role. SQL also enforces
      // lease, daily budget, dependencies, audit-kind and task deduplication.
      if(Number(payload.run_attempt||1)!==1)
        return Response.json({task:null,reason:"rerun_denied"});
      const rows=await sql`select id,role,kind,title,cycle_date,dedupe_key,payload,
          lease_token,attempts,depends_on from
          maximus_agents.claim_parallel_audit_task(${body.role})`;
      const t=rows[0];
      if(!t)return Response.json({task:null,reason:"no_eligible_today_or_budget"});
      if(t.role!==body.role||t.kind!=="audit"||
         !["parallel_readonly_audit","candidate_documentary_audit"].includes(t.payload?.mode)||!t.lease_token)
        throw Error("Task scope mismatch");
      return Response.json({task:{...t,deploy_allowed:false}});
    }
    if(body.op==="qa_context"&&typeof body.task_id==="string"&&
       typeof body.lease_token==="string"){
      const rows=await sql`select id,role,kind,depends_on
        from maximus_agents.tasks
        where id=${body.task_id}::uuid and lease_token=${body.lease_token}::uuid
          and role='QA' and kind='audit' and status='running'
          and lease_until>now() and payload->>'mode' in ('parallel_readonly_audit','candidate_documentary_audit')`;
      if(rows.length!==1)return new Response("Forbidden",{status:403});
      const deps=await sql`select id,role,kind,status,attempts,completed_at,
          result->>'verdict' as verdict,
          result->>'summary' as summary,
          result as result
        from maximus_agents.tasks where id=any(${rows[0].depends_on}::uuid[])
        order by role`;
      return Response.json({upstream:deps,deploy_allowed:false});
    }
    if(body.op==="complete"&&typeof body.task_id==="string"&&
       typeof body.lease_token==="string"&&
       ["done","blocked","failed"].includes(body.status)&&
       body.result&&typeof body.result==="object"&&!Array.isArray(body.result)){
      // AI output can NEVER grant PASS, approve QA, publish or manipulate SCPI.
      if(!["REVIEW","FAIL"].includes(body.result.verdict)||
         body.result.deploy_allowed!==false||
         !Array.isArray(body.result.evidence)||body.result.evidence.length===0||
         typeof body.result.summary!=="string"||body.result.summary.length>3000)
        return new Response("Invalid audit evidence",{status:400});
      const [t]=await sql`select id,kind,role from maximus_agents.tasks where
        id=${body.task_id}::uuid and lease_token=${body.lease_token}::uuid
        and kind='audit' and payload->>'mode' in ('parallel_readonly_audit','candidate_documentary_audit')
        and status='running' and lease_until>now()`;
      if(!t)return new Response("Forbidden",{status:403});
      const [row]=await sql`select maximus_agents.finish_task(
        ${body.task_id}::uuid,${body.lease_token}::uuid,
        ${body.status},${sql.json(body.result)}::jsonb) as result`;
      return Response.json({result:row.result});
    }
    return Response.json({error:"unsupported_operation"},{status:400});
  }catch(error){
    const name=error instanceof Error?error.name:"Unknown";
    if(name.startsWith("JWT")||name.startsWith("JWS")||name.startsWith("JOSE"))
      return new Response("Unauthorized",{status:401});
    console.error("parallel audit bridge failed",name);
    return Response.json({error:"operation_failed"},{status:422});
  }
});
