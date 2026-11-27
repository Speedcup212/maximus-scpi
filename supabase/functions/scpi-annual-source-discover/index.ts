import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { readServiceKey } from "../_shared/serviceKey.ts";

const UA="Mozilla/5.0 (compatible; MaximusSCPI-AnnualSourceBot/2.0; +https://maximusscpi.com)";
const ANNUAL=/(rapport[^\n]{0,45}(annuel|gestion|activit[eé])|annual[^\n]{0,25}report)/i;
const DOCS=/(documentation|documents?|ressources|publications|t[eé]l[eé]chargements?|archives?)/i;
const BAD=/(bulletin|trimestriel|semestriel|dic|kiid|priips?|sfdr|statuts?|prospectus|notice|politique|transparence)/i;
const norm=(s:string)=>String(s||"").replace(/œ/gi,"oe").replace(/æ/gi,"ae").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();
const completeAliasMatch=(s:string,aliases:string[])=>{const h=` ${norm(s)} `;return aliases.some(a=>{const n=norm(a);return n.length>=4&&h.includes(` ${n} `);});};
function explicitYear(head:string,year:number){const h=norm(head.slice(0,18000)),y=String(year);return [new RegExp(`rapport (?:annuel|de gestion|d activite)[^0-9]{0,60}${y}`),new RegExp(`${y}[^0-9]{0,30}rapport (?:annuel|de gestion|d activite)`),new RegExp(`exercice (?:clos )?(?:au )?(?:31 12 )?${y}`),new RegExp(`comptes (?:annuels )?(?:de l exercice )?${y}`)].some(r=>r.test(h));}
async function shaText(s:string){const h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("");}
async function shaBytes(b:Uint8Array){const h=await crypto.subtle.digest("SHA-256",b);return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("");}
async function getText(url:string,ms=9000){const c=new AbortController(),tm=setTimeout(()=>c.abort(),ms);try{const r=await fetch(url,{redirect:"follow",signal:c.signal,headers:{"User-Agent":UA,"Accept":"text/html,application/xhtml+xml,*/*;q=0.8"}});if(!r.ok)throw new Error("HTTP "+r.status);return {url:r.url,text:await r.text()};}finally{clearTimeout(tm);}}
async function pdf(url:string,referer?:string){const c=new AbortController(),tm=setTimeout(()=>c.abort(),30000);try{const headers:any={"User-Agent":UA,"Accept":"application/pdf,text/html;q=0.9,*/*;q=0.8"};if(referer)headers.Referer=referer;const r=await fetch(url,{redirect:"follow",signal:c.signal,headers});if(!r.ok)throw new Error("HTTP "+r.status);const b=new Uint8Array(await r.arrayBuffer());if(new TextDecoder().decode(b.slice(0,4))!=="%PDF")throw new Error("not_pdf");if(b.byteLength<1024||b.byteLength>60*1024*1024)throw new Error("bad_size");return b;}finally{clearTimeout(tm);}}
async function pdfText(b:Uint8Array){const unpdf:any=await import("npm:unpdf@0.12.1");const p=await unpdf.getDocumentProxy(b);if(p.numPages>220)throw new Error("pdf_too_long");const out=await unpdf.extractText(p,{mergePages:true});return String(out?.text||"").replace(/[\u0000-\u001F]/g," ");}
function makeUrl(raw:string,base:string){try{const u=new URL(raw.replace(/&amp;/g,"&"),base);if(!/^https?:$/.test(u.protocol))return null;u.hash="";return u.href;}catch{return null;}}
function anchors(h:string,base:string){const a:{url:string;text:string}[]=[];let m:RegExpExecArray|null,re=/<a\b([^>]*)>([\s\S]*?)<\/a>/gi;while((m=re.exec(h))){const x=/\bhref\s*=\s*(?:"([^"]+)"|'([^']+)')/i.exec(m[1]||"");const raw=x?.[1]||x?.[2];if(!raw)continue;const u=makeUrl(raw,base);if(!u)continue;a.push({url:u,text:(m[2]||"").replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/\s+/g," ").trim()});}return a;}
function host(u:string){try{return new URL(u).hostname.toLowerCase();}catch{return "";}}
function ref(u:string,label:string){try{return decodeURIComponent(new URL(u).pathname.split("/").pop()||"")+" "+label;}catch{return u+" "+label;}}
const hasYear=(s:string,y:number)=>new RegExp("\\b"+y+"\\b").test(s);
async function sitemaps(origin:string,allowed:Set<string>){const out=new Set<string>();for(const root of [origin+"/sitemap.xml",origin+"/sitemap_index.xml"]){try{const x=(await getText(root,5000)).text;const loc=[...x.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map(m=>m[1].trim());for(const u of loc.slice(0,100)){if(!allowed.has(host(u)))continue;if(/\.xml(?:$|\?)/i.test(u)){try{const k=(await getText(u,5000)).text;for(const z of k.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)){const v=z[1].trim();if(allowed.has(host(v)))out.add(v);}}catch{}}else out.add(u);}if(out.size)break;}catch{}}return [...out].slice(0,10000);}

async function find(startPages:{url:string,identity:boolean}[],aliases:string[],allowed:Set<string>,y:number){
 const candidates=new Map<string,number>();
 const pages:{url:string,identity:boolean,depth:number}[]=[];
 const queued=new Set<string>(),seen=new Set<string>();
 const addPage=(u:string,identity:boolean,depth:number)=>{if(depth>2||!allowed.has(host(u))||queued.has(u)||seen.has(u))return;queued.add(u);pages.push({url:u,identity,depth});};
 for(const s of startPages)addPage(s.url,s.identity,0);
 const addCandidate=(u:string,label:string,identityContext:boolean,boost=0)=>{if(!allowed.has(host(u)))return;const r=ref(u,label);if(BAD.test(r)||!hasYear(r,y)||!ANNUAL.test(r))return;const linkIdentity=completeAliasMatch(`${u} ${label}`,aliases);if(!linkIdentity&&!identityContext)return;candidates.set(u,Math.max((linkIdentity?250:150)+boost,candidates.get(u)||0));};
 let crawled=0;
 while(pages.length&&crawled<20){const cur=pages.shift()!;if(seen.has(cur.url))continue;seen.add(cur.url);let h="",finalUrl=cur.url;try{const rr=await getText(cur.url);h=rr.text;finalUrl=rr.url;}catch{continue}crawled++;const title=((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(h)?.[1])||"").replace(/<[^>]+>/g," ");const pageIdentity=cur.identity||completeAliasMatch(`${finalUrl} ${title}`,aliases);
   for(const a of anchors(h,finalUrl)){if(!allowed.has(host(a.url)))continue;const signal=`${a.url} ${a.text}`;const pdfish=/\.pdf(?:$|[?#])/i.test(a.url)||/download|telecharg/i.test(signal);addCandidate(a.url,a.text,pageIdentity,30);if(cur.depth<2&&!pdfish){const linkIdentity=completeAliasMatch(signal,aliases);if(DOCS.test(signal)||linkIdentity)addPage(a.url,linkIdentity,cur.depth+1);}}
 }
 const origins=[...new Set(startPages.map(x=>{try{return new URL(x.url).origin}catch{return ""}}).filter(Boolean))];
 for(const origin of origins){try{for(const u of await sitemaps(origin,allowed)){const r=ref(u,"");if(hasYear(r,y)&&ANNUAL.test(r)&&completeAliasMatch(r,aliases))candidates.set(u,Math.max(220,candidates.get(u)||0));}}catch{}}
 for(const [u] of [...candidates.entries()].sort((a,b)=>b[1]-a[1]).slice(0,30)){try{const bytes=await pdf(u,startPages[0]?.url);const t=await pdfText(bytes);if(!ANNUAL.test(t.slice(0,35000))||!explicitYear(t,y)||!completeAliasMatch(t.slice(0,35000),aliases))continue;return {url:u,bytes,text:t};}catch{}}
 return null;
}

Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return Response.json({error:"POST required"},{status:405});
 const base=Deno.env.get("SUPABASE_URL")||"",key=readServiceKey((k)=>Deno.env.get(k),"scpi_agents");const db=createClient(base,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const token=req.headers.get("x-annual-token")||"",hash=await shaText(token);const {data:cfg}=await db.from("scpi_bulletin_runtime_config").select("value").eq("key","annual_cron_token_sha256").maybeSingle();if(!token||!cfg||cfg.value!==hash)return Response.json({error:"unauthorized"},{status:401});
 let b:any={};try{b=await req.json();}catch{}const slug=String(b.slug||""),year=Number(b.year||2025);if(!slug||!Number.isInteger(year))return Response.json({error:"slug/year required"},{status:400});
 const {data:s}=await db.from("scpi_source_registry").select("scpi_slug,scpi_name,official_scpi_page_url,source_domain").eq("scpi_slug",slug).maybeSingle();if(!s)return Response.json({ok:false,status:"unknown_slug",slug});
 const {data:c}=await db.from("scpi_source_connectors").select("discovery_url,allowed_hosts").eq("scpi_slug",slug).eq("enabled",true).maybeSingle();
 const {data:a}=await db.from("scpi_name_aliases").select("alias").eq("scpi_slug",slug).eq("active",true);
 const aliases=[s.scpi_name,...(a||[]).map((x:any)=>x.alias)].filter(Boolean);const allowed=new Set<string>((c?.allowed_hosts||[]).map((x:string)=>x.toLowerCase()));
 for(const u of [s.official_scpi_page_url,c?.discovery_url,s.source_domain]){if(u){const h=host(u);if(h)allowed.add(h);}}
 const starts:{url:string,identity:boolean}[]=[];if(s.official_scpi_page_url)starts.push({url:s.official_scpi_page_url,identity:true});if(c?.discovery_url&&c.discovery_url!==s.official_scpi_page_url)starts.push({url:c.discovery_url,identity:completeAliasMatch(c.discovery_url,aliases)});if(!starts.length&&s.source_domain)starts.push({url:s.source_domain,identity:false});if(!starts.length)return Response.json({ok:false,status:"no_page",slug});
 try{const f=await find(starts,aliases,allowed,year);if(!f)return Response.json({ok:false,status:"annual_not_found",slug,year,aliases,allowed_hosts:[...allowed]});const h=await shaBytes(f.bytes);const {data:dup}=await db.from("scpi_annual_reports").select("fiscal_year").eq("scpi_slug",slug).eq("source_sha256",h).neq("fiscal_year",year).limit(1);if(dup?.length)return Response.json({ok:false,status:"duplicate_other_year",slug,year,other_year:dup[0].fiscal_year});const doc=decodeURIComponent(new URL(f.url).pathname.split("/").pop()||`rapport-annuel-${year}.pdf`);await db.from("scpi_annual_reports").upsert({scpi_slug:slug,fiscal_year:year,source_url:f.url,source_document:doc,source_sha256:h,qa_status:"source_verified_content",extraction_confidence:1,extraction_json:{identity_verified:true,aliases_checked:aliases,year_verified:true,official_allowed_host:true,discovery_version:"annual-alias-aware-v2"},processed_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:"scpi_slug,fiscal_year"});if(year>=new Date().getFullYear()-1)await db.from("scpi_source_registry").update({annual_report_url:f.url,updated_at:new Date().toISOString()}).eq("scpi_slug",slug);return Response.json({ok:true,status:"source_verified_content",slug,year,url:f.url,matched_aliases:aliases});}catch(e){return Response.json({ok:false,status:"failed",slug,year,error:String(e)});}
});