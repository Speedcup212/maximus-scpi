// The only supported candidate -> public catalog promotion path.
// NO files are modified without both private Supabase release authorization and
// 100%-complete, evidenced data/surface contract. No Netlify deploy.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {auditSnapshot,assertIntegrationTopology} from './auditCorumE2e.mjs';
import {verifyCompletedCorumBrowserRun} from './verifyCorumBrowserEvidence.mjs';
import {buildPrivateReleaseInput} from './buildCurrentCorumReleaseInput.mjs';
import {assertOfficial2026Valuation,official2026ValuationAnnouncementUrl} from './issuerValuationEvidence.mjs';
import {assertExactGeography} from './officialAllocationParity.mjs';
import {assertCanonicalFinancialEvidence} from './officialFinancialParity.mjs';
import {assertPrimaryTieredFeeSource,assertTieredFeesMatchIndependentLedger} from './officialTieredFeeEvidence.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const get=(file)=>JSON.parse(fs.readFileSync(path.join(ROOT,file),'utf8'));
const slug=(name)=>String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const annual=(c,m)=>Number(c.evidence.find(e=>e.period==='2025-RA'&&e.metric===m&&e.qa==='qa_pass')?.value);
const quarter=(c,m)=>Number(c.evidence.find(e=>e.period==='2026-T2'&&e.metric===m&&e.qa==='qa_pass')?.value);
const num=(value,key,allowZero=false)=>{
 if(typeof value!=='number'||!Number.isFinite(value)||(allowZero?value<0:value<=0))
   throw Error('Missing verified numeric field: '+key);
 return value;
};
const allocation=(record,key)=>{
 if(!record||typeof record!=='object'||Array.isArray(record)||!Object.keys(record).length)
  throw Error('Missing verified allocation: '+key);
 const total=Object.values(record).reduce((sum,n)=>sum+num(n,key,true),0);
 if(Math.abs(total-100)>1)throw Error('Allocation must total 100%: '+key+' '+total);
 return record;
};
const sourceHint=(c,field)=>{
 if(field==='reconstitution_value')return assertOfficial2026Valuation(c);
 // This set is checked against the PRIVATE ledger's authoritative fields by
 // the live batch clearance. A publisher HTML claim is not a PDF page.
 const derived=new Set(['creation_year','management_fees','liquidity_basis','sfdr',
   'sector_class','geographic_scope','payment_frequency','risk_warnings','label_isr']);
 if(c.release_ready===true&&derived.has(field)&&
    c.private_registry_provenance?.source_period==='2026-T2'&&
    c.private_registry_provenance?.status==='DRAFT_ONLY_NEVER_AUTOMATICALLY_CERTIFY')
   return;
 if(!c.publishing_sources||!/^https:\/\//.test(c.publishing_sources[field]?.url||'')
   ||!(Number(c.publishing_sources[field]?.page)>0)
   ||!(/^[a-f0-9]{64}$/.test(c.publishing_sources[field]?.sha256||'')))
  throw Error('Missing current official PDF evidence for: '+c.scpi_slug+':'+field);
};
// Preserve source-backed geographic fee tiers; never fabricate a blended percentage.
function validatedManagementFees(c) {
 const fees=c.publishing_fields?.management_fees;
 if(typeof fees==='number')return {flat:num(fees,'management_fees',true),detail:null};
 if(!fees||fees.kind!=='geographic_tiers'||fees.basis!=='HT'||
    fees.revenue_basis!=='loyers encaissés'||fees.blended_rate!==null)
  throw Error('Missing or ambiguous management fee structure: '+c.scpi_slug);
 const euro=num(fees.euro_zone_percent,'euro_zone_percent');
 const outside=num(fees.outside_euro_zone_percent,'outside_euro_zone_percent');
 if(euro>=100||outside>=100||fees.source_period!=='2026-T2')
  throw Error('Inconsistent geographic fee tiers: '+c.scpi_slug);
 return assertPrimaryTieredFeeSource(c);
}

