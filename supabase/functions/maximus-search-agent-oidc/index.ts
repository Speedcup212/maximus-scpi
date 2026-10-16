import { createRemoteJWKSet, jwtVerify } from "npm:jose@6.1.0";
import postgres from "npm:postgres@3.4.7";
const issuer = "https://token.actions.githubusercontent.com";
const jwks = createRemoteJWKSet(new URL(issuer + "/.well-known/jwks"));
const audience = "maximus-agent-worker-ygvsddcpohsnaowofuwc";
const repo = "Speedcup212/maximus-scpi";
const workflowRef = repo + "/.github/workflows/maximus-deepseek-search.yml@refs/heads/main";
const connection = Deno.env.get("SUPABASE_DB_URL");
if (!connection) throw new Error("Database connection unavailable");
const sql = postgres(connection,{max:1,prepare:false,ssl:"require",connect_timeout:10,idle_timeout:15});
Deno.serve(async req => {
  if(req.method!=="POST")return new Response("Method not allowed",{status:405});
  const auth=req.headers.get("authorization")||"";
  if(!auth.startsWith("Bearer "))return new Response("Unauthorized",{status:401});
  try{
    const {payload}=await jwtVerify(auth.slice(7),jwks,{issuer,audience,algorithms:["RS256"],clockTolerance:"30s"});
    if(payload.repository!==repo||String(payload.repository_id)!=="1125202916"||
       payload.ref!=="refs/heads/main"||payload.workflow_ref!==workflowRef||
       !["schedule","workflow_dispatch","push"].includes(String(payload.event_name)))
       return new Response("Forbidden",{status:403});
    const body=await req.json().catch(()=>({}));
    if(body.op==="prepare"){
      const [a]=await sql`select maximus_agents.prepare_execution() as result`;
      return Response.json({execution:a.result});
    }
    if(body.op==="claim"&&["SEARCH","DATA"].includes(body.role)){
      // One billable attempt per GitHub run, including on workflow re-runs.
      if(Number(payload.run_attempt||1)!==1)return Response.json({task:null,reason:"rerun_denied"});
      const result=await sql`select id,role,kind,title,issue_ids,payload,lease_token,attempts
        from maximus_agents.claim_scoped_corrective_task(${body.role})`;
      const task=result[0];
      if(!task)return Response.json({task:null,reason:"no_eligible_scoped_task_or_daily_budget"});
      const issueId=Array.isArray(task.issue_ids)?task.issue_ids[0]:null;
      if(!issueId)throw new Error("Claim missing issue");
      const issues=await sql`select id,issue_key,owner_role,title,scope,acceptance
        from maximus_agents.issues where id=${issueId}::uuid`;
      if(issues.length!==1)throw new Error("Claimed issue not found");
      return Response.json({task:{...task,payload:{issues},deploy_allowed:false}});
    }
        if(body.op==="complete"&&
      typeof body.task_id==="string"&&
      typeof body.lease_token==="string"&&
      ["done","failed","blocked"].includes(body.status)&&
      body.result&&typeof body.result==="object"){
      const [row]=await sql`select maximus_agents.record_execution(
        ${body.task_id}::uuid,${body.lease_token}::uuid,${body.status},${sql.json(body.result)}::jsonb
       ) as result`;
      return Response.json({result:row.result});
    }
    return Response.json({error:"unsupported_operation"},{status:400});
  }catch(error){
    const name=error instanceof Error?error.name:"Unknown";
    if(name.startsWith("JWT")||name.startsWith("JWS")||name.startsWith("JOSE"))return new Response("Unauthorized",{status:401});
    console.error("deepseek worker failure",name);
    return Response.json({error:"operation_failed"},{status:422});
  }
});
