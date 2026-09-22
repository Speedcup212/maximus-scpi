
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type Source = {
  slug:string; name:string; management_company:string; official_url:string; news_url:string;
  documents_url:string; rss_url:string; enabled:boolean;
};
type Doc = { url:string; title:string; text:string; sourceType:string; listingContext:string; html?:string; genericPage?:boolean; imageUrl?:string };

const ACQ = [
  "acquisition","acquiert","acquièrent","a acquis","ont acquis","fait l'acquisition",
  "nouvelle acquisition","nouvelles acquisitions","nouvel actif","nouveaux actifs",
  "entrée au patrimoine","entree au patrimoine","intègre le patrimoine","integre le patrimoine",
  "premier investissement","acquired","acquires","purchase of","purchased","new acquisition"
];
const ASSETS = [
  "immeuble","bureaux","bureau","commerce","retail","retail park","logistique","entrepôt","entrepot",
  "locaux d'activité","locaux d'activités","hôtel","hotel","clinique","santé","sante","résidence","residence",
  "logement","actif immobilier","plateforme logistique","restaurant","campus","crèche","creche",
  "light industrial","industrial","warehouse","property","building"
];
const EXCLUDE_TITLE = [
  "cession","vente","arbitrage","nomination","webinaire","webinar","prix de part","taux de distribution",
  "assemblée générale","assemblee generale","dividende","fiscalité","fiscalite","récompense","recompense",
  "award","palmarès","palmares","interview","prix de la part","augmentation du prix",
  "bilan","arrivée de","arrivee de","rejoindre","recrutement","partenaire de"
];
const DOC_HINTS = ["bulletin","trimestriel","quarter","rapport annuel","rapport semestriel","reporting","lettre trimestrielle"];
const CITY_COUNTRY:[string,string][] = [
  ["Paris","France"],["Lyon","France"],["Marseille","France"],["Toulouse","France"],["Bordeaux","France"],["Nantes","France"],
  ["Lille","France"],["Montpellier","France"],["Rennes","France"],["Strasbourg","France"],["Grenoble","France"],["Toulon","France"],["Corbeil-Essonnes","France"],["La Roche-sur-Yon","France"],
  ["Madrid","Espagne"],["Barcelone","Espagne"],["Valence","Espagne"],["Valencia","Espagne"],["Malaga","Espagne"],["Séville","Espagne"],
  ["Lisbonne","Portugal"],["Porto","Portugal"],["Berlin","Allemagne"],["Hambourg","Allemagne"],["Munich","Allemagne"],["Dresde","Allemagne"],
  ["Francfort","Allemagne"],["Dublin","Irlande"],["Londres","Royaume-Uni"],["London","Royaume-Uni"],["Manchester","Royaume-Uni"],
  ["Plymouth","Royaume-Uni"],["Perth","Royaume-Uni"],["Lichfield","Royaume-Uni"],["Milan","Italie"],["Rome","Italie"],["Vérone","Italie"],["Verone","Italie"],["Castel Maggiore","Italie"],["Gênes","Italie"],["Genes","Italie"],
  ["Bologne","Italie"],["Amsterdam","Pays-Bas"],["Rotterdam","Pays-Bas"],["Bruxelles","Belgique"],["Anvers","Belgique"],
  ["Grenade","Espagne"],["Granada","Espagne"],["Varsovie","Pologne"],["Warsaw","Pologne"],["Prague","République tchèque"],["Copenhague","Danemark"],["Stockholm","Suède"]
];