function rowFromCandidate(c) {
 const x=c.publishing_fields||{};
 const managementFees=validatedManagementFees(c);
 const risky=['creation_year','minimum_investment','subscription_fees','management_fees',
  'reconstitution_value','risk_sri','liquidity_basis',
  'enjoyment_delay','sector_allocation','geographic_allocation','sfdr',
  'capitalization_m','sector_class','geographic_scope','label_isr',
  'payment_frequency','risk_warnings','recommended_holding_years'];
 for(const field of risky)sourceHint(c,field);
 const price=quarter(c,'prix_souscription'), parts=quarter(c,'nombre_parts');
 const cap=num(x.capitalization_m,'capitalization_m');
 if(Math.abs(parts*price/1e6-cap)/cap>0.02)
   throw Error('Capitalisation conflicts with parts x current subscription price for '+c.scpi_slug);
 const sectors=allocation(x.sector_allocation,'sector_allocation'),
       geography=allocation(x.geographic_allocation,'geographic_allocation');
 const period='T2 2026';
 const wait=quarter(c,'parts_attente_retrait');
 if(wait<0||wait>parts)throw Error('Invalid waiting shares');
 if(!['withdrawal_queue','secondary_market_order_book'].includes(x.liquidity_basis))
   throw Error('Liquidity regime unqualified');
 if(!Number.isInteger(x.risk_sri)||x.risk_sri<1||x.risk_sri>7)
   throw Error('DIC SRI invalid');
 if(x.risk_sri!==c.regulatory_metrics?.find(e=>e.metric==='risk_sri'&&e.qa==='qa_pass')?.value)
   throw Error('DIC risk mismatch');
 if(x.recommended_holding_years!==c.regulatory_metrics?.find(e=>e.metric==='recommended_holding_years')?.value)
   throw Error('DIC holding period mismatch');
 // Contractual withdrawal clauses are NOT a mandatory marketing-card field.
 // Keep the source-backed mechanism and withdrawal queue, plus explicit non-guarantee.
 if(!x.risk_warnings?.some(w=>typeof w==='string'&&/liquidit|retrait|revente/i.test(w)))
   throw Error('Liquidity risk warnings from issuer note missing');
 if(typeof x.label_isr!=='boolean')throw Error('Unknown ISR label');
 if(!Array.isArray(x.risk_warnings)||x.risk_warnings.length<1||
   x.risk_warnings.some(w=>typeof w!=='string'||w.length<24))
   throw Error('Missing documented risk warnings');
 if(!['Mensuelle','Trimestrielle'].includes(x.payment_frequency))
   throw Error('Unverified income frequency');
 if(!['Article 6','Article 8','Article 9'].includes(x.sfdr))
   throw Error('SFDR classification not verified');
 return {
  'Nom SCPI':c.name,'Société de gestion':c.management_company,
  'Année de création':num(x.creation_year,'creation_year'),
  'Capitalisation (M€)':cap,
  'Prix de souscription (€)':price,
  'Valeur de reconstitution par part (€)':num(x.reconstitution_value,'reconstitution_value'),
  // The 2025 appraisal and T2 2026 price have different dates.
  'Décote/Surcote QA':'manual_review',
  'Taux de distribution (%)':annual(c,'taux_distribution'),
  'Distribution (€/part)':annual(c,'distribution_brute_par_part'),
  'Endettement (%)':annual(c,'endettement_pct'),
  'TOF (%)':quarter(c,'tof'),'Nombre de parts':parts,
  'Parts en attente de retrait':wait,
  'Minimum de souscription €':num(x.minimum_investment,'minimum_investment'),
  'Frais de souscription (TTC/%)':num(x.subscription_fees,'subscription_fees',true),
  'Frais de gestion (HT/%)':managementFees.flat,
  'Frais de gestion (détail)':managementFees.detail,
  'Délai de jouissance (mois)':num(x.enjoyment_delay,'enjoyment_delay',true),
  'Durée de détention recommandée (ans)':num(x.recommended_holding_years,'recommended_holding_years'),
  'Versement des loyers':x.payment_frequency,
  'Répartition Sectorielle JSON':sectors,
  'Répartition Géographique JSON':geography,
  'Label ISR':x.label_isr===true?'Oui':'Non',
  'SFDR':x.sfdr,
  'Profil_de_risque':{SRRI:x.risk_sri,Echelle:'1-7',Source:'DIC officiel',Verification:'qa_pass'},
  'liquidite':(x.liquidity_basis==='withdrawal_queue'
       ? 'Demandes de retrait selon les modalités de la société de gestion.'
       : 'Revente sur marché secondaire selon les ordres disponibles.')
      +' Au '+period+' : '+wait+' parts en attente selon le bulletin officiel. '
      +'Aucun rachat, délai de revente ou prix de cession n’est garanti. '
      +'Consulter la note d’information officielle avant de souscrire.',
  'liquidity_basis':x.liquidity_basis,
  'Nombre d’associés':quarter(c,'nombre_associes')||undefined,
  'Période bulletin trimestriel':period,'Date bulletin':'30/06/2026',
  'maximus_data_status':'certified_and_final_reviewed',
  'maximus_source_periode':'TD et dette : année 2025 ; données courantes : T2 2026',
  'maximus_source_document':'Rapport annuel 2025 et Bulletin T2 2026 CORUM; DIC officiel',
  'maximus_warnings':[
    'Risque de perte en capital et de liquidité. Durée recommandée : 10 ans.',
    ...x.risk_warnings
  ],
  'maximus_lifecycle_status':'normal'
 };
}
async function liveApproval(candidates) {
 const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!/^https:\/\//.test(url||'')||!key||key.length<30)
   throw Error('Service-role authorization required; no anon key fallback');
 const response=await fetch(url+'/rest/v1/rpc/maximus_candidate_release_clearance',{
  method:'POST',
  headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},
  body:JSON.stringify({p_slugs:candidates.map(x=>x.scpi_slug)})
 });
 // A finance-only signature is insufficient: verify the six REAL tool streams
 // for the exact same SCPI slug before modifying the public catalog.
 const allTools=await fetch(url+'/rest/v1/rpc/maximus_candidate_tool_clearance',{
  method:'POST',
  headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},
  body:JSON.stringify({p_slugs:candidates.map(x=>x.scpi_slug)})
 });
 if(!allTools.ok)throw Error('Live tool-parity clearance HTTP '+allTools.status);
 const actualTools=await allTools.json();
 if(!Array.isArray(actualTools)||actualTools.length!==candidates.length)
  throw Error('Live tool coverage mismatch');
 for(const candidate of candidates){
  const t=actualTools.find(x=>x.scpi_slug===candidate.scpi_slug);
  if(!t||!t.full_surface_ready||!t.catalog_and_simulator_ready||
    !t.comparator_radar_ready||!t.client_card_ready||!t.analysis_ready||
    !t.trajectory_ready||!t.liquidity_ready)
   throw Error('Iroko Atlas feature parity incomplete (SEO/comparator/analysis/radar/trajectory/client/liquidity) for '+candidate.scpi_slug);
 }
 // Never publish 31 Dec 2025 valuation as at 30 June 2026.
 // A source-only JSON claim is insufficient: check exact live source and row.
 const slugList=candidates.map(c=>c.scpi_slug).join(',');
 const apiHeaders={apikey:key,Authorization:'Bearer '+key};
 const liveValuesRequest=await fetch(url+'/rest/v1/scpi_indicators?select=scpi_slug,source_period,prix_reconstitution,repartition_geographique,annee_creation,versement_loyers,sfdr,label_isr,srri,frais_souscription,frais_gestion&scpi_slug=in.('+slugList+')',{headers:apiHeaders});
 const liveEvidenceRequest=await fetch(url+'/rest/v1/scpi_metric_certifications?select=scpi_slug,source_period,metric,value_numeric,source_url,verification_status&source_period=eq.2026-T2&metric=eq.valeur_reconstitution_par_part&scpi_slug=in.('+slugList+')',{headers:apiHeaders});
 if(!liveValuesRequest.ok||!liveEvidenceRequest.ok)
  throw Error('Exact official 2026 valuation cannot be verified in live Supabase');
 const liveValues=await liveValuesRequest.json(),liveEvidence=await liveEvidenceRequest.json();
 for(const candidate of candidates){
  const expected=assertOfficial2026Valuation(candidate);
  if(!Array.isArray(liveValues)||!liveValues.some(r=>r.scpi_slug===candidate.scpi_slug&&r.source_period==='2026-T2'&&Number(r.prix_reconstitution)===expected))
   throw Error('2026 valuation mismatch in canonical SCPI indicator: '+candidate.scpi_slug);
  const canonical=liveValues.find(r=>r.scpi_slug===candidate.scpi_slug);
  assertExactGeography(candidate,canonical);
  const display=candidate.publishing_fields;
  const expectedDisplay={
    annee_creation:display.creation_year,
    versement_loyers:display.payment_frequency==='Mensuelle'?'Mensuel':display.payment_frequency,
    sfdr:display.sfdr,
    label_isr:display.label_isr,
    srri:display.risk_sri,
    frais_souscription:display.subscription_fees,
    frais_gestion:typeof display.management_fees==='number'?display.management_fees:null
  };
  for(const [field,wanted] of Object.entries(expectedDisplay)){
    if(canonical?.[field]!==wanted)
      throw Error('Current Supabase issuer or financial field diverged: '
        +candidate.scpi_slug+':'+field);
  }
  if(!Array.isArray(liveEvidence)||!liveEvidence.some(r=>r.scpi_slug===candidate.scpi_slug&&Number(r.value_numeric)===expected&&r.source_url===official2026ValuationAnnouncementUrl&&r.verification_status==='official_issuer_statement_verified'))
   throw Error('Official 2026 Q2 valuation missing independently verified DB provenance: '+candidate.scpi_slug);
 }
 // A QA_PASS tag inside a staging JSON file is not a financial certification.
 // Compare EVERY published financial value, date, issuer URL and PDF page with
 // the independent DB certification, not only the displayed reconstitution.
 const certifiedResponse=await fetch(
  url+'/rest/v1/scpi_metric_certifications?select=scpi_slug,source_period,metric,value_numeric,source_url,source_page,verification_status&scpi_slug=in.('+slugList+')',
  {headers:apiHeaders});
 if(!certifiedResponse.ok)throw Error('Independent financial metric ledger unavailable');
 const certified=await certifiedResponse.json();
 if(!Array.isArray(certified))throw Error('Invalid independent metric ledger response');
 for(const candidate of candidates){
  assertCanonicalFinancialEvidence(candidate,certified);
  assertTieredFeesMatchIndependentLedger(candidate,certified);
 }
 if(!response.ok)throw Error('Live release authorization HTTP '+response.status);
 const live=await response.json();
 if(!Array.isArray(live)||live.length!==candidates.length)throw Error('Live release coverage mismatch');
 for(const candidate of candidates) {
  const row=live.find(x=>x.scpi_slug===candidate.scpi_slug);
  // Candidate lifecycle constraints *forbid* public/analysis flags until
  // AFTER the Netlify production artifact is proven and postdeploy activated.
  // Private release readiness comes from the independently signed
  // candidate_final_release_v1 + complete surface tool clearance above.
  if(!row||!row.release_ready||!row.live_indicators_ok||!row.liquidity_ok)
   throw Error('Fail-closed: private final financial/client/liquidity gate incomplete for '+candidate.scpi_slug);
  if(row.publication_authorized!==false||row.analysis_certified!==false)
   throw Error('Candidate marked publicly activated before source release: '+candidate.scpi_slug);
 }
}
const preview=buildPrivateReleaseInput(
 get('data-import/corum_candidates_prepublication_20261015.json'),
 get('data-import/corum_private_browser_fixture_20261017.json'));
