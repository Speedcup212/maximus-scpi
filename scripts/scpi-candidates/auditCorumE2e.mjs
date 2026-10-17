// MaximusSCPI — one product, every surface. No deployment or production write.
// Source is the restricted/prepublication QA evidence snapshot.
// Public visibility requires a separate FINAL review and synced public catalog.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {hasOfficial2026Valuation} from './issuerValuationEvidence.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const CANDIDATES=['corum-eurion','corum-origin','corum-usa','corum-xl'];
const METRICS_ANNUAL=['taux_distribution','distribution_brute_par_part','endettement_pct'];
const METRICS_QUARTER=['prix_souscription','tof','nombre_parts','parts_attente_retrait','distribution_brute_par_part'];
const REG_DOCS=['dic_url','note_information_url','statutes_url','annual_report_url','bulletin_url'];
// Browser QA is one real CI run. Six fund consumers are tested PER SCPI;
// generic calculators/authorization/contact only ONCE. No editable pass tags.
import {FUND_SURFACES,COMMON_SURFACES} from './verifyCorumBrowserEvidence.mjs';
export const REQUIRED_CORUM_BROWSER_SURFACES=Object.freeze({
 per_fund:[...FUND_SURFACES],shared:[...COMMON_SURFACES]
});
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

export function auditCandidate(candidate,{verifiedBrowserBatch=false}={}) {
  const failures=[];
  const unique=new Set();
  const metrics=Array.isArray(candidate.evidence)?candidate.evidence:[];
  const docs=Array.isArray(candidate.pdfs)?candidate.pdfs:[];
  const metric=(period,key)=>metrics.find(e=>{
    const matchingDoc=docs.find(d=>d.period===period&&d.url===e.source &&
      /^[a-f0-9]{64}$/.test(d.sha256||'') &&
      Number.isInteger(Number(d.pages)) && Number(d.pages)>0);
    return e.period===period && e.metric===key && e.qa==='qa_pass' &&
      typeof e.value==='number' && Number.isFinite(e.value) &&
      typeof e.unit==='string' && e.unit.length>0 &&
      matchingDoc && Number.isInteger(Number(e.page)) &&
      Number(e.page)>0 && Number(e.page)<=Number(matchingDoc.pages);
  });
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
  const regDocs=Array.isArray(candidate.regulatory_documents)?candidate.regulatory_documents:[];
  for(const [kind,key] of [['dic','dic_url'],['note','note_information_url'],['statutes','statutes_url']]){
    checked(regDocs.some(d=>d.kind===kind&&d.url===candidate[key]&&
      /^[a-f0-9]{64}$/.test(d.sha256||'')&&d.pages>0),'reglementaire_empreinte_absente:'+kind);
  }
  const dic=regDocs.find(x=>x.kind==='dic');
  for(const metric of ['risk_sri','recommended_holding_years']){
    const proof=candidate.regulatory_metrics?.find(x=>x.metric===metric&&x.qa==='qa_pass'&&
      x.sha256===dic?.sha256&&x.source===dic?.url&&x.page>0);
    checked(!!proof,'dic_risque_non_verifie:'+metric);
    checked(candidate.publishing_fields?.[metric]===proof?.value,
      'dic_provenance_incoherente:'+metric);
  }
  // Static source evidence is NOT an authorization to publish.
  checked(candidate.release_ready===true,'validation_finale_non_obtenue');
  // CRASH-15: pre-release stage and post-deploy activation are different states.
  // The public/analysis flags MUST be false while this PRIVATE snapshot is reviewed.
  // liveApproval() also requires both false; only post-Netlify activation flips them.
  checked(candidate.publication_authorized===false,'activation_publique_prematuree');
  checked(candidate.analysis_certified===false,'analyse_publique_prematuree');
  // Unknown fields must not silently become 0 or an optimistic description.
  const essentials=[
    'creation_year','minimum_investment','subscription_fees','management_fees',
    'reconstitution_value','risk_sri','recommended_holding_years','liquidity_basis',
    'enjoyment_delay','sector_allocation','geographic_allocation',
    'sfdr','capitalization_m','sector_class','geographic_scope','payment_frequency',
    'risk_warnings','label_isr'
  ];
  // Distinct geographical management rates must never be collapsed into one scalar.
  const fee=candidate.publishing_fields?.management_fees;
  if(fee?.kind==='geographic_tiers'){
    checked(fee.basis==='HT'&&fee.blended_rate===null,'frais_gestion_taux_moyen_invente');
    checked(fee.euro_zone_percent>0&&fee.outside_euro_zone_percent>0&&
      fee.euro_zone_percent<100&&fee.outside_euro_zone_percent<100,
      'frais_gestion_tiers_invalides');
    checked(candidate.publishing_sources?.management_fees?.page>0&&
      /^[a-f0-9]{64}$/.test(candidate.publishing_sources?.management_fees?.sha256||''),
      'frais_gestion_tiers_source_absente');
  }
  for(const field of essentials){
    const v=candidate.publishing_fields?.[field];
    checked(v!==undefined&&v!==null&&v!==''&&
      (typeof v!=='number'||Number.isFinite(v))&&
      (!Array.isArray(v)||v.length>0),'champ_affichage_non_qualifie:'+field);
  }
  for(const field of essentials)checked(
    (field==='reconstitution_value' && hasOfficial2026Valuation(candidate)) ||
    (field!=='reconstitution_value' &&
    /^[a-f0-9]{64}$/.test(candidate.publishing_sources?.[field]?.sha256||'') &&
    /^https:\/\//.test(candidate.publishing_sources?.[field]?.url||'') &&
    Number(candidate.publishing_sources?.[field]?.page)>0),
    'preuve_affichage_absente:'+field);
  // Never treat user-editable strings such as status: "pass" / GitHub-looking URLs
  // as an attested browser execution. Promotion must first verify the GitHub run
  // AND artifact, then supply this independently verified decision.
  checked(verifiedBrowserBatch===true,'campagne_navigateur_non_verifiee');
  // The long contractual withdrawal clause is OPTIONAL for a descriptive fiche:
  // source-backed capital/liquidity mechanism + exact queued shares + risk warning
  // remain compulsory; no guaranteed withdrawal date can be stated.
  const warnings=candidate.publishing_fields?.risk_warnings;
  checked(Array.isArray(warnings)&&warnings.some(x=>typeof x==='string' &&
    /liquidit|retrait|revente/i.test(x)), 'avertissement_liquidite_manquant');
  checked(['withdrawal_queue','secondary_market_order_book']
    .includes(candidate.publishing_fields?.liquidity_basis), 'regime_liquidite_non_qualifie');
  const dup=metrics.filter(e=>{const id=e.period+':'+e.metric;if(unique.has(id))return true;unique.add(id);return false});
  checked(dup.length===0,'indicateurs_dupliques');
  return {slug:candidate.scpi_slug,ready:failures.length===0,checked_metrics:metrics.length,
    checked_documents:docs.length,blockers:failures};
}
export function auditSnapshot(snapshot,{verifiedBrowserBatch=false}={}) {
  if(snapshot?.status!=='private_staging_non_published')throw Error('Only a private, unpublished snapshot may be audited');
  if(!Array.isArray(snapshot.scpi)||snapshot.scpi.length!==4||
    new Set(snapshot.scpi.map(s=>s.scpi_slug)).size!==4)throw Error('Four distinct CORUM SCPI required');
  return snapshot.scpi.map(c=>auditCandidate(c,{verifiedBrowserBatch}));
}
// One pure release-switch invariant for the 61-fund baseline AND future 65-fund release.
// Tests must not hard-code "CORUM must be unpublished" or "exactly 61" forever.
export function assertPublicReleaseConsistency(cohort, catalog, candidates=CANDIDATES) {
  if(!cohort||!Array.isArray(cohort.slugs)||!Array.isArray(catalog))
    throw Error('Invalid public source artifacts');
  const slugs=new Set(cohort.slugs);
  if(slugs.size!==cohort.slugs.length || cohort.count!==slugs.size)
    throw Error('Public cohort duplicates or count drift');
  const catalogNames=catalog.map(s=>nameSlug(s['Nom SCPI']));
  const publicNames=new Set(catalogNames);
  for(const slug of candidates){
    if(slugs.has(slug)!==publicNames.has(slug))
      throw Error('Partial publication (sitemap vs. product catalog): '+slug);
    if(catalogNames.filter(name=>name===slug).length>1)
      throw Error('Duplicate public product row: '+slug);
  }
  const released=candidates.filter(slug=>slugs.has(slug));
  if(released.length!==0 && released.length!==candidates.length)
    throw Error('Partially released CORUM batch: '+released.join(','));
  return {cohort:slugs.size,released_count:released.length,
    candidate_state:released.length===0?'private':'all_released'};
}
export function assertIntegrationTopology() {
  for(const relative of EXPECTED_TOOLS){
    if(!fs.existsSync(path.join(ROOT,relative)))throw Error('Required site tool absent: '+relative);
  }
  const result=assertPublicReleaseConsistency(
    readJson('src/data/certified_scpi_cohort.json'),
    readJson('src/data/scpi_complet.json'));
  return {surfaces:EXPECTED_TOOLS.length,...result};
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
