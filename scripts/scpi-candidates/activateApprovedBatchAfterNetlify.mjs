// FINAL SWITCH. This MUST run *after* complete signed private QA, candidate
// source promotion, controlled Netlify production deploy and live site validation.
// Not called by ordinary builds or agents. Never activates from mere PR status.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const ROOT=new URL('../../',import.meta.url);
const ids=['corum-eurion','corum-origin','corum-usa','corum-xl'];
const j=p=>JSON.parse(fs.readFileSync(new URL(p,ROOT),'utf8'));
const fail=x=>{throw Error('[FAIL CLOSED POSTDEPLOY] '+x)};
const required=(key)=>{const s=process.env[key];if(!s)fail('Missing private '+key);return s};
const slug=n=>String(n).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const latest=j('src/data/certified_scpi_cohort.json');
const catalog=j('src/data/scpi_complet.json');
if(ids.some(id=>!latest.slugs.includes(id)||catalog.filter(c=>slug(c['Nom SCPI'])===id).length!==1))
 fail('Release is NOT in exact public Git checkout (cohort + catalog must agree on each CORUM)');
if(latest.count!==new Set(latest.slugs).size)fail('Invalid source cohort count');
const localSha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const sha=required('EXPECTED_RELEASE_SHA');
const deployment=required('NETLIFY_DEPLOY_ID');
if(sha!==localSha||!/^[a-f0-9]{40}$/.test(sha))fail('Checked out code does not match exact release SHA');
if(!/^[a-f0-9]{24}$/.test(deployment))fail('Invalid exact Netlify deployment ID');
const siteId=required('NETLIFY_SITE_ID');
const token=required('NETLIFY_AUTH_TOKEN');
const netlifyHeaders={Authorization:'Bearer '+token,Accept:'application/json'};
const [depRes,siteRes]=await Promise.all([
 fetch('https://api.netlify.com/api/v1/deploys/'+deployment,{headers:netlifyHeaders}),
 fetch('https://api.netlify.com/api/v1/sites/'+siteId,{headers:netlifyHeaders})
]);
if(!depRes.ok||!siteRes.ok)fail('Netlify independent deploy/site verification failed');
const dep=await depRes.json(),site=await siteRes.json();
if(dep.id!==deployment||dep.site_id!==siteId||dep.state!=='ready'||!dep.published_at)
 fail('Netlify deployment is not ready/published for expected site');
if(site.published_deploy?.id!==deployment && site.published_deploy_id!==deployment)
 fail('Verified candidate deploy is not the LIVE published Netlify production version');
if(!String(dep.commit_message||'').includes(sha))
 fail('Netlify deployed source does not prove the exact GitHub release commit SHA');

const bust='?verify_commit='+sha;
const sitemapRes=await fetch('https://maximusscpi.com/sitemap.xml'+bust,{headers:{'Cache-Control':'no-cache'}});
if(!sitemapRes.ok)fail('Production sitemap unavailable');
const sitemap=await sitemapRes.text();
for(const id of ids){
 const canonical='https://maximusscpi.com/'+id+'/';
 if(!sitemap.includes('<loc>'+canonical+'</loc>'))fail('Missing production sitemap entry '+id);
 const response=await fetch(canonical+bust,{headers:{'Cache-Control':'no-cache'}});
 if(!response.ok)fail('Live product route unavailable '+id);
 const html=await response.text();
 if(!html.includes(canonical)||!/<title[ >]/i.test(html)||!/SCPI/i.test(html)||
    /<meta[^>]+noindex/i.test(html))fail('Live product canonical/content invalid '+id);
}
// At this point code + actual production site were proven. Atomic RLS switch:
const url=required('SUPABASE_URL').replace(/\/$/,'');
const key=required('SUPABASE_SERVICE_ROLE_KEY');
const result=await fetch(url+'/rest/v1/rpc/maximus_activate_candidate_after_deploy',{
 method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},
 body:JSON.stringify({p_slugs:ids,p_release_sha:sha,p_netlify_deploy_id:deployment})
});
if(!result.ok)fail('Independent final QA / DB activation denied: '+result.status+' '+(await result.text()).slice(0,500));
const activated=await result.json();
if(!Array.isArray(activated)||activated.length!==4||
   ids.some(id=>!activated.some(a=>a.activated_slug===id)))
 fail('Atomic database transition returned incorrect batch coverage');
const anon=required('SUPABASE_ANON_KEY');
const verified=await fetch(url+'/rest/v1/scpi_indicators?select=scpi_slug,prix_reconstitution&scpi_slug=in.('+ids.join(',')+')',{
 headers:{apikey:anon,Authorization:'Bearer '+anon}
});
if(!verified.ok)fail('Postactivation anon API cannot fetch published indicators');
const visible=await verified.json();
if(!Array.isArray(visible)||visible.length!==4)fail('Postactivation anon API published only '+visible.length+'/4');
console.log('POSTDEPLOY_CORUM_RELEASE_VERIFIED_4_OF_4',{
 netlify_deploy:deployment,release_sha:sha,actual_public_slugs:visible.map(v=>v.scpi_slug)
});