// A single responsible batch signoff is read LIVE from Supabase. No cached
// release_ready flag can pass a local QA gate or infer professional approval.
const isApply=process.argv.includes('--apply');
if(isApply) {
 await liveApproval(preview.scpi);
 for(const candidate of preview.scpi)candidate.release_ready=true;
}
// A real browser staging run must match the exact checked-out git SHA and
// provide the ZIP SHA256 digest; the verifier downloads the GitHub artifact.
const batch=isApply?{
 run_id:Number(process.env.CORUM_BROWSER_RUN_ID),
 commit_sha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 artifact_sha256:process.env.CORUM_BROWSER_ARTIFACT_SHA256
}:null;
const verifiedBrowserBatch=isApply?
 (await verifyCompletedCorumBrowserRun(batch)).verified:false;
const report=auditSnapshot(preview,{verifiedBrowserBatch});
assertIntegrationTopology();
const blockers=report.filter(x=>!x.ready);
console.log('[CORUM] canonical private source review',
 JSON.stringify(report.map(x=>({slug:x.slug,ready:x.ready,blockers:x.blockers}))));
if(!isApply){
 console.log('[CORUM] dry-run only: 61 public SCPI preserved; no release.');
 process.exit(0);
}
if(blockers.length)throw Error('Cannot release CORUM: source and browser QA incomplete');
const catalogPath=path.join(ROOT,'src/data/scpi_complet.json'),
 cohortPath=path.join(ROOT,'src/data/certified_scpi_cohort.json');
