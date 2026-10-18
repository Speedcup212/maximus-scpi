import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
type Cand={metric:string,value:number,unit:string,page:number,evidence:string,confidence:number};
const UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136 Safari/537.36";
const ALL_METRICS=['valeur_reconstitution_par_part','valeur_realisation_par_part','endettement_pct','cout_moyen_dette_pct','dette_taux_fixe_couverte_pct','resultat_courant_par_part','distribution_ordinaire_par_part','distribution_totale_par_part','ran_par_part'];
async function shaText(s:string){const h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("");}
function parseNum(s:string){const z=s.replace(/[\u00a0\u202f ]/g,"").replace(/(?<=\d)\.(?=\d{3}(?:\D|$))/g,"").replace(",",".");const n=Number(z);return Number.isFinite(n)?n:null;}
function evidence(txt:string,i:number,len:number){return txt.slice(Math.max(0,i-170),Math.min(txt.length,i+len+220)).replace(/\s+/g," ").trim();}
async function getPdf(url:string,ref?:string){const c=new AbortController(),tm=setTimeout(()=>c.abort(),45000);try{const h:any={"User-Agent":UA,"Accept":"application/pdf,text/html;q=0.9,*/*;q=0.8","Accept-Language":"fr-FR,fr;q=0.9"};if(ref)h.Referer=ref;const r=await fetch(url,{redirect:"follow",signal:c.signal,headers:h});if(!r.ok)throw new Error("HTTP "+r.status);const b=new Uint8Array(await r.arrayBuffer());if(new TextDecoder().decode(b.slice(0,4))!=="%PDF")throw new Error("not_pdf");return b;}finally{clearTimeout(tm);}}
async function pagesOf(b:Uint8Array){const unpdf:any=await import("npm:unpdf@0.12.1");const p=await unpdf.getDocumentProxy(b);if(p.numPages>220)throw new Error("pdf_too_long");const out=await unpdf.extractText(p,{mergePages:false});const t=out?.text;if(Array.isArray(t))return t.map((x:any)=>String(x||""));return [String(t||"")];}
function hasTargetYearAround(t:string,pos:number,year:number){const w=t.slice(Math.max(0,pos-320),Math.min(t.length,pos+420));return new RegExp('\\b'+year+'\\b').test(w);}
function scanAfter(t:string,page:number,year:number,metric:string,unit:string,min:number,max:number,anchors:RegExp[],valueRe:RegExp,confidence:number,out:Cand[]){for(const a0 of anchors){const a=new RegExp(a0.source,a0.flags.includes('g')?a0.flags:a0.flags+'g');let m;while((m=a.exec(t))){if(!hasTargetYearAround(t,m.index,year))continue;const tail=t.slice(m.index+m[0].length,Math.min(t.length,m.index+m[0].length+180));const v=valueRe.exec(tail);if(!v?.[1])continue;const n=parseNum(v[1]);if(n===null||n<min||n>max)continue;out.push({metric,value:n,unit,page,evidence:evidence(t,m.index,m[0].length+v.index+v[0].length),confidence});}}}
function extract(ps:string[],year:number){const out:Cand[]=[];ps.forEach((raw,ix)=>{const t=raw.replace(/[\u0000-\u001f]/g," ").replace(/\s+/g," ");const p=ix+1;
 scanAfter(t,p,year,'valeur_reconstitution_par_part','EUR/part',20,5000,[/valeur\s+de\s+reconstitution(?:\s+par\s+part)?/i],/(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:€|euros?)/i,.99,out);
 scanAfter(t,p,year,'valeur_realisation_par_part','EUR/part',20,5000,[/valeur\s+de\s+r[eé]alisation(?:\s+par\s+part)?/i],/(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:€|euros?)/i,.99,out);
 scanAfter(t,p,year,'endettement_pct','%',0,80,[/taux\s+d['’]?endettement/i,/ratio\s+d['’]?endettement/i],/(\d{1,3}(?:[.,]\d+)?)\s*%/i,.98,out);
 scanAfter(t,p,year,'cout_moyen_dette_pct','%',0,15,[/co[uû]t\s+moyen\s+(?:de\s+la\s+)?dette/i,/taux\s+moyen\s+(?:de\s+la\s+)?dette/i],/(\d{1,2}(?:[.,]\d+)?)\s*%/i,.99,out);
 scanAfter(t,p,year,'dette_taux_fixe_couverte_pct','%',0,100,[/part\s+des\s+emprunts\s+[àa]\s+taux\s+fixe(?:\s*\(et\s+variable\s+couvert\))?/i,/part\s+de\s+la\s+dette\s+[àa]\s+taux\s+fixe/i],/(\d{1,3}(?:[.,]\d+)?)\s*%/i,.99,out);
 scanAfter(t,p,year,'resultat_courant_par_part','EUR/part',-100,1000,[/r[eé]sultat\s+courant\s+par\s+part/i,/r[eé]sultat\s+courant/i],/(-?\d{1,4}(?:[.,]\d{1,2})?)\s*(?:€|euros?)/i,.99,out);
 scanAfter(t,p,year,'distribution_ordinaire_par_part','EUR/part',0,1000,[/dividende\s+ordinaire/i,/distribution\s+ordinaire/i],/(\d{1,4}(?:[.,]\d{1,2})?)\s*(?:€|euros?)/i,.99,out);
 scanAfter(t,p,year,'distribution_totale_par_part','EUR/part',0,1000,[/dividende\s+global/i,/distribution\s+(?:totale|globale)/i],/(\d{1,4}(?:[.,]\d{1,2})?)\s*(?:€|euros?)/i,.99,out);
 scanAfter(t,p,year,'ran_par_part','EUR/part',0,1000,[/report\s+[àa]\s+nouveau\s+(?:apr[eè]s\s+affectation\s+)?(?:par\s+part)?/i,/RAN\s+(?:apr[eè]s\s+affectation\s+)?(?:par\s+part)?/i],/(\d{1,4}(?:[.,]\d{1,2})?)\s*(?:€|euros?)/i,.99,out);
 });return out;}