function norm(s:string){
  return (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[’‘]/g,"'").replace(/[^a-z0-9']+/g," ").replace(/\s+/g," ").trim();
}
function decodeEntities(s:string){
  return (s||"")
    .replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&quot;/gi,'"')
    .replace(/&#0*39;|&#x0*27;|&apos;|&rsquo;|&lsquo;/gi,"'")
    .replace(/&eacute;/gi,"é").replace(/&egrave;/gi,"è").replace(/&ecirc;/gi,"ê")
    .replace(/&agrave;/gi,"à").replace(/&ccedil;/gi,"ç").replace(/&ocirc;/gi,"ô")
    .replace(/&lt;/gi,"<").replace(/&gt;/gi,">")
    .replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)));
}
function stripHtml(html:string){
  return decodeEntities(html)
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi," ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi," ")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi," ")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi," ")
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi," ")
    .replace(/<br\s*\/?>/gi,"\n")
    .replace(/<\/p>|<\/li>|<\/h[1-6]>|<\/div>/gi,"\n")
    .replace(/<[^>]+>/g," ")
    .replace(/\s+/g," ").trim();
}
function cleanTitle(s:string){
  return stripHtml(decodeEntities(s))
    .replace(/\s+/g," ")
    .replace(/\s*-\s*wemo\s*$/i,"")
    .replace(/\s*-\s*[^-]{0,50}(?:Groupe|Asset Management|REIM)\s*$/i,"")
    .trim().slice(0,220);
}
function hasAny(text:string, terms:string[]){const n=norm(text);return terms.some(x=>n.includes(norm(x)));}
function isAcq(text:string){return hasAny(text,ACQ) && hasAny(text,ASSETS);}
function sameHost(a:string,b:string){
  try{const A=new URL(a).hostname.replace(/^www\./,""),B=new URL(b).hostname.replace(/^www\./,"");
    return A===B || A.endsWith("."+B) || B.endsWith("."+A);}catch{return false;}
}
function extractTitle(html:string){
  const og=html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["'][^>]*>/i);
  if(og)return cleanTitle(og[1]);
  const h=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i); if(h)return cleanTitle(h[1]);
  const t=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i); return t?cleanTitle(t[1]).split("|")[0].trim():"";
}
function extractImage(html:string,base:string){
  const pats=[
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["'][^>]*>/i
  ];
  for(const p of pats){const m=html.match(p);if(m){try{return new URL(decodeEntities(m[1]),base).href;}catch{}}}
  const imgs=[...html.slice(0,40000).matchAll(/<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/gi)];
  for(const m of imgs){if(/logo|avatar|icon|favicon|placeholder/i.test(m[1]))continue;try{return new URL(decodeEntities(m[1]),base).href;}catch{}}
  return "";
}
function titleFromUrl(url:string){
  try{
    const raw=decodeURIComponent(new URL(url).pathname.split("/").filter(Boolean).pop()||"");
    const s=raw.replace(/^[-_]+/,"").replace(/[-_]+/g," ").replace(/\s+/g," ").trim();
    return s?s.charAt(0).toUpperCase()+s.slice(1):"";
  }catch{return "";}
}
function isGenericTitle(t:string){
  return /^(actualit[eé]s?|news|accueil|en savoir plus|lire la suite|d[eé]couvrir)$/i.test((t||"").trim());
}
function articleText(html:string){
  const h=html.search(/<h1\b/i);
  let text="";
  if(h>=0) text=stripHtml(html.slice(h,Math.min(html.length,h+45000)));
  else {
    const main=html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    text=main?stripHtml(main[1]):stripHtml(html).slice(0,30000);
  }
  const stops=["Les actualités de","Les actualites de","Nos dernières actualités","Nos dernieres actualites","Articles similaires","Autres actualités","Autres actualites"];
  let cut=text.length;
  for(const s of stops){const p=text.indexOf(s,250);if(p>=0&&p<cut)cut=p;}
  return text.slice(0,cut).trim();
}
function signalWindow(text:string){
  const n=norm(text); let pos=-1;
  for(const sig of ACQ){const p=n.indexOf(norm(sig)); if(p>=0 && (pos<0||p<pos))pos=p;}
  if(pos<0)return text.slice(0,2500);
  // normalized indices differ slightly from original; a broader slice remains safe and local.
  const ratio=text.length/Math.max(1,n.length); const p=Math.floor(pos*ratio);
  return text.slice(Math.max(0,p-450),Math.min(text.length,p+2200)).replace(/\s+/g," ").trim();
}
function extractLinks(html:string,base:string){
  const out:{url:string;text:string;context:string}[]=[]; const seen=new Set<string>();
  const re=/<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi; let m:RegExpExecArray|null;
  while((m=re.exec(html))!==null){
    let url=m[1]; if(!url||url.startsWith("#")||url.startsWith("mailto:")||url.startsWith("javascript:")||url.startsWith("tel:"))continue;
    try{url=new URL(url,base).href;}catch{continue;}
    if(!sameHost(url,base)||seen.has(url))continue;
    seen.add(url);
    const start=Math.max(0,m.index-900),end=Math.min(html.length,re.lastIndex+900);
    out.push({url,text:cleanTitle(m[2]),context:stripHtml(html.slice(start,end))});
  }
  return out;
}
function aliases(name:string){
  const n=norm(name); const s=new Set<string>([n]);
  s.add(n.replace(/\bproximite\b/g,"").trim()); s.add(n.replace(/\bmetropoles\b/g,"").trim());
  const special:Record<string,string[]> = {
    "ficommerce proximite":["ficommerce"],
    "buroboutic metropoles":["buroboutic"],
    "perial o2":["pfo2","perial o2"],
    "coeur de region":["coeur de regions","coeur de region"],
    "coeur de ville":["coeur de ville"],
    "coeur d'europe":["coeur d'europe","coeur deurope"],
    "atream hotel":["atream hotel","atream hotels"]
  };
  for(const a of special[n]||[])s.add(norm(a));
  return [...s].filter(x=>x.length>=4);
}
function mentioned(text:string,s:Source){const n=norm(text);return aliases(s.name).some(a=>n.includes(a));}
function matchSources(doc:Doc,sources:Source[]){
  const win=signalWindow(doc.text);
  const titleN=norm(doc.title), winN=norm(win), urlN=norm(doc.url), contextN=norm(doc.listingContext);
  const scored=sources.map(s=>{
    const aa=aliases(s.name);
    let score=0;
    if(aa.some(a=>titleN.includes(a)))score+=12;
    if(aa.some(a=>urlN.includes(a.replace(/'/g," "))))score+=9;
    if(!doc.genericPage && aa.some(a=>winN.includes("scpi "+a)))score+=10;
    if(!doc.genericPage && aa.some(a=>winN.includes(a)))score+=3;
    if(doc.sourceType!=="web_page" && aa.some(a=>contextN.includes(a)))score+=8;
    return {s,score};
  });
  const max=Math.max(0,...scored.map(x=>x.score));
  if(max<8)return [];
  return scored.filter(x=>x.score===max && x.score>=8).map(x=>x.s);
}
function parseTextDate(text:string):string|null{
  const iso=text.match(/\b(20\d{2})[-\/](0?[1-9]|1[0-2])[-\/](0?[1-9]|[12]\d|3[01])\b/);
  if(iso)return iso[1]+"-"+String(iso[2]).padStart(2,"0")+"-"+String(iso[3]).padStart(2,"0");
  const fr=text.match(/\b(0?[1-9]|[12]\d|3[01])[\/.](0?[1-9]|1[0-2])[\/.](20\d{2})\b/);
  if(fr)return fr[3]+"-"+String(fr[2]).padStart(2,"0")+"-"+String(fr[1]).padStart(2,"0");
  const months:Record<string,string>={janvier:"01",fevrier:"02",février:"02",mars:"03",avril:"04",mai:"05",juin:"06",juillet:"07",aout:"08",août:"08",septembre:"09",octobre:"10",novembre:"11",decembre:"12",décembre:"12"};
  const fm=text.toLowerCase().match(/\b(0?[1-9]|[12]\d|3[01])\s+(janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)\s+(20\d{2})\b/);
  return fm?fm[3]+"-"+months[fm[2]]+"-"+String(fm[1]).padStart(2,"0"):null;
}
function metaDate(html:string){
  const patterns=[
    /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']date["'][^>]+content=["']([^"']+)["']/i,
    /"datePublished"\s*:\s*"([^"]+)"/i,
    /<time[^>]+datetime=["']([^"']+)["']/i
  ];
  for(const p of patterns){const m=html.match(p);if(m){const d=parseTextDate(m[1])||m[1].slice(0,10);if(/^\d{4}-\d{2}-\d{2}$/.test(d))return d;}}
  return null;
}
function yearFromUrl(url:string){const years=[...url.matchAll(/(?:^|[^0-9])(20\d{2})(?:[^0-9]|$)/g)].map(m=>Number(m[1]));return years.length?Math.max(...years):null;}
function fresh(date:string|null,url:string){
  const uy=yearFromUrl(url); if(uy && uy<2025)return false;
  if(!date)return true;
  const t=new Date(date+"T00:00:00Z").getTime(); if(!Number.isFinite(t))return true;
  return Date.now()-t < 1000*60*60*24*620 && t < Date.now()+1000*60*60*24*20;
}
function getDate(doc:Doc){
  if(doc.html){const m=metaDate(doc.html);if(m)return m;}
  return parseTextDate(doc.listingContext.slice(0,1200)) || parseTextDate(doc.title) || parseTextDate(signalWindow(doc.text));
}
function location(text:string){
  const n=norm(text);let best:{city:string;country:string;pos:number}|null=null;
  for(const [city,country] of CITY_COUNTRY){const p=n.indexOf(norm(city));if(p>=0&&(!best||p<best.pos))best={city,country,pos:p};}
  if(best)return {city:best.city,country:best.country};
  const cs=["France","Allemagne","Espagne","Italie","Portugal","Irlande","Royaume-Uni","Pays-Bas","Belgique","Pologne","Danemark","Suède"];
  let countryBest:{country:string;pos:number}|null=null;
  for(const country of cs){const p=n.indexOf(norm(country));if(p>=0&&(!countryBest||p<countryBest.pos))countryBest={country,pos:p};}
  return countryBest?{city:"",country:countryBest.country}:{city:"",country:""};
}
function assetType(text:string){const n=norm(text);
  if(/hotel|hoteller|touris/.test(n))return "hotellerie";
  if(/logist|entrepot|warehouse|light industrial|locaux d'activ|immeuble d'activ/.test(n))return "logistique";
  if(/sante|clinique|ehpad|medical|laboratoire/.test(n))return "sante";
  if(/commerce|retail|restaurant|boutique|supermarche/.test(n))return "commerce";
  if(/residen|logement|coliving/.test(n))return "residentiel_gere";
  if(/bureau|office/.test(n))return "bureaux";
  if(/ecole|campus|education|creche/.test(n))return "education";
  return "autre_immobilier";
}
function amount(t:string){const m=t.match(/\b(\d+(?:[.,]\d+)?)\s*(?:M€|millions?\s+d['’]euros|millions?\s+€)\b/i);return m?m[0]:"";}
function surface(t:string){const m=t.match(/\b([\d\s.,]{2,12})\s*m(?:²|2)\b/i);return m?m[0].replace(/\s+/g," ").trim():"";}
function yieldAem(t:string){
  const m=t.match(/rendement\s+(?:acte\s+en\s+main\s*\(AEM\)|AEM)[^0-9]{0,100}(\d{1,2}(?:[.,]\d+)?)\s*%/i);
  return m?m[1].replace(".",",")+" % (non garanti)":"";
}
function annualRent(t:string){
  const m=t.match(/loyer\s+annuel[^0-9]{0,100}(?:d['’]environ\s+|environ\s+)?(\d+(?:[.,]\d+)?)\s*(M€|millions?\s+d['’]euros|k€|€)/i);
  if(!m)return "";
  return (m[1]+" "+m[2]).replace(/millions?\s+d['’]euros/i,"M€");
}
function rooms(t:string){
  const m=t.match(/\b(\d{2,4})\s+chambres?\b/i);
  return m?m[1]+" chambres":"";
}
function summary(title:string,window:string){
  let t=(window||"").replace(/\s+/g," ").trim();
  if(title && t.toLowerCase().startsWith(title.toLowerCase())){
    t=t.slice(title.length).replace(/^[.\s-]+/,"");
  }
  t=t.replace(/^Publi[eé]\s+par\s+[^|]{1,60}\|\s*\d{1,2}\s+[^ ]+\s+20\d{2}\s*/i,"");
  const sentences=t.match(/[^.!?]+[.!?]+/g) || [t];
  return sentences.slice(0,2).join(" ").replace(/\s+/g," ").trim().slice(0,420);
}
async function sha(s:string){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");}
async function fetchResource(url:string,timeout=12000){
  const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),timeout);
  try{
    const r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0 (compatible; MaximusSCPI-NewsBot/3.1; +https://maximusscpi.com)","Accept":"text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.6"},redirect:"follow",signal:ctrl.signal});
    if(!r.ok)throw new Error("HTTP "+r.status);
    const ct=(r.headers.get("content-type")||"").toLowerCase();
    if(ct.includes("application/pdf")||r.url.toLowerCase().includes(".pdf"))return {kind:"pdf" as const,url:r.url,buffer:await r.arrayBuffer(),html:""};
    return {kind:"html" as const,url:r.url,buffer:null,html:await r.text()};
  }finally{clearTimeout(timer);}
}
async function pdfText(buffer:ArrayBuffer){
  try{const mod:any=await import("npm:pdf-parse@1.1.1");const fn=mod.default||mod;const d=await fn(new Uint8Array(buffer));return String(d?.text||"").replace(/\s+/g," ").trim();}
  catch(e){console.warn("PDF parse",String(e));return "";}
}
function groups(sources:Source[]){const m=new Map<string,Source[]>();for(const s of sources){const u=(s.news_url||s.documents_url||s.official_url||"").replace(/\/+$/,"");if(!u)continue;if(!m.has(u))m.set(u,[]);m.get(u)!.push(s);}return [...m.entries()];}

async function processGroup(url:string,sources:Source[]){
  const errors:string[]=[]; const docs:Doc[]=[];
  try{
    const main=await fetchResource(url);
    if(main.kind==="html"){
      const links=extractLinks(main.html,main.url);
      const interesting=links.filter(l=>{
        const local=l.text+" "+l.context;
        if(yearFromUrl(l.url) && yearFromUrl(l.url)!<2025)return false;
        return isAcq(local) || hasAny(local,DOC_HINTS);
      });
      const unique=[...new Map(interesting.map(l=>[l.url,l])).values()].slice(0,24);
      const results=await Promise.allSettled(unique.map(async l=>{
        const r=await fetchResource(l.url,11000);
        if(r.kind==="pdf"){
          const txt=await pdfText(r.buffer); if(!txt)return null;
          return {url:r.url,title:l.text||"Bulletin SCPI",text:txt,sourceType:"pdf_bulletin",listingContext:l.context} as Doc;
        }
        const extracted=extractTitle(r.html);
        const generic=isGenericTitle(extracted);
        const linkUseful=l.text && !isGenericTitle(l.text);
        const title=generic?(linkUseful?l.text:titleFromUrl(r.url)):extracted;
        return {url:r.url,title:title||l.text||titleFromUrl(r.url),text:articleText(r.html),sourceType:"web_page",listingContext:l.context,html:r.html,genericPage:generic,imageUrl:extractImage(r.html,r.url)} as Doc;
      }));
      for(const x of results){if(x.status==="fulfilled"&&x.value)docs.push(x.value);else if(x.status==="rejected")errors.push(String(x.reason));}
    } else {
      const txt=await pdfText(main.buffer);if(txt)docs.push({url:main.url,title:"Bulletin SCPI",text:txt,sourceType:"pdf_bulletin",listingContext:""});
    }
  }catch(e){errors.push(String(e));}

  const items:any[]=[]; const counts=new Map<string,number>();
  for(const doc of docs){
    const win=signalWindow(doc.text);
    const first=doc.text.slice(0,3200);
    const titleOrUrlSignal=hasAny(doc.title,ACQ)||hasAny(doc.url,ACQ);
    if(!titleOrUrlSignal && !isAcq(first))continue;
    const evidence=doc.title+" "+win;
    if(!isAcq(evidence))continue;
    if(hasAny(doc.title,EXCLUDE_TITLE))continue;
    const matched=matchSources(doc,sources);
    if(!matched.length)continue;
    const d=getDate(doc); if(!fresh(d,doc.url))continue;
    const fieldEvidence=doc.genericPage?(doc.title+" "+doc.url):doc.text.slice(0,12000);
    const titleLoc=location(doc.title+" "+doc.url);
    const loc=(titleLoc.city||titleLoc.country)?titleLoc:location(fieldEvidence);
    const titleAsset=assetType(doc.title+" "+doc.url);
    const at=titleAsset!=="autre_immobilier"?titleAsset:(doc.genericPage?"autre_immobilier":assetType(fieldEvidence));
    const amt=amount(fieldEvidence),surf=surface(fieldEvidence),aem=yieldAem(fieldEvidence),rent=annualRent(fieldEvidence),roomCount=rooms(fieldEvidence);
    for(const s of matched){
      const dedupeKey=doc.sourceType==="web_page"
        ? s.slug+"|"+doc.url
        : d&&loc.city
        ? s.slug+"|"+d+"|"+loc.city+"|"+loc.country+"|"+at
        : d&&(amt||surf)
        ? s.slug+"|"+d+"|"+loc.country+"|"+at+"|"+amt+"|"+surf
        : s.slug+"|"+doc.url+"|"+norm(doc.title);
      const fp=await sha(dedupeKey);
      items.push({
        fingerprint:fp,scpi_slug:s.slug,scpi_name:s.name,management_company:s.management_company,
        operation_type:"acquisition",asset_type:at,country:loc.country,city:loc.city,amount:amt,
        surface:surf,title:cleanTitle(doc.title).slice(0,220),summary:doc.genericPage?cleanTitle(doc.title).slice(0,220):summary(cleanTitle(doc.title),win),source_url:doc.url,...(doc.imageUrl?{image_url:doc.imageUrl,image_alt:cleanTitle(doc.title),image_credit:s.management_company||s.name}:{}),...(aem?{yield_aem:aem}:{}),...(rent?{annual_rent:rent}:{}),...(roomCount?{rooms:roomCount}:{}),...(doc.sourceType==="web_page"?{source_document_label:(s.management_company||s.name)+" — publication officielle"}:{}),
        source_type:doc.sourceType,source_official:true,published_date:d,detected_at:new Date().toISOString(),
        data_quality:(loc.city||loc.country)?"standard":"partial",editorial_priority:(loc.city||loc.country)?2:3,
        confidence:(loc.city||loc.country)?0.94:0.86,status:"published"
      });
      counts.set(s.slug,(counts.get(s.slug)||0)+1);
    }
  }
  return {items:[...new Map(items.map(i=>[i.fingerprint,i])).values()],errors,counts,ok:docs.length>0||errors.length===0};
}

Deno.serve(async(req:Request)=>{
  if(req.method!=="POST")return Response.json({error:"POST required"},{status:405});
  const base=Deno.env.get("SUPABASE_URL")||"";let key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
  if(!key){try{key=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default||"";}catch{}}
  if(!base||!key)return Response.json({error:"admin credentials unavailable"},{status:500});
  const db=createClient(base,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const token=req.headers.get("x-cron-token")||"",hash=await sha(token);
  const {data:cfg}=await db.from("scpi_news_runtime_config").select("value").eq("key","cron_token_sha256").maybeSingle();
  if(!token||!cfg||cfg.value!==hash)return Response.json({error:"unauthorized"},{status:401});

  const {data:sources,error}=await db.from("scpi_news_sources").select("*").eq("enabled",true);
  if(error)return Response.json({error:error.message},{status:500});
  const gs=groups((sources||[]) as Source[]);
  const {data:run}=await db.from("scpi_news_runs").insert({sources_total:(sources||[]).length,status:"running"}).select("id").single();

  let success=0,failed=0,detected=0,inserted=0;const details:any[]=[];
  for(let i=0;i<gs.length;i+=4){
    const batch=gs.slice(i,i+4),results=await Promise.all(batch.map(([u,ss])=>processGroup(u,ss)));
    for(let j=0;j<results.length;j++){
      const [u,ss]=batch[j],r=results[j];detected+=r.items.length;
      if(r.items.length){
        const up=await db.from("scpi_news_items").upsert(r.items,{onConflict:"fingerprint",ignoreDuplicates:true}).select("id");
        if(up.error)r.errors.push(up.error.message);else inserted+=(up.data||[]).length;
      }
      for(const s of ss){
        const ok=r.ok,patch:any={status:ok?"active":"error",last_checked_at:new Date().toISOString(),last_items_found:r.counts.get(s.slug)||0,last_error:ok?null:(r.errors[0]||"Source inaccessible"),updated_at:new Date().toISOString()};
        if(ok)patch.last_success_at=new Date().toISOString();
        await db.from("scpi_news_sources").update(patch).eq("slug",s.slug);
        if(ok)success++;else failed++;
      }
      details.push({url:u,sources:ss.map(s=>s.slug),items:r.items.length,errors:r.errors.slice(0,3)});
    }
  }
  const status=failed===0?"success":success>0?"partial":"error";
  if(run?.id)await db.from("scpi_news_runs").update({finished_at:new Date().toISOString(),status,sources_success:success,sources_error:failed,items_detected:detected,items_inserted:inserted,details}).eq("id",run.id);
  return Response.json({ok:status!=="error",status,sources:(sources||[]).length,groups:gs.length,success,failed,detected,inserted});
});
