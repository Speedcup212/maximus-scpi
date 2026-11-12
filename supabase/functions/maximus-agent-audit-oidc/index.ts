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
    if(body.op==="prepare_batch20"){
      if(Number(payload.run_attempt||1)!==1)
        return Response.json({prepared:false,reason:"rerun_denied"});
      const [r]=await sql`select maximus_agents.prepare_candidate_batch20() as batch`;
      const batch=r.batch;
      if(batch?.prepared===true){
        const summary={mode:"candidate20",cycle:batch,
          prepared_at:new Date().toISOString(),actual_inference_executed:false,
          deploy_allowed:false};
        await sql`update maximus_agents.agents set heartbeat_at=now(),
          last_summary=${sql.json(summary)}::jsonb
          where role='CONTROL' and enabled=true`;
      }
      return Response.json({prepared:batch?.prepared===true,cycle:batch,
        deploy_allowed:false});
    }
    if(body.op==="control_existing_metric_triage"){
      // The existing CONTROL orchestrator runs this AFTER prepare_batch20.
      // Group pre-existing evidence without creating tasks, granting financial
      // certification, calling a model, or altering the candidate batch.
      if(Number(payload.run_attempt||1)!==1)
        return Response.json({prepared:false,reason:"rerun_denied"});
      const [row]=await sql`select maximus_agents.refresh_existing_missing_metric_control() as plan`;
      const plan=row?.plan;
      if(!plan||plan.deploy_allowed!==false||
         plan.financial_certified!==false||plan.new_tasks_created!==0||
         plan.model_calls!==0)
        throw Error("CONTROL_TRIAGE_FINANCIAL_SAFETY");
      return Response.json(plan);
    }
    if(body.op==="reconcile_document_resolution"){
      const [row]=await sql`select maximus_agents.reconcile_document_resolution_v1(8) as plan`;
      const plan=row?.plan;
      if(!plan||plan.orphaned!==0||plan.financial_certified!==false||
         plan.deploy_allowed!==false||plan.model_calls!==0||plan.official_discovery_scheduled>8)
        throw Error("CONTROL_RESOLUTION_UNSAFE");
      return Response.json(plan);
    }
    if(body.op==="historical_prepare"){
      // Reuse the existing CONTROL job, queue and credentials. At most 3 jobs.
      if(Number(payload.run_attempt||1)!==1)
        return Response.json({documents:[],prepared:0,reason:"rerun_denied",
          financial_certified:false,deploy_allowed:false});
      const [row]=await sql`select maximus_agents.prepare_historical_tof_proof_batch_v1(3) as batch`;
      const batch=row.batch;
      if(!batch||batch.deploy_allowed!==false||batch.financial_certified!==false||
         !Array.isArray(batch.documents)||batch.documents.length>3)
        throw Error("HISTORICAL_DISPATCH_UNSAFE");
      return Response.json(batch);
    }
    if(body.op==="historical_claim"&&typeof body.scpi_slug==="string"&&
       typeof body.source_period==="string"&&
       /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.scpi_slug)&&
       /^20[0-9]{2}-T[1-4]$/.test(body.source_period)){
      if(Number(payload.run_attempt||1)!==1)
        return Response.json({task:null,reason:"rerun_denied"});
      const rows=await sql`select id,role,kind,status,lease_token,payload
        from maximus_agents.claim_historical_tof_proof_v1(${body.scpi_slug},${body.source_period})`;
      const t=rows[0];
      if(!t)return Response.json({task:null,reason:"no_eligible_scoped_qa_task"});
      const e=t.payload;
      if(t.role!=="QA"||t.kind!=="audit"||t.status!=="running"||
         e.mode!=="historical_tof_source_qa"||e.scpi_slug!==body.scpi_slug||
         e.source_period!==body.source_period||!t.lease_token||
         !/^[0-9a-f]{64}$/.test(String(e.pdf_sha256))||
         !Number.isInteger(e.page_count)||e.page_count<1||e.page_count>80||
         !Array.isArray(e.allowed_hosts)||!e.allowed_hosts.length)
        throw Error("HISTORICAL_CLAIM_SCOPE_MISMATCH");
      const [connector]=await sql`select allowed_hosts from public.scpi_source_connectors
          where scpi_slug=${body.scpi_slug} and enabled=true`;
      let source;
      try{source=new URL(e.source_url);}catch{return new Response("Invalid source",{status:422});}
      if(source.protocol!=="https:"||source.username||source.password||
         (source.port&&source.port!=="443")||
         !connector?.allowed_hosts?.includes(source.hostname.toLowerCase())||
         !e.allowed_hosts.includes(source.hostname.toLowerCase()))
        throw Error("HISTORICAL_SOURCE_HOST_NOT_APPROVED");
      const manifest={exists:true,candidate_slug:e.scpi_slug,
        candidate_name:e.candidate_name,allowed_hosts:connector.allowed_hosts,
        documents:[{source_url:e.source_url,source_period:e.source_period,
          document_kind:"quarterly_bulletin",pdf_sha256:e.pdf_sha256,
          page_count:e.page_count}]};
      return Response.json({task:{id:t.id,role:t.role,kind:t.kind,
          lease_token:t.lease_token,scpi_slug:e.scpi_slug,
          source_period:e.source_period},manifest,
        deploy_allowed:false,financial_certified:false});
    }
    if(body.op==="historical_archive_pdf"&&
       typeof body.task_id==="string"&&typeof body.lease_token==="string"){
      const [t]=await sql`select id,payload from maximus_agents.tasks
        where id=${body.task_id}::uuid and lease_token=${body.lease_token}::uuid
          and role='QA' and kind='audit' and status='running'
          and lease_until>now() and attempts<=2
          and payload->>'mode'='historical_tof_source_qa'`;
      if(!t)return new Response("Forbidden",{status:403});
      const p=t.payload;
      const [file]=await sql`select b.pdf_path,b.pdf_sha256,
           o.metadata->>'size' as archive_bytes
         from public.scpi_bulletins b
         join storage.objects o on o.bucket_id='scpi-bulletins' and o.name=b.pdf_path
         join maximus_agents.scpi_bulletin_replay_documents d
           on d.scpi_slug=b.scpi_slug and d.source_period=b.period
           and d.pdf_sha256=b.pdf_sha256 and d.source_url=b.source_url
           and d.status='extracted' and d.processing_complete is true
           and d.result->>'identity_verified'='true'
           and d.result->>'period_verified'='true'
         where b.scpi_slug=${p.scpi_slug} and b.period=${p.source_period}
           and b.pdf_sha256=${p.pdf_sha256} and b.source_url=${p.source_url}
           and b.pdf_path=b.scpi_slug||'/'||b.period||'/'||b.pdf_sha256||'.pdf'
         limit 1`;
      const expected=Number(file?.archive_bytes);
      if(!file||!Number.isSafeInteger(expected)||expected<1024||expected>20000000)
        return new Response("Exact archived original unavailable",{status:404});
      const storageKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if(!storageKey)throw Error("PRIVATE_STORAGE_ACCESS_MISSING");
      const archiveUrl="https://ygvsddcpohsnaowofuwc.supabase.co/storage/v1/object/authenticated/scpi-bulletins/"
        +file.pdf_path.split("/").map(encodeURIComponent).join("/");
      const response=await fetch(archiveUrl,{headers:{
          apikey:storageKey,Authorization:"Bearer "+storageKey},
          redirect:"error",signal:AbortSignal.timeout(20000)});
      if(!response.ok)return new Response("Archive read failed",{status:424});
      const data=await response.arrayBuffer();
      if(data.byteLength!==expected)return new Response("Archive size changed",{status:422});
      const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",data)))
        .map(x=>x.toString(16).padStart(2,"0")).join("");
      if(hash!==file.pdf_sha256||hash!==p.pdf_sha256)
        return new Response("Archive hash changed",{status:422});
      return new Response(data,{status:200,headers:{
        "Content-Type":"application/pdf","Cache-Control":"no-store","X-Original-Sha256":hash}});
    }
    if(body.op==="historical_metric_original"&&
       typeof body.scpi_slug==="string"&&typeof body.source_period==="string"){
      // Read-only financial forensics: 3 precisely scoped previously archived
      // issuer originals with a completed two-reader QA task. Never a new
      // certification, no arbitrary path, no access from public clients.
      const permitted={
        "novapierre-1":"2024-T4",
        "novapierre-residentiel":"2022-T1",
        "cristal-rente":"2026-T2"
      };
      if(permitted[body.scpi_slug as keyof typeof permitted]!==body.source_period)
        return new Response("Unapproved historical geometry source",{status:403});
      const [verified]=await sql`select t.id,t.payload
        from maximus_agents.tasks t
        where t.role='QA' and t.kind='audit' and t.status='done'
          and t.payload->>'mode'='historical_tof_source_qa'
          and t.payload->>'scpi_slug'=${body.scpi_slug}
          and t.payload->>'source_period'=${body.source_period}
          and t.result->'evidence'->0->'finding'->>'verified_binary'='true'
          and t.result->>'financial_certified'='false'
          and t.result->>'deploy_allowed'='false'
        order by t.completed_at desc limit 1`;
      if(!verified)return new Response("No completed source proof",{status:404});
      const p=verified.payload;
      const [file]=await sql`select b.pdf_path,b.pdf_sha256,
          o.metadata->>'size' as archive_bytes,d.page_count
        from public.scpi_bulletins b
        join storage.objects o on o.bucket_id='scpi-bulletins' and o.name=b.pdf_path
        join maximus_agents.scpi_bulletin_replay_documents d
          on d.scpi_slug=b.scpi_slug and d.source_period=b.period
         and d.pdf_sha256=b.pdf_sha256 and d.source_url=b.source_url
         and d.status='extracted' and d.processing_complete is true
         and d.result->>'identity_verified'='true'
         and d.result->>'period_verified'='true'
        where b.scpi_slug=${body.scpi_slug}
          and b.period=${body.source_period}
          and b.pdf_sha256=${p.pdf_sha256}
          and b.source_url=${p.source_url}
          and b.pdf_path=b.scpi_slug||'/'||b.period||'/'||b.pdf_sha256||'.pdf'
        limit 1`;
      const size=Number(file?.archive_bytes);
      if(!file||!Number.isSafeInteger(size)||size<1024||size>20000000||
         !Number.isInteger(file.page_count)||file.page_count<1||file.page_count>80)
        return new Response("Original archive invalid",{status:404});
      const secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if(!secret)throw Error("PRIVATE_STORAGE_ACCESS_MISSING");
      const objectUrl="https://ygvsddcpohsnaowofuwc.supabase.co/storage/v1/object/authenticated/scpi-bulletins/"
        +file.pdf_path.split("/").map(encodeURIComponent).join("/");
      const response=await fetch(objectUrl,{headers:{
        apikey:secret,Authorization:"Bearer "+secret},
        redirect:"error",signal:AbortSignal.timeout(20000)});
      if(!response.ok)return new Response("Archive original inaccessible",{status:424});
      const data=await response.arrayBuffer();
      if(data.byteLength!==size)return new Response("Archive length changed",{status:422});
      const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",data)))
        .map(n=>n.toString(16).padStart(2,"0")).join("");
      if(hash!==file.pdf_sha256||hash!==p.pdf_sha256)
        return new Response("Archive SHA mismatch",{status:422});
      return new Response(data,{status:200,headers:{
        "Content-Type":"application/pdf","Cache-Control":"no-store",
        "X-Original-Sha256":hash,
        "X-Scpi-Slug":body.scpi_slug,
        "X-Source-Period":body.source_period,
        "X-Page-Count":String(file.page_count)}});
    }
    if(body.op==="historical_complete"&&typeof body.task_id==="string"&&
       typeof body.lease_token==="string"&&body.proof&&
       typeof body.proof==="object"&&!Array.isArray(body.proof)){
      const [t]=await sql`select id,role,kind,payload from maximus_agents.tasks
        where id=${body.task_id}::uuid and lease_token=${body.lease_token}::uuid
          and status='running' and lease_until>now()
          and role='QA' and kind='audit'
          and payload->>'mode'='historical_tof_source_qa'`;
      if(!t)return new Response("Forbidden",{status:403});
      const p=body.proof,doc=Array.isArray(p.documents)&&p.documents.length===1?p.documents[0]:null;
      const match=doc?.source_url===t.payload.source_url&&
        doc?.source_period===t.payload.source_period&&
        (doc?.pdf_sha256===t.payload.pdf_sha256||
         doc?.expected_sha256===t.payload.pdf_sha256);
      if(!match||p.candidate_slug!==t.payload.scpi_slug||
         p.financial_certified!==false||p.deploy_allowed!==false||
         !["verified","blocked"].includes(p.status)||
         !["verified","blocked"].includes(doc?.status))
        return new Response("Untrusted documentary proof",{status:422});
      const archived=doc?.origin==="archive_original_binary";
      const accepted=p.status==="verified"&&doc.status==="verified"&&
        (!archived||(doc.archive_integrity_verified===true&&
           doc.publisher_live_verified===false))&&
        doc.binary_hash_matches_registered===true&&
        doc.identity_verified===true&&doc.period_verified===true&&
        Array.isArray(doc.reader_engines)&&
        doc.reader_engines.includes("MuPDF")&&doc.reader_engines.includes("Poppler");
      const result={summary:accepted?
        (archived?
         "Original archived PDF SHA and two readers verified; publisher inaccessible; financial TOF QA still required.":
         "Original publisher PDF re-read with exact SHA and two independent readers; TOF metric still requires financial QA."):
        "Publisher PDF/source audit blocked; historical TOF not certified.",
        verdict:"REVIEW",deploy_allowed:false,financial_certified:false,
        independent_pdf_readers:true,financial_qa_completed:false,
        evidence:[{source:"maximus-agent-parallel historical PDF proof",
          observed_at:new Date().toISOString(),
          finding:{scpi_slug:t.payload.scpi_slug,
            source_period:t.payload.source_period,
            source_sha256:t.payload.pdf_sha256,
            result:doc,verified_binary:accepted,
            no_financial_certification:true}}]};
      const [row]=await sql`select maximus_agents.finish_task(
         ${body.task_id}::uuid,${body.lease_token}::uuid,
         ${accepted?"done":"blocked"},${sql.json(result)}::jsonb) as result`;
      return Response.json({result:row.result,financial_certified:false,
        deploy_allowed:false});
    }
    if(body.op==="batch_claim"&&roles.has(body.role)&&
       typeof body.scpi_slug==="string"&&
       /^[a-z0-9-]{2,100}$/.test(body.scpi_slug)){
      if(Number(payload.run_attempt||1)!==1)
        return Response.json({task:null,reason:"rerun_denied"});
      const rows=await sql`select id,role,kind,title,cycle_date,dedupe_key,payload,
        lease_token,attempts,depends_on from
        maximus_agents.claim_candidate_batch20_task(${body.role},${body.scpi_slug})`;
      const t=rows[0];
      if(!t)return Response.json({task:null,reason:"no_eligible_task_or_budget"});
      if(t.role!==body.role||t.kind!=="audit"||
        t.payload?.batch_mode!=="candidate20"||
        t.payload?.scpi_slug!==body.scpi_slug||
        t.payload?.mode!=="candidate_documentary_audit"||!t.lease_token)
        throw Error("Unauthorized cross-SCPI task");
      return Response.json({task:{...t,deploy_allowed:false}});
    }
    if(body.op==="batch_status"&&typeof body.scpi_slug==="string"&&
       /^[a-z0-9-]{2,100}$/.test(body.scpi_slug)){
      const rows=await sql`select role,status,attempts,
        result->>'verdict' as verdict
        from maximus_agents.tasks
        where cycle_date=(now() at time zone 'Europe/Paris')::date
         and payload->>'batch_mode'='candidate20'
         and payload->>'scpi_slug'=${body.scpi_slug}
        order by role`;
      return Response.json({scpi_slug:body.scpi_slug,tasks:rows,
         deploy_allowed:false});
    }
    if(body.op==="batch_manifest"&&typeof body.scpi_slug==="string"&&
       /^[a-z0-9-]{2,100}$/.test(body.scpi_slug)){
      const rows=await sql`select payload->'candidate_evidence' as evidence
        from maximus_agents.tasks
        where dedupe_key=((now() at time zone 'Europe/Paris')::date::text
         ||':candidate20:'||${body.scpi_slug}||':DATA')
         and kind='audit' and payload->>'batch_mode'='candidate20'
         and payload->>'scpi_slug'=${body.scpi_slug}
        limit 1`;
      const evidence=rows[0]?.evidence;
      if(!evidence||evidence.scpi_slug!==body.scpi_slug)
        return new Response("Candidate outside current daily batch",{status:404});
      const hostsRows=await sql`select hostname from
         maximus_agents.scpi_candidate_issuer_hosts where approved_at is not null`;
      const hosts=new Set(hostsRows.map(row=>String(row.hostname||"").toLowerCase()));
      const docs=evidence.documents;
      if(typeof evidence.scpi_name!=="string"||
         !Array.isArray(docs)||docs.length>8||
         docs.some(d=>{
           try{
             const u=new URL(d.source_url);
             return u.protocol!=="https:"||u.username||u.password||
               (u.port&&u.port!=="443")||!hosts.has(u.hostname.toLowerCase())||
               d.document_identity_verified!==true||
               !/^[a-f0-9]{64}$/i.test(d.pdf_sha256||"")||
               !Number.isInteger(d.page_count)||d.page_count<1||
               !["quarterly_bulletin","semiannual_bulletin","annual_report"].includes(d.document_kind);
           }catch{return true;}
         }))return new Response("Untrusted candidate PDF manifest",{status:422});
      return Response.json({
        exists:true,candidate_slug:body.scpi_slug,
        candidate_name:evidence.scpi_name,
        allowed_hosts:[...hosts].sort(),
        documents:docs.map(d=>({
          source_url:d.source_url,source_period:d.source_period,
          document_kind:d.document_kind,pdf_sha256:d.pdf_sha256,
          page_count:d.page_count
        })),financial_certified:false,deploy_allowed:false});
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
                !['quarterly_bulletin','semiannual_bulletin','annual_report'].includes(d.document_kind);
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