Deno.serve(async(req:Request)=>{if(req.method!=="POST")return Response.json({error:"POST required"},{status:405});const base=Deno.env.get("SUPABASE_URL")||"",key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";const db=createClient(base,key,{auth:{persistSession:false,autoRefreshToken:false}});const token=req.headers.get("x-annual-token")||"";const {data:cfg}=await db.from("scpi_bulletin_runtime_config").select("value").eq("key","annual_cron_token_sha256").maybeSingle();if(!token||!cfg||cfg.value!==await shaText(token))return Response.json({error:"unauthorized"},{status:401});let body:any={};try{body=await req.json();}catch{}const slug=String(body.slug||""),year=Number(body.year||2025);
if(!slug || !Number.isInteger(year) || year<1900 || year>=new Date().getFullYear())
  return Response.json({error:"invalid_slug_or_closed_year",slug,year},{status:400});
const {data:protectedAnnual,error:protectedError}=await db.from("scpi_annual_fundamentals")
  .select("qa_status").eq("scpi_slug",slug).eq("fiscal_year",year).maybeSingle();
if(protectedError) return Response.json({error:"annual_read_failed"},{status:500});
if(protectedAnnual?.qa_status==="manual_verified_official")
  return Response.json({ok:true,status:"protected_manual_verified",slug,year});
const {data:r}=await db.from("scpi_annual_reports").select("id,source_url,qa_status").eq("scpi_slug",slug).eq("fiscal_year",year).maybeSingle();if(!r||r.qa_status!=="source_verified_content")return Response.json({ok:false,status:"report_not_verified",slug,year});const {data:s}=await db.from("scpi_source_registry").select("official_scpi_page_url,source_domain").eq("scpi_slug",slug).maybeSingle();try{const b=await getPdf(r.source_url,s?.official_scpi_page_url||s?.source_domain);
let ps=await pagesOf(b);let ocrRecovered=false;
const digest=await crypto.subtle.digest("SHA-256",b);
const hash=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
const period=String(year)+"-RA";
const {data:ocr,error:readErr}=await db.rpc("scpi_ocr_read_verified_pages",{
 p_slug:slug,p_period:period,p_kind:"annual_report",p_url:r.source_url,p_sha256:hash
});
if(readErr)throw readErr;
if(ocr?.length){
  const recovered=Array(ps.length).fill("");
  for(const x of ocr)if(x.page_number>0&&x.page_number<=recovered.length)recovered[x.page_number-1]=x.page_text;
  ps=ps.map((x,i)=>recovered[i]||x);ocrRecovered=true;
}else{
  const sparse=ps.length>3&&ps.filter(x=>x.trim().length<50).length>ps.length*0.35;
  if(ps.join(" ").trim().length<600||sparse){
    const {data:queue,error:qe}=await db.rpc("scpi_ocr_request_fallback",{
      p_slug:slug,p_period:period,p_kind:"annual_report",p_url:r.source_url
    });
    if(qe)throw qe;
    return Response.json({ok:false,status:"ocr_pending",slug,year,queue});
  }
}
const cs=extract(ps,year);
const {error:cleanError}=await db.from("scpi_annual_metric_candidates").delete()
  .eq("scpi_slug",slug).eq("fiscal_year",year).eq("status","candidate");
if(cleanError) throw cleanError;if(cs.length){await db.from("scpi_annual_metric_candidates").insert(cs.map(c=>({scpi_slug:slug,fiscal_year:year,metric:c.metric,value_numeric:c.value,unit:c.unit,source_page:c.page,evidence_text:c.evidence,confidence:c.confidence,status:'candidate',source_report_id:r.id})));}
 // Les tableaux multicolonnes peuvent contenir plusieurs années sur une même page.
 // Avant QA humaine du repérage de la colonne, ne jamais promouvoir les exercices historiques.
 if(ocrRecovered || year!==2025)
   return Response.json({ok:true,status:ocrRecovered?"ocr_candidates_pending_independent_qa":"historical_candidates_pending_year_column_qa",slug,year,pages:ps.length,candidates:cs.length,promoted:[]});
 const grouped:any={};for(const c of cs)(grouped[c.metric]??=[]).push(c);const promoted:any={},evs:any={};for(const metric of ALL_METRICS){const arr:Cand[]=grouped[metric]||[];const vals=[...new Set(arr.filter(x=>x.confidence>=.98).map(x=>x.value.toFixed(6)))];if(vals.length===1){const c=arr.find(x=>x.value.toFixed(6)===vals[0])!;promoted[metric]=c.value;evs[metric]={page:c.page,text:c.evidence,confidence:c.confidence};}else promoted[metric]=null;}
 const payload:any={scpi_slug:slug,fiscal_year:year,...promoted,source_url:r.source_url,source_report_id:r.id,qa_status:Object.values(promoted).some(v=>v!==null)?'auto_extracted_safe':'source_only',source_confidence:Object.values(promoted).some(v=>v!==null)?.98:1,evidence:evs,updated_at:new Date().toISOString()};const {error}=await db.from("scpi_annual_fundamentals").upsert(payload,{onConflict:"scpi_slug,fiscal_year"});if(error)throw error;return Response.json({ok:true,slug,year,pages:ps.length,candidates:cs.length,promoted:Object.entries(promoted).filter(([,v])=>v!==null).map(([k])=>k),values:promoted});}catch(e){return Response.json({ok:false,status:"failed",slug,year,error:String(e)});}});
