import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136 Safari/537.36 MaximusSCPI-AnnualBot/2.0";
const PARSER_VERSION="2026-09-30-v2-page-evidence";

const norm=(s:string)=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/œ/gi,"oe").replace(/[’‘]/g,"'").toLowerCase().replace(/\s+/g," ").trim();
async function shaText(s:string){const h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("");}
function fr(s:string){let x=String(s||"").replace(/[\u00a0\u202f\s€%]/g,"");if(!x)return null;const lastComma=x.lastIndexOf(","),lastDot=x.lastIndexOf(".");if(lastComma>=0&&lastDot>=0){if(lastComma>lastDot)x=x.replace(/\./g,"").replace(",",".");else x=x.replace(/,/g,"");}else if(lastComma>=0)x=x.replace(",",".");else if((x.match(/\./g)||[]).length>1)x=x.replace(/\./g,"");const n=Number(x);return Number.isFinite(n)?n:null;}
async function getPdf(url:string,referer?:string){const c=new AbortController(),tm=setTimeout(()=>c.abort(),45000);try{const headers:any={"User-Agent":UA,"Accept":"application/pdf,*/*;q=0.8","Accept-Language":"fr-FR,fr;q=0.9"};if(referer)headers.Referer=referer;const r=await fetch(url,{redirect:"follow",signal:c.signal,headers});if(!r.ok)throw new Error("HTTP "+r.status);const b=new Uint8Array(await r.arrayBuffer());if(new TextDecoder().decode(b.slice(0,4))!=="%PDF")throw new Error("not_pdf");if(b.byteLength<1024||b.byteLength>65*1024*1024)throw new Error("bad_size");return b;}finally{clearTimeout(tm);}}
async function pagesText(bytes:Uint8Array){const unpdf:any=await import("npm:unpdf@0.12.1");const pdf=await unpdf.getDocumentProxy(bytes);if(pdf.numPages>230)throw new Error("pdf_too_long");const pages:string[]=[];for(let i=1;i<=pdf.numPages;i++){const p=await pdf.getPage(i);const tc=await p.getTextContent();const txt=(tc.items||[]).map((x:any)=>String(x?.str||"")).join(" ").replace(/\s+/g," ").trim();pages.push(txt);}return pages;}
function snippet(t:string,start:number,len:number){return t.slice(Math.max(0,start-120),Math.min(t.length,start+len+180)).replace(/\s+/g," ").trim().slice(0,600);}
type Hit={value:number,page:number,text:string,method:string,unit?:string};
function searchPage(pages:string[],patterns:RegExp[],unit?:string):Hit|null{for(let i=0;i<pages.length;i++){const t=pages[i];for(const raw of patterns){const flags=raw.flags.includes("g")?raw.flags:raw.flags+"g";const re=new RegExp(raw.source,flags);let m:RegExpExecArray|null;while((m=re.exec(t))!==null){const rawVal=m[1]??m[2];const v=fr(rawVal);if(v!==null)return {value:v,page:i+1,text:snippet(t,m.index,m[0].length),method:"pdf_page_regex",unit};if(re.lastIndex===m.index)re.lastIndex++;}}}return null;}
function validValue(metric:string,v:number,price:number|null){if(!Number.isFinite(v))return false;if(["endettement_pct","endettement_net_pct"].includes(metric))return v>=0&&v<=80;if(metric==="cout_moyen_dette_pct"||metric==="taux_nouveaux_financements_pct")return v>=0&&v<=15;if(metric==="dette_taux_fixe_couverte_pct"||metric==="variation_patrimoine_perimetre_constant_pct")return v>=-50&&v<=100;if(["duration_dette_annees","maturite_residuelle_dette_annees"].includes(metric))return v>=0&&v<=40;if(["dette_m","valeur_patrimoine_m","nouveaux_financements_m","acquisitions_m","cessions_m","plus_values_cessions_m"].includes(metric))return v>=0&&v<=100000;if(["valeur_realisation_par_part","valeur_reconstitution_par_part"].includes(metric)){if(v<=0||v>100000)return false;if(price&&price>0)return v>=price*0.35&&v<=price*1.8;return true;}if(["revenus_par_part","charges_par_part","resultat_courant_par_part","distribution_ordinaire_par_part","distribution_exceptionnelle_par_part","distribution_totale_par_part","ran_par_part"].includes(metric)){if(v<0||v>20000)return false;if(price&&price>0)return v<=price*0.35;return true;}return true;}
function put(out:any,ev:any,metric:string,hit:Hit|null,price:number|null){if(!hit||!validValue(metric,hit.value,price))return;out[metric]=hit.value;ev[metric]={page:hit.page,text:hit.text,method:hit.method,unit:hit.unit||null,value_match:true};}
function parse(pages:string[],price:number|null){const out:any={},ev:any={};
 put(out,ev,"valeur_reconstitution_par_part",searchPage(pages,[/valeur\s+de\s+reconstitution(?:\s+(?:par\s+part|\/\s*part))?[^0-9€]{0,80}(\d{1,5}(?:[\s\u00a0\u202f]\d{3})*(?:[.,]\d{1,2})?)\s*€/i,/(\d{1,5}(?:[.,]\d{1,2})?)\s*€[^\n]{0,80}valeur\s+de\s+reconstitution/i],"€/part"),price);
 put(out,ev,"valeur_realisation_par_part",searchPage(pages,[/valeur\s+de\s+r[eé]alisation(?:\s+(?:par\s+part|\/\s*part))?[^0-9€]{0,80}(\d{1,5}(?:[\s\u00a0\u202f]\d{3})*(?:[.,]\d{1,2})?)\s*€/i,/(\d{1,5}(?:[.,]\d{1,2})?)\s*€[^\n]{0,80}valeur\s+de\s+r[eé]alisation/i],"€/part"),price);
 put(out,ev,"resultat_courant_par_part",searchPage(pages,[/r[eé]sultat\s+courant(?:\s+(?:par\s+part|\/\s*part))[^0-9€]{0,90}(\d{1,4}(?:[.,]\d{1,2})?)\s*€/i,/r[eé]sultat\s+de\s+l['’]?exercice\s+(?:par\s+part|\/\s*part)[^0-9€]{0,90}(\d{1,4}(?:[.,]\d{1,2})?)\s*€/i],"€/part"),price);
 put(out,ev,"revenus_par_part",searchPage(pages,[/(?:revenus?|produits?)\s+(?:totaux?\s+)?(?:par\s+part|\/\s*part)[^0-9€]{0,80}(\d{1,4}(?:[.,]\d{1,2})?)\s*€/i],"€/part"),price);
 put(out,ev,"charges_par_part",searchPage(pages,[/charges?\s+(?:totales?\s+)?(?:par\s+part|\/\s*part)[^0-9€]{0,80}(\d{1,4}(?:[.,]\d{1,2})?)\s*€/i],"€/part"),price);
 put(out,ev,"distribution_totale_par_part",searchPage(pages,[/(?:distribution|dividende)\s+(?:totale|globale|brute)(?:\s+(?:par\s+part|\/\s*part))[^0-9€]{0,100}(\d{1,4}(?:[.,]\d{1,2})?)\s*€/i,/(?:dividende|distribution)\s+(?:par\s+part|\/\s*part)[^0-9€]{0,100}(\d{1,4}(?:[.,]\d{1,2})?)\s*€/i],"€/part"),price);
 put(out,ev,"distribution_ordinaire_par_part",searchPage(pages,[/(?:distribution|dividende)\s+ordinaire(?:\s+(?:par\s+part|\/\s*part))?[^0-9€]{0,100}(\d{1,4}(?:[.,]\d{1,2})?)\s*€/i],"€/part"),price);
 put(out,ev,"distribution_exceptionnelle_par_part",searchPage(pages,[/(?:distribution|dividende)\s+exceptionnel(?:le)?(?:\s+(?:par\s+part|\/\s*part))?[^0-9€]{0,100}(\d{1,4}(?:[.,]\d{1,2})?)\s*€/i],"€/part"),price);
 put(out,ev,"ran_par_part",searchPage(pages,[/report\s+[àa]\s+nouveau(?:\s+apr[eè]s\s+affectation)?\s+(?:par\s+part|\/\s*part)[^0-9€]{0,90}(\d{1,4}(?:[.,]\d{1,2})?)\s*€/i,/\bRAN\b\s+(?:par\s+part|\/\s*part)[^0-9€]{0,70}(\d{1,4}(?:[.,]\d{1,2})?)\s*€/i],"€/part"),price);
 put(out,ev,"endettement_pct",searchPage(pages,[/(?:taux|ratio)\s+d['’]?endettement[^0-9%]{0,70}(\d{1,3}(?:[.,]\d+)?)\s*%/i,/dettes?\s+et\s+autres\s+engagements[^0-9%]{0,90}(\d{1,3}(?:[.,]\d+)?)\s*%/i],"%"),price);
 put(out,ev,"endettement_net_pct",searchPage(pages,[/(?:ratio\s+)?(?:d['’]?endettement|dette)\s+net(?:te)?(?:\s+de\s+tr[eé]sorerie)?[^0-9%]{0,80}(\d{1,3}(?:[.,]\d+)?)\s*%/i],"%"),price);
 put(out,ev,"cout_moyen_dette_pct",searchPage(pages,[/co[uû]t\s+moyen\s+(?:de\s+la\s+)?dette[^0-9%]{0,80}(\d{1,2}(?:[.,]\d+)?)\s*%/i,/taux\s+moyen\s+(?:de\s+la\s+)?dette[^0-9%]{0,80}(\d{1,2}(?:[.,]\d+)?)\s*%/i],"%"),price);
 put(out,ev,"dette_taux_fixe_couverte_pct",searchPage(pages,[/(\d{1,3}(?:[.,]\d+)?)\s*%[^\n]{0,100}(?:dette|emprunts?)[^\n]{0,100}(?:taux\s+fixe|couvert(?:e|s)?)/i,/(?:taux\s+fixe|couvert(?:e|s)?)[^0-9%]{0,100}(\d{1,3}(?:[.,]\d+)?)\s*%/i],"%"),price);
 put(out,ev,"variation_patrimoine_perimetre_constant_pct",searchPage(pages,[/(?:valeur|patrimoine)[^\n]{0,120}p[eé]rim[eè]tre\s+constant[^0-9%+\-]{0,60}([+\-]?\d{1,3}(?:[.,]\d+)?)\s*%/i,/([+\-]?\d{1,3}(?:[.,]\d+)?)\s*%[^\n]{0,100}p[eé]rim[eè]tre\s+constant/i],"%"),price);
 const money=(metric:string,labels:RegExp[])=>{const pats=labels.map(l=>new RegExp(l.source+"[^0-9]{0,100}(\\d{1,4}(?:[.,]\\d+)?)\\s*(Md€|M€|milliards?|millions?)",l.flags.includes('i')?'i':'i'));for(let i=0;i<pages.length;i++){for(const re of pats){const m=re.exec(pages[i]);if(m){let v=fr(m[1]);if(v!==null){if(/^md|milliard/i.test(m[2]))v*=1000;const h={value:v,page:i+1,text:snippet(pages[i],m.index,m[0].length),method:"pdf_page_regex",unit:"M€"};put(out,ev,metric,h,price);return;}}}}};
 money("valeur_patrimoine_m",[/valeur\s+(?:v[eé]nale|du\s+patrimoine)/i,/patrimoine\s+immobilier/i]);
 money("dette_m",[/dette\s+bancaire/i,/encours\s+de\s+dette/i,/endettement\s+bancaire/i]);
 money("nouveaux_financements_m",[/nouveaux?\s+(?:emprunts?|financements?)/i,/financements?\s+mis\s+en\s+place/i]);
 money("acquisitions_m",[/acquisitions?\s+(?:de\s+l['’]?exercice|2025)?/i,/investissements?\s+(?:immobiliers?\s+)?(?:de\s+l['’]?exercice|2025)/i]);
 money("cessions_m",[/cessions?\s+(?:de\s+l['’]?exercice|2025)?/i,/arbitrages?\s+(?:de\s+l['’]?exercice|2025)/i]);
 money("plus_values_cessions_m",[/plus[-\s]?values?\s+(?:de\s+)?cessions?/i,/plus[-\s]?values?\s+(?:immobili[eè]res?|r[eé]alis[eé]es?)/i]);
 put(out,ev,"taux_nouveaux_financements_pct",searchPage(pages,[/(?:nouveaux?\s+(?:emprunts?|financements?)|financements?\s+mis\s+en\s+place)[^\n]{0,180}(\d{1,2}(?:[.,]\d+)?)\s*%/i],"%"),price);
 put(out,ev,"duration_dette_annees",searchPage(pages,[/(?:duration|dur[eé]e\s+moyenne)[^\n]{0,80}(\d{1,2}(?:[.,]\d+)?)\s*ans/i],"ans"),price);
 put(out,ev,"maturite_residuelle_dette_annees",searchPage(pages,[/(?:maturit[eé]|dur[eé]e\s+r[eé]siduelle)[^\n]{0,100}(\d{1,2}(?:[.,]\d+)?)\s*ans/i],"ans"),price);
 return {metrics:out,evidence:ev};}

Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return Response.json({error:"POST required"},{status:405});
 const base=Deno.env.get("SUPABASE_URL")||"",key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";if(!base||!key)return Response.json({error:"admin unavailable"},{status:500});
 const db=createClient(base,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const token=req.headers.get("x-annual-token")||"",hash=await shaText(token);const {data:cfg}=await db.from("scpi_bulletin_runtime_config").select("value").eq("key","annual_cron_token_sha256").maybeSingle();if(!token||!cfg||cfg.value!==hash)return Response.json({error:"unauthorized"},{status:401});
 let body:any={};try{body=await req.json();}catch{}const slug=String(body.slug||""),year=Number(body.year||2025);if(!slug)return Response.json({error:"slug required"},{status:400});
 const {data:existing}=await db.from("scpi_annual_fundamentals").select("qa_status").eq("scpi_slug",slug).eq("fiscal_year",year).maybeSingle();if(existing?.qa_status==="manual_verified_official")return Response.json({ok:true,status:"protected_manual",slug,year});
 const {data:r}=await db.from("scpi_annual_reports").select("id,source_url,source_document,qa_status").eq("scpi_slug",slug).eq("fiscal_year",year).maybeSingle();if(!r?.source_url)return Response.json({ok:false,status:"source_missing",slug,year});
 if(!["source_verified_content","source_verified"].includes(String(r.qa_status||"")))return Response.json({ok:false,status:"source_not_verified",slug,year,qa:r.qa_status});
 const {data:s}=await db.from("scpi_source_registry").select("official_scpi_page_url,source_domain").eq("scpi_slug",slug).maybeSingle();const referer=s?.official_scpi_page_url||s?.source_domain||undefined;
 const {data:cur}=await db.from("scpi_indicators").select("prix_souscription").eq("scpi_slug",slug).maybeSingle();const price=typeof cur?.prix_souscription==="number"?cur.prix_souscription:Number(cur?.prix_souscription||0)||null;
 try{const bytes=await getPdf(r.source_url,referer);let pages=await pagesText(bytes);let ocrRecovered=false;
if(pages.join(" ").trim().length<600){
const digest=await crypto.subtle.digest("SHA-256",bytes);
const hash=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
const {data:ocr}=await db.rpc("scpi_ocr_read_verified_pages",{p_slug:slug,p_period:String(year)+"-RA",p_kind:"annual_report",p_url:r.source_url,p_sha256:hash});
if(ocr?.length){const recovered=Array(pages.length).fill("");for(const x of ocr)if(x.page_number>=1&&x.page_number<=recovered.length)recovered[x.page_number-1]=x.page_text;pages=recovered;ocrRecovered=true;}
else {const {data:state}=await db.rpc("scpi_ocr_request_fallback",{p_slug:slug,p_period:String(year)+"-RA",p_kind:"annual_report",p_url:r.source_url});return Response.json({ok:false,status:"ocr_pending",slug,year,queue:state});}
}
const parsed=parse(pages,price);const count=Object.keys(parsed.metrics).length;const qa=count>=5?"auto_extracted_evidence_review":count>=2?"partial_evidence_review":"source_only";const conf=count>=5?0.90:count>=2?0.75:1.0;
   await db.from("scpi_annual_reports").update({processed_at:new Date().toISOString(),extraction_json:{metrics:parsed.metrics,evidence:parsed.evidence,parser_version:PARSER_VERSION},extraction_confidence:conf,qa_status:r.qa_status==="source_verified"?"source_verified":r.qa_status,updated_at:new Date().toISOString()}).eq("id",r.id);
   if(ocrRecovered)return Response.json({ok:true,status:"ocr_staged_pending_independent_qa",slug,year,metrics:count,keys:Object.keys(parsed.metrics)});
   const payload:any={scpi_slug:slug,fiscal_year:year,...parsed.metrics,source_url:r.source_url,source_document:r.source_document,source_report_id:r.id,qa_status:qa,source_confidence:conf,evidence:parsed.evidence,updated_at:new Date().toISOString()};
   const {error}=await db.from("scpi_annual_fundamentals").upsert(payload,{onConflict:"scpi_slug,fiscal_year"});if(error)throw error;
   return Response.json({ok:true,status:qa,slug,year,metrics:count,keys:Object.keys(parsed.metrics)});
 }catch(e){return Response.json({ok:false,status:"failed",slug,year,error:String(e)});}
});