const catalog=JSON.parse(fs.readFileSync(catalogPath,'utf8'));
const cohort=JSON.parse(fs.readFileSync(cohortPath,'utf8'));
const slugs=new Set(cohort.slugs);
const existing=new Set(catalog.map(x=>slug(x['Nom SCPI'])));
for(const c of preview.scpi) {
 if(slugs.has(c.scpi_slug)||existing.has(c.scpi_slug))
  throw Error('Duplicate or partially released CORUM: '+c.scpi_slug);
}
const records=preview.scpi.map(rowFromCandidate);
for(const c of preview.scpi)slugs.add(c.scpi_slug);
const newCatalog=[...catalog,...records];
const newCohort={...cohort,count:slugs.size,slugs:[...slugs].sort()};
if(newCatalog.filter(x=>slugs.has(slug(x['Nom SCPI']))).length!==slugs.size)
 throw Error('Sitemap/runtime cohort consistency check failed');
const nextCatalog=JSON.stringify(newCatalog,null,2)+'\n';
const nextCohort=JSON.stringify(newCohort,null,2)+'\n';
// Both changes must be committed and tested together in the same release PR.
// No deployment is initiated by this command.
fs.writeFileSync(catalogPath,nextCatalog);
fs.writeFileSync(cohortPath,nextCohort);
console.log('[CORUM] 4 certified SCPI staged into PUBLIC SOURCE for PR, no Netlify deployment.');
