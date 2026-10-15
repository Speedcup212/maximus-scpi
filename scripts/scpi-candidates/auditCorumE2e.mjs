// MaximusSCPI — one product, every surface. No deployment or production write.
// Source is the restricted/prepublication QA evidence snapshot.
// Public visibility requires a separate FINAL review and synced public catalog.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const CANDIDATES=['corum-eurion','corum-origin','corum-usa','corum-xl'];
const METRICS_ANNUAL=['taux_distribution','distribution_brute_par_part','endettement_pct'];
const METRICS_QUARTER=['prix_souscription','tof','nombre_parts','parts_attente_retrait','distribution_brute_par_part'];
const REG_DOCS=['dic_url','note_information_url','statutes_url','annual_report_url','bulletin_url'];
const UI_SURFACES=['seo_page','sitemap','comparateur','liquidite','simulateur_direct','simulateur_revente',
  'simulateur_demembrement','score_radar','espace_client','parcours_souscription'];
const EXPECTED_TOOLS=[
 'src/utils/buildScpiLandingData.ts',
 'scripts/generateOptimizedStaticPages.js',
 'scripts/generateSitemapFromDB.ts',
 'src/components/fintech/FintechComparator.tsx',
 'src/components/ScpiSecondaryMarketSimulator.tsx',
 'src/components/ScpiDirectIncomeSimulator.tsx',
 'src/components/ScpiDemembrementSimulator.tsx',
 'src/components/trajectory/ScpiTrajectoryPanel.tsx',
 'src/app/components/ClientScpiCard.tsx',
 'src/App.tsx',
 'src/data/scpiData.ts',
 'src/data/scpiDataExtended.ts',
];
const readJson=(relative)=>JSON.parse(fs.readFileSync(path.join(ROOT,relative),'utf8'));
const nameSlug=(v)=>String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export function auditCandidate(candidate) {
  const failures=[];
  const unique=new Set();
  const metrics=Array.isArray(candidate.evidence)?candidate.evidence:[];
  const docs=Array.isArray(candidate.pdfs)?candidate.pdfs:[];
  const metric=(period,key)=>metrics.find(e=>e.period===period&&e.metric===key&&e.qa==='qa_pass'
    &&Number.isFinite(Number(e.value))&&e.page>0&&/^https:\/\//.test(e.source||''));
  const checked=(predicate,msg)=>{if(!predicate)failures.push(msg)};
  checked(CANDIDATES.includes(candidate.scpi_slug),'hors_lot_corum');
  checked(nameSlug(candidate.name)===candidate.scpi_slug,'identite_slug');
  checked(candidate.management_company==='CORUM Asset Management','societe_gestion_non_verifiee');
  for(const period of ['2025-RA','2026-T2']){
    checked(docs.some(d=>d.period===period&&/^[a-f0-9]{64}$/.test(d.sha256||'')
      &&d.pages>0&&/^https:\/\//.test(d.url||'')),'document_empreinte_manquant:'+period);
  }
  for(const key of METRICS_ANNUAL)checked(!!metric('2025-RA',key),'annual_non_verifie:'+key);
  for(const key of METRICS_QUARTER)checked(!!metric('2026-T2',key),'t2_non_verifie:'+key);
  const queued=metric('2026-T2','parts_attente_retrait');
  const partcount=metric('2026-T2','nombre_parts');
  if(queued&&partcount)checked(Number(queued.value)>=0&&Number(queued.value)<=Number(partcount.value),'liquidite_incoherente');
  for(const key of REG_DOCS)checked(/^https:\/\//.test(candidate[key]||''),'reglementaire_absent:'+key);
  // Static source evidence is NOT an authorization to publish.
  checked(candidate.release_ready===true,'validation_finale_non_obtenue');
  checked(candidate.publication_authorized===true,'autorisation_publication_absente');
  checked(candidate.analysis_certified===true,'analyse_globale_non_certifiee');
  // Unknown fields must not silently become 0 or an optimistic description.
  const essentials=[
    'creation_year','minimum_investment','subscription_fees','management_fees',
    'reconstitution_value','risk_sri','liquidity_basis','withdrawal_terms',
    'enjoyment_delay','sector_allocation','geographic_allocation','sfdr'
  ];
  for(const field of essentials){
    const v=candidate.publishing_fields?.[field];
    checked(v!==undefined&&v!==null&&v!==''&&
      (typeof v!=='number'||Number.isFinite(v))&&
      (!Array.isArray(v)||v.length>0),'champ_affichage_non_qualifie:'+field);
  }
  for(const k of UI_SURFACES)checked(candidate.surface_tests?.[k]==='pass','parcours_non_teste:'+k);
  const dup=metrics.filter(e=>{const id=e.period+':'+e.metric;if(unique.has(id))return true;unique.add(id);return false});
  checked(dup.length===0,'indicateurs_dupliques');
  return {slug:candidate.scpi_slug,ready:failures.length===0,checked_metrics:metrics.length,
    checked_documents:docs.length,blockers:failures};
}
export function auditSnapshot(snapshot) {
  if(snapshot?.status!=='private_staging_non_published')throw Error('Only a private, unpublished snapshot may be audited');
  if(!Array.isArray(snapshot.scpi)||snapshot.scpi.length!==4||
    new Set(snapshot.scpi.map(s=>s.scpi_slug)).size!==4)throw Error('Four distinct CORUM SCPI required');
  return snapshot.scpi.map(auditCandidate);
}
export function assertIntegrationTopology() {
  for(const relative of EXPECTED_TOOLS){
    if(!fs.existsSync(path.join(ROOT,relative)))throw Error('Required site tool absent: '+relative);
  }
  const publicCohort=readJson('src/data/certified_scpi_cohort.json');
  const publicSlugs=new Set(publicCohort.slugs||[]);
  const publicCatalog=readJson('src/data/scpi_complet.json');
  const publicNames=new Set(publicCatalog.map(s=>nameSlug(s['Nom SCPI'])));
  // Fail-closed: public cohort and physical source catalog must agree.
  for(const slug of CANDIDATES) {
    if(publicSlugs.has(slug)!==publicNames.has(slug))
      throw Error('Partial publication (sitemap vs. product catalog): '+slug);
  }
  if(publicCohort.count!==publicSlugs.size)throw Error('Public cohort count drift');
  return {surfaces:EXPECTED_TOOLS.length,cohort:publicSlugs.size};
}
const invoked=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked){
  try{
    const report=auditSnapshot(readJson('data-import/corum_candidates_prepublication_20261015.json'));
    const topology=assertIntegrationTopology();
    const ready=report.filter(r=>r.ready);
    console.log(JSON.stringify({status:ready.length===4?'READY':'BLOCKED_UNTIL_COMPLETE',topology,scpi:report},null,2));
    if(process.argv.includes('--require-release')&&ready.length!==4)process.exitCode=1;
  }catch(e){console.error('[CORUM integration audit]',e);process.exitCode=1}
}
