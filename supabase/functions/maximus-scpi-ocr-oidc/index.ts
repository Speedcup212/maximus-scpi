import {createRemoteJWKSet,jwtVerify} from "npm:jose@6.1.0";
import postgres from "npm:postgres@3.4.7";

const issuer="https://token.actions.githubusercontent.com";
const jwks=createRemoteJWKSet(new URL(issuer+"/.well-known/jwks"));
const audience="maximus-scpi-ocr-ygvsddcpohsnaowofuwc";
const repo="Speedcup212/maximus-scpi";
const workflowRef=repo+"/.github/workflows/maximus-scpi-ocr.yml@refs/heads/main";
const dbUrl=Deno.env.get("SUPABASE_DB_URL");
if(!dbUrl) throw new Error("Database connection unavailable");
const sql=postgres(dbUrl,{max:1,prepare:false,ssl:"require",connect_timeout:10,idle_timeout:20});
const norm=(s:string)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();
const fail=(code:number,msg:string)=>Response.json({error:msg},{status:code,headers:{"Cache-Control":"no-store"}});
const validStr=(s:unknown,n=300)=>typeof s==="string"&&s.length>0&&s.length<=n;
const cleanError=(s:unknown)=>String(s||"ocr_failed").replace(/[\r\n]/g," ").slice(0,190);

