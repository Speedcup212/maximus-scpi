// One authentic GitHub Actions execution + downloaded zip, not 40 editable `pass` strings.
// This gate is for a *completed private CORUM staging* run, never existing public baseline.
// Does not grant financial approval or trigger Netlify.
import {createHash} from 'node:crypto';
import {inflateRawSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';

export const CORUM=['corum-eurion','corum-origin','corum-usa','corum-xl'];
// A fund-specific test is required only where the tool consumes fund data.
// Generic calculators, sign-in guard and common contact path run ONCE each.
export const FUND_SURFACES=['seo_page','sitemap','comparateur','liquidite','simulateur_revente','score_radar'];
export const COMMON_SURFACES=['simulateur_direct','simulateur_demembrement','espace_client','parcours_souscription'];
export const SURFACES=[...FUND_SURFACES,...COMMON_SURFACES];
const REPO='Speedcup212/maximus-scpi';
const sha256=b=>createHash('sha256').update(b).digest('hex');
const hex=(s,n)=>typeof s==='string'&&new RegExp('^[0-9a-f]{'+n+'}$').test(s);
function readZipMatrix(zip){
 if(!Buffer.isBuffer(zip)||zip.length>5_000_000)throw Error('Archive GitHub absente ou excessive');
 let end=-1;
 for(let i=zip.length-22;i>=Math.max(0,zip.length-65557);i--){
  if(zip.readUInt32LE(i)===0x06054b50){end=i;break}
 }
 if(end<0)throw Error('Archive zip Actions corrompue');
 const n=zip.readUInt16LE(end+10),offset=zip.readUInt32LE(end+16);
 let p=offset;
 for(let i=0;i<n;i++){
  if(zip.readUInt32LE(p)!==0x02014b50)throw Error('Central ZIP invalide');
  const method=zip.readUInt16LE(p+10),compressed=zip.readUInt32LE(p+20);
  const uncompressed=zip.readUInt32LE(p+24);
  const nameLength=zip.readUInt16LE(p+28),extraLength=zip.readUInt16LE(p+30),
    commentLength=zip.readUInt16LE(p+32),local=zip.readUInt32LE(p+42);
  const name=zip.subarray(p+46,p+46+nameLength).toString('utf8');
  if(name==='browser-matrix.json'){
   if(uncompressed>2_000_000||compressed>2_000_000)throw Error('Rapport navigateur trop grand');
   if(zip.readUInt32LE(local)!==0x04034b50)throw Error('Local zip invalide');
   const start=local+30+zip.readUInt16LE(local+26)+zip.readUInt16LE(local+28);
   const source=zip.subarray(start,start+compressed);
   const raw=method===8?inflateRawSync(source):method===0?source:null;
   if(!raw||raw.length!==uncompressed)throw Error('Archive navigateur invalide');
   return JSON.parse(raw.toString('utf8'));
  }
  p+=46+nameLength+extraLength+commentLength;
 }
 throw Error('browser-matrix.json absent de l’artefact GitHub réel');
}
export function assertCompleteCorumMatrix(m,runId,commit){
 if(m?.kind!=='corum_private_staging_browser_matrix'||
   String(m.github_run_id)!==String(runId)||m.commit_sha!==commit)
   throw Error('Rapport navigateur non lié au vrai run/commit');
 const expected=CORUM.flatMap(slug=>FUND_SURFACES.map(surface=>slug+':'+surface))
   .concat(COMMON_SURFACES.map(surface=>'shared:'+surface));
 if(!Array.isArray(m.cases)||m.cases.length!==expected.length)
   throw Error('La campagne SCPI doit couvrir 4 x 6 consommateurs individuels + 4 parcours communs');
 const seen=new Set();
 for(const c of m.cases){
  const isFund=CORUM.includes(c.slug)&&FUND_SURFACES.includes(c.surface);
  const isShared=c.slug==='shared'&&COMMON_SURFACES.includes(c.surface);
  if((!isFund&&!isShared)||c.status!=='pass'||!c.assertions||
     typeof c.assertions!=='object'||Object.values(c.assertions).some(v=>v!==true))
    throw Error('Test réel SCPI manquant/échoué/incomplet');
  if(!Object.keys(c.assertions).length)throw Error('Aucune assertion navigateur constatée');
  const key=c.slug+':'+c.surface;
  if(seen.has(key))throw Error('Test navigateur dupliqué : '+key);
  seen.add(key);
 }
 for(const key of expected)if(!seen.has(key))throw Error('Test manquant '+key);
 if(m.candidate_scpis_verified?.length!==4||!CORUM.every(s=>m.candidate_scpis_verified.includes(s)))
   throw Error('Une ou plusieurs SCPI candidates ne sont pas vérifiées');
 return true;
}
export async function verifyCompletedCorumBrowserRun(batch,{
 fetchImpl=fetch,
 token=process.env.GITHUB_TOKEN,
 checkoutSha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()
}={}){
 if(!batch||!Number.isSafeInteger(batch.run_id)||batch.run_id<=0
   ||!hex(batch.commit_sha,40)||!hex(batch.artifact_sha256,64))
   throw Error('Une campagne navigateur authentifiée manque');
 if(!token)throw Error('GITHUB_TOKEN requis pour vérifier le run GitHub et le zip');
 if(batch.commit_sha!==checkoutSha)throw Error('Rapport navigateur établi sur un autre code que la release');
 const headers={Accept:'application/vnd.github+json',Authorization:'Bearer '+token,
   'X-GitHub-Api-Version':'2022-11-28'};
 const json=async url=>{
  const res=await fetchImpl(url,{headers});
  if(!res.ok)throw Error('GitHub API indisponible pour vérification du run : '+res.status);
  return res.json();
 };
 const base='https://api.github.com/repos/'+REPO;
 const run=await json(base+'/actions/runs/'+batch.run_id);
 if(run.status!=='completed'||run.conclusion!=='success'||
    run.head_sha!==batch.commit_sha||
    run.name!=='CORUM private staging browser acceptance'||
    run.repository?.full_name!==REPO)
   throw Error('Aucun run CORUM réel terminé avec succès au bon commit');
 const result=await json(base+'/actions/runs/'+batch.run_id+'/artifacts');
 const artifacts=(result.artifacts||[]).filter(a=>a.name==='corum-private-browser-'+batch.run_id&&!a.expired);
 if(artifacts.length!==1||!hex(artifacts[0].digest?.replace('sha256:',''),64)
   ||artifacts[0].digest!=='sha256:'+batch.artifact_sha256)
   throw Error('Artefact navigateur réel manquant ou empreinte divergente');
 const downloaded=await fetchImpl(base+'/actions/artifacts/'+artifacts[0].id+'/zip',{headers,redirect:'follow'});
 if(!downloaded.ok)throw Error('Impossible de lire le zip de preuve GitHub');
 const zip=Buffer.from(await downloaded.arrayBuffer());
 if(sha256(zip)!==batch.artifact_sha256)throw Error('ZIP altéré ou non lié au vrai run');
 const report=readZipMatrix(zip);
 assertCompleteCorumMatrix(report,batch.run_id,batch.commit_sha);
 return {verified:true,run_id:batch.run_id,commit_sha:batch.commit_sha,
   artifact_sha256:batch.artifact_sha256,checked_cases:report.cases.length};
}
