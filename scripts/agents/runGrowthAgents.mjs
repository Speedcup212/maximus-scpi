import fs from 'node:fs';
import path from 'node:path';
import {enforceQuota} from './growthQuota.mjs';

export const ROLES = Object.freeze({
 SEO_TECH:['SEO','Diagnostiquer les statuts HTTP, canoniques, H1 et sitemap réellement observés. Proposer des correctifs sans prétendre les avoir appliqués.'],
 SEO_KEYWORDS:['SEO','Rechercher des questions pédagogiques sur la fiscalité, les frais, la liquidité et les risques des SCPI, sans promettre de rendement.'],
 SEO_SCPI:['SEO','Améliorer un modèle de fiche SCPI : période, source primaire, métriques manquantes, risques et comparaison conditionnelle.'],
 SEO_LINKS:['SEO','Proposer des liens internes vérifiables entre comparateur, simulateurs, pédagogie et fiches SCPI.'],
 SEO_COMPETITORS:['SEO','Proposer une méthode de veille SEO concurrentielle sans prétendre avoir visité de sites externes.'],
 CONTENT_EDUCATION:['CONTENT','Rédiger une note pédagogique sur risques, frais et liquidité des SCPI.'],
 CONTENT_NEWS:['CONTENT','Préparer un protocole de veille de nouvelles officielles SCPI avec date, URL et comparaison des périodes, sans inventer de nouvelles.'],
 CONTENT_COMPLIANCE:['CONTENT','Contrôler la neutralité et la conformité CIF de contenus généraux SCPI, les risques, les sources et les limites.'],
 SOCIAL_LINKEDIN:['SOCIAL','Rédiger un brouillon pédagogique LinkedIn sur les limites du rendement passé et la liquidité des SCPI.'],
 SOCIAL_FACEBOOK:['SOCIAL','Rédiger un brouillon pédagogique Facebook sur diversification SCPI et risques.'],
 ACQUISITION_CRO:['ACQUISITION','Proposer des améliorations du parcours simulateur-comparateur-visioconférence sans manipulation.'],
 ACQUISITION_LEADS:['ACQUISITION','Améliorer le formulaire de contact, consentement RGPD et clarté du parcours, sans collecter de données sensibles.']
});
export const BATCHES = Object.freeze({
 Mon:['SEO_TECH','SEO_KEYWORDS','SEO_SCPI'],
 Tue:['SEO_LINKS','SEO_COMPETITORS','CONTENT_EDUCATION'],
 Wed:['CONTENT_NEWS','CONTENT_COMPLIANCE','SOCIAL_LINKEDIN'],
 Thu:['SOCIAL_FACEBOOK','ACQUISITION_CRO','ACQUISITION_LEADS']
});
export function rolesFor(event,day) { return event==='schedule' ? (BATCHES[day]||[]) : ['SEO_TECH']; }
export function htmlMeta(s) {
 return {
  title:(s.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'').replace(/\s+/g,' ').trim().slice(0,140)||null,
  canonical:(s.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1]||null),
  h1_count:(s.match(/<h1(?:\s|>)/gi)||[]).length
 };
}
export function reviewFlags(s) {
 const a=[];
 if(/\b\d+(?:[.,]\d+)?\s*%/.test(s))a.push('percentage_requires_source');
 if(/\b\d+(?:[.,]\d+)?\s*€/.test(s))a.push('price_requires_source');
 if(/rendement garanti|sans risque|capital garanti|aucune perte/i.test(s))a.push('prohibited_claim');
 if(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(s))a.push('personal_data');
 return a;
}
async function inspect(route) {
 try {
  const res=await fetch('https://maximusscpi.com'+route,{
   signal:AbortSignal.timeout(9000),redirect:'follow',
   headers:{'User-Agent':'MaximusSCPI-Growth-QA/1.0','Accept':'text/html,application/xml,text/plain'}
  });
  const s=(await res.text()).slice(0,180000);
  return {route,status:res.status,content_type:res.headers.get('content-type'),
   ...(route==='/'||route.startsWith('/actualites/')?htmlMeta(s):{}),sample_chars:s.length};
 } catch(err) {return {route,error:err instanceof Error?err.name:'network_error'};}
}
async function collect() {
 return {observed_at:new Date().toISOString(),pages:await Promise.all(
  ['/','/actualites/wemo-one/','/robots.txt','/sitemap.xml'].map(inspect))};
}
async function generate(key,apiKey,evidence) {
 const [department,mission]=ROLES[key];
 const messages=[
  {role:'system',content:[
   'Tu es une équipe éditoriale française intervenant dans un contexte CIF réglementé.',
   'Production de BROUILLON UNIQUEMENT, sans publication ni recommandation personnalisée.',
   'Ne jamais inventer source, performance, chiffre, avantage fiscal, classement, promesse ou fait non observé.',
   'Distingue clairement les constats prouvés, propositions et éléments à vérifier.',
   'Rappelle le risque de perte en capital et de liquidité non garantie lorsque pertinent.',
   'Réponds en français avec un livrable concret de 250 à 400 mots. Aucune donnée client.',
  ].join('\n')},
  {role:'user',content:JSON.stringify({agent:key,department,mission,
   website:'https://maximusscpi.com',source_marche:'https://www.aspim.fr/scpi-en-chiffres/',
   observations:evidence,consigne:'Aucun fait non corroboré par les observations; si données absentes proposer un contrôle plutôt qu une affirmation.'})}
 ];
 const r=await fetch('https://api.deepseek.com/chat/completions',{
  method:'POST',signal:AbortSignal.timeout(40000),
  headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},
  body:JSON.stringify({model:'deepseek-v4-flash',thinking:{type:'disabled'},
   max_tokens:650,temperature:0.2,stream:false,messages})
 });
 if(!r.ok)throw Error('DeepSeek HTTP '+r.status);
 const d=await r.json(),output=d?.choices?.[0]?.message?.content;
 if(typeof output!=='string'||output.trim().length<50)throw Error('DeepSeek empty output');
 return {content:output.trim().slice(0,7000),model:d.model||'deepseek-v4-flash',
  tokens:d.usage?.total_tokens??null};
}
async function main() {
 const event=process.env.GITHUB_EVENT_NAME||'workflow_dispatch';
 const day=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Paris',weekday:'short'}).format(new Date());
 const selected=rolesFor(event,day);
 const out=path.resolve('artifacts/growth-drafts');
 fs.mkdirSync(out,{recursive:true});
 const manifest={created_at:new Date().toISOString(),event,day,selected,results:[],
  publishing_enabled:false,requires_compliance_approval:true};
 if(!selected.length) {
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));return;
 }
 const apiKey=process.env.DEEPSEEK_API_KEY;
 if(!apiKey)throw Error('DEEPSEEK_API_KEY missing; zero model calls');
 const quota=await enforceQuota();
 manifest.quota={allowed:quota.allowed,prior_reserved:quota.prior_reserved,max_daily:quota.max_daily||3,reason:quota.reason};
 if(quota.allowed<=0) {
  manifest.results.push({status:'skipped',reason:'daily_deepseek_budget_exhausted'});
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
  console.log('Daily DeepSeek budget exhausted; zero model calls');
  return;
 }
 const evidence=await collect();
 for(const role of selected.slice(0,quota.allowed)) {
  try {
   const draft=await generate(role,apiKey,evidence);
   const record={role,department:ROLES[role][0],created_at:new Date().toISOString(),
    status:'AWAITING_HUMAN_QA',public_release:false,review_flags:reviewFlags(draft.content),
    evidence,...draft};
   fs.writeFileSync(path.join(out,role+'.json'),JSON.stringify(record,null,2));
   manifest.results.push({role,status:'draft',review_flags:record.review_flags,tokens:draft.tokens});
   console.log(role+': draft stored, not published, tokens '+String(draft.tokens));
  } catch(err) {
   const message=err instanceof Error?err.message.slice(0,120):'unknown';
   manifest.results.push({role,status:'failed',error:message});
   console.error(role+': failed, no publication');
   process.exitCode=1;
  }
 }
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname)) {
 main().catch(err=>{console.error('Growth runner failed: '+(err instanceof Error?err.message:'unknown'));process.exitCode=1;});
}