Deno.serve(async(req:Request)=>{
  if(req.method!=="POST")return fail(405,"POST required");
  const auth=req.headers.get("authorization")||"";
  if(!auth.startsWith("Bearer "))return fail(401,"unauthorized");
  let jwt;
  try{
    jwt=(await jwtVerify(auth.slice(7),jwks,{issuer,audience,algorithms:["RS256"],clockTolerance:"30s"})).payload;
  }catch{return fail(401,"unauthorized");}
  if(jwt.repository!==repo||String(jwt.repository_id)!=="1125202916"||
     jwt.ref!=="refs/heads/main"||jwt.workflow_ref!==workflowRef||
     !["schedule","workflow_dispatch","push"].includes(String(jwt.event_name)))
       return fail(403,"forbidden");

  try{
    const body=await req.json().catch(()=>({}));
    if(body.op==="claim"){
      await sql`SELECT * FROM maximus_agents.scpi_ocr_seed_backlog(12)`;
      await sql`
        INSERT INTO maximus_agents.scpi_ocr_jobs (scpi_slug,source_period,document_kind)
        SELECT d.scpi_slug,d.source_period,d.document_kind
          FROM maximus_agents.scpi_candidate_document_index d
         WHERE d.source_period ~ '^20[0-9]{2}-T[1-4]$'
           AND d.document_kind='quarterly_bulletin'
           AND d.status='direct_pdf_checked'
           AND d.verified_pdf_at IS NOT NULL
           AND d.direct_document_url LIKE 'https://%'
           AND d.extraction_run_reference IS NULL
        ON CONFLICT DO NOTHING
      `;
      const rows=await sql`
        WITH picked AS (
          SELECT j.scpi_slug,j.source_period,j.document_kind
          FROM maximus_agents.scpi_ocr_jobs j
          WHERE j.attempts<3
            AND j.next_try_at<=now()
            AND (j.status IN ('queued','failed')
              OR (j.status='running' AND j.claimed_at<now()-interval '45 minutes'))
          ORDER BY j.next_try_at,j.scpi_slug
          FOR UPDATE SKIP LOCKED LIMIT 1
        )
        UPDATE maximus_agents.scpi_ocr_jobs j
        SET status='running',attempts=j.attempts+1,
            claimed_at=now(),lease_token=gen_random_uuid(),result_note=NULL
        FROM picked p
        WHERE j.scpi_slug=p.scpi_slug AND j.source_period=p.source_period
          AND j.document_kind=p.document_kind
        RETURNING j.scpi_slug,j.source_period,j.document_kind,j.lease_token,j.attempts
      `;
      if(!rows.length)return Response.json({task:null},{headers:{"Cache-Control":"no-store"}});
      const t=rows[0];
      const items=await sql`
        SELECT d.direct_document_url AS url,u.name
        FROM maximus_agents.scpi_candidate_document_index d
        JOIN maximus_agents.scpi_universe u USING(scpi_slug)
        WHERE d.scpi_slug=${t.scpi_slug} AND d.source_period=${t.source_period}
          AND d.document_kind=${t.document_kind}
      `;
      if(items.length!==1)throw new Error("missing_document");
      return Response.json({task:{slug:t.scpi_slug,period:t.source_period,kind:t.document_kind,
        url:items[0].url,name:items[0].name,lease_token:t.lease_token,attempt:t.attempts}});
    }
    if(body.op==="complete"){
      const t=body.task||{};
      if(!validStr(t.slug,100)||!validStr(t.period,16)||!validStr(t.kind,30)||
         !validStr(t.lease_token,40)||!validStr(String(body.run_id||""),30))
        return fail(400,"invalid task");
      const jobs=await sql`
        SELECT j.status,j.lease_token,d.direct_document_url AS url,u.name
        FROM maximus_agents.scpi_ocr_jobs j
        JOIN maximus_agents.scpi_candidate_document_index d
          USING(scpi_slug,source_period,document_kind)
        JOIN maximus_agents.scpi_universe u ON u.scpi_slug=j.scpi_slug
        WHERE j.scpi_slug=${t.slug} AND j.source_period=${t.period}
          AND j.document_kind=${t.kind}
      `;
      const job=jobs[0];
      if(!job||job.status!=="running"||String(job.lease_token)!==t.lease_token)
        return fail(409,"stale_or_invalid_lease");
      if(body.status==="failed"){
        await sql`
          UPDATE maximus_agents.scpi_ocr_jobs
          SET status='failed',finished_at=now(),
             next_try_at=now()+interval '2 hours',
             result_note=${cleanError(body.error)}
          WHERE scpi_slug=${t.slug} AND source_period=${t.period}
           AND document_kind=${t.kind} AND lease_token=${t.lease_token}::uuid AND status='running'
        `;
        return Response.json({ok:true,status:"failed"});
      }
      const pages=body.pages;
      if(body.status!=="done"||!Array.isArray(pages)||pages.length<1||pages.length>240||
         !/^[0-9a-f]{64}$/.test(String(body.sha256||"")))
        return fail(400,"invalid OCR payload");
      if(pages.some((x:any,i:number)=>x.page!==i+1||!["native_pdf_text","tesseract_ocr"].includes(x.method)||
        typeof x.text!=="string"||x.text.length>50000))
          return fail(400,"invalid page");
      const combined=pages.map((x:any)=>x.text).join(" ");
      const chars=combined.replace(/\s+/g,"").length;
      const scanned=pages.filter((x:any)=>x.method==="tesseract_ocr").length;
      if(chars<150||!norm(combined).includes(norm(String(job.name))))
        return fail(422,"document_identity_or_text_not_verified");
      if(JSON.stringify(pages).length>3500000)return fail(413,"too_large");
      const safePages=pages.filter((x:any)=>x.text.trim().length>0).map((x:any)=>({
        page:x.page,text:x.text,method:x.method
      }));
      if(!safePages.length)return fail(422,"no_text");

      const run="github-ocr:"+String(body.run_id);
      await sql.begin(async(tx)=>{
        const still=await tx`
          SELECT 1 FROM maximus_agents.scpi_ocr_jobs
          WHERE scpi_slug=${t.slug} AND source_period=${t.period}
          AND document_kind=${t.kind} AND lease_token=${t.lease_token}::uuid
          AND status='running' FOR UPDATE
        `;
        if(still.length!==1)throw new Error("stale_lease");
        await tx`
          INSERT INTO maximus_agents.scpi_ocr_pages
          (scpi_slug,source_period,document_kind,page_number,pdf_sha256,extraction_method,page_text)
          SELECT ${t.slug},${t.period},${t.kind},x.page,${body.sha256},x.method,x.text
          FROM jsonb_to_recordset(${tx.json(safePages)}::jsonb) AS x(page integer,method text,text text)
          ON CONFLICT(scpi_slug,source_period,document_kind,page_number)
          DO UPDATE SET pdf_sha256=EXCLUDED.pdf_sha256,
            extraction_method=EXCLUDED.extraction_method,page_text=EXCLUDED.page_text,extracted_at=now()
        `;
        await tx`
          UPDATE maximus_agents.scpi_ocr_jobs
          SET status='done',pdf_sha256=${body.sha256},total_pages=${pages.length},
              pages_ocr=${scanned},text_characters=${chars},
              run_reference=${run},finished_at=now(),
              result_note='Native text + OCR fallback completed; page provenance only, financial QA pending'
          WHERE scpi_slug=${t.slug} AND source_period=${t.period}
           AND document_kind=${t.kind} AND lease_token=${t.lease_token}::uuid
        `;
        await tx`
          UPDATE maximus_agents.scpi_candidate_document_index
          SET status='page_verified',extraction_run_reference=${run},
              verified_pdf_at=coalesce(verified_pdf_at,now()),
              review_note=${"Text extracted with automatic OCR on "+scanned+" of "+pages.length+" pages; identity matched. Numbers NOT independently certified."}
          WHERE scpi_slug=${t.slug} AND source_period=${t.period}
            AND document_kind=${t.kind} AND direct_document_url=${job.url}
            AND status IN ('direct_pdf_checked','publisher_index_visible')
        `;
      });
      return Response.json({ok:true,status:"page_verified",pages:pages.length,ocr_pages:scanned,characters:chars});
    }
    return fail(400,"unsupported op");
  }catch(err){
    console.error("scpi_ocr_bridge",err instanceof Error?err.name:"unknown");
    return fail(503,"worker_unavailable");
  }
});