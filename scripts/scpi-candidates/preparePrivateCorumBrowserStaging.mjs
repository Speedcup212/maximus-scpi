// CI-ONLY PREVIEW: overlay four NOT-RELEASED publisher-sourced CORUM candidate rows
// in the *ephemeral runner checkout*; NEVER commit an altered public cohort/catalog.
// Financial/legal approval remains separate. This checks rendering/consumer wiring.
import fs from 'node:fs';
import path from 'node:path';

if(process.env.GITHUB_ACTIONS!=='true' ||
   process.env.CORUM_PRIVATE_BROWSER_FIXTURE!=='enabled')
 throw Error('Private staging overlay may run only in explicit GitHub Actions preview');
const root=path.resolve('.');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const draft=read('data-import/corum_private_browser_fixture_20261017.json');
const original=read('data-import/corum_candidates_prepublication_20261015.json');
const catalogPath=path.join(root,'src/data/scpi_complet.json'),
 cohortPath=path.join(root,'src/data/certified_scpi_cohort.json');
const catalog=read('src/data/scpi_complet.json'),cohort=read('src/data/certified_scpi_cohort.json');
const slugs=['corum-eurion','corum-origin','corum-usa','corum-xl'];
const OFFICIAL_TIER_PROOFS={
 'corum-usa':{
  source_url:'https://www.corum.fr/sites/default/files/2025-01/CORUM%20USA%20-%20FR3%20-%20Statuts%20-%2020250125.pdf',
  source_page:9,
  source_sha256:'bd2877f8ed8ffe075752a07479b7ba36e6ceae1c9cb48ea656fdc91095178fb5'
 },
 'corum-xl':{
  source_url:'https://www.corum.fr/sites/default/files/2026-07/CORUM%20XL%20-%20Fil%20d%27Actualit%C3%A9s%202026-T2%202%20%281%29.pdf',
  source_page:11,
  source_sha256:'fbac6a2efac56bc75bd90f4548656a7bdff86ab22f6d81e0a3c715e21cd819cd'
 }
};
// Test-only proof identities independently checked against the official issuer
// source registry. Never copy a proof from one fund into another.

const slug=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const value=(a,period,metric)=>{
 const found=a.evidence?.filter(x=>x.period===period&&x.metric===metric&&x.qa==='qa_pass');
 if(found?.length!==1||!Number.isFinite(found[0].value))
  throw Error('Not source-verified: '+a.scpi_slug+':'+period+':'+metric);
 return found[0].value;
};
if(!draft.not_approved||!draft.not_for_production||draft.scpi?.length!==4||
   original.scpi?.length!==4||cohort.count!==61||cohort.slugs.length!==61||
   draft.source!=='maximus_agents.scpi_candidate_publication_draft_v1')
 throw Error('Private preview fixture/source sanity failed');
if(slugs.some(x=>cohort.slugs.includes(x)) ||
   catalog.some(x=>slugs.includes(slug(x['Nom SCPI']))))
 throw Error('Candidate already in public catalogue, staging overlay forbidden');
const rows=[];
for(const scpiSlug of slugs){
 const d=draft.scpi.find(x=>x.scpi_slug===scpiSlug);
 const a=original.scpi.find(x=>x.scpi_slug===scpiSlug);
 if(!a||!d||d.populated_field_count!==18||d.final_release_approved!==false||
    d.unresolved_field_keys?.join(',')!=='withdrawal_terms')
  throw Error('Unapproved candidate not properly attributed: '+scpiSlug);
 const x=d.publishing_fields;
 if(x.risk_sri!==a.publishing_fields.risk_sri||
    x.reconstitution_value!==a.publishing_fields.reconstitution_value ||
    x.frais_souscription!==undefined)
  throw Error('Private draft risk/valuation conflict: '+scpiSlug);
 if(!Array.isArray(x.risk_warnings)||!x.risk_warnings.some(t=>/liquidit/i.test(t))||
    !['withdrawal_queue','secondary_market_order_book'].includes(x.liquidity_basis))
  throw Error('No source-backed liquidity mechanism / warnings');
 const fee=typeof x.management_fees==='number'?x.management_fees:null;
 const fees=x.management_fees&&typeof x.management_fees==='object'?x.management_fees:null;
 const proof=OFFICIAL_TIER_PROOFS[scpiSlug];
 if(fees && (fees.kind!=='geographic_tiers'||fees.basis!=='HT'||
   fees.source_period!=='2026-T2'||!proof||
   fees.euro_zone_percent!==12.4||fees.outside_euro_zone_percent!==15.9))
   throw Error('Geographic fee tiers cannot be shown without exact publisher ledger match: '+scpiSlug);
 const detailedFees=fees?{...fees,...proof}:null;
 if(!Number.isFinite(value(a,'2026-T2','prix_souscription'))||
    value(a,'2026-T2','prix_souscription')!==a.publishing_fields.minimum_investment)
  throw Error('Preview does not have an exact source price');
 const originGeo=Object.entries(x.geographic_allocation).sort((a,b)=>a[0].localeCompare(b[0]));
 const snapGeo=Object.entries(a.publishing_fields.geographic_allocation).sort((a,b)=>a[0].localeCompare(b[0]));
 if(JSON.stringify(originGeo)!==JSON.stringify(snapGeo))
  throw Error('Source geography reconciliation changed: '+scpiSlug);
 rows.push({
   'Nom SCPI':d.nom,
   'Société de gestion':'CORUM Asset Management',
   'Année de création':x.creation_year,
   'Capitalisation (M€)':x.capitalization_m,
   'Taux de distribution (%)':value(a,'2025-RA','taux_distribution'),
   'td_reference_period':d.provenance.annual_yield_reference,
   'td_reference_url':a.evidence.find(e=>e.period==='2025-RA'&&e.metric==='taux_distribution')?.source,
   'Endettement (%)':value(a,'2025-RA','endettement_pct'),
   'debt_reference_period':d.provenance.annual_debt_reference,
   'debt_reference_url':a.evidence.find(e=>e.period==='2025-RA'&&e.metric==='endettement_pct')?.source,
   'TOF (%)':value(a,'2026-T2','tof'),
   'Prix de souscription (€)':value(a,'2026-T2','prix_souscription'),
   'Valeur de reconstitution par part (€)':x.reconstitution_value,
   'Nombre de parts':value(a,'2026-T2','nombre_parts'),
   'Parts en attente de retrait':value(a,'2026-T2','parts_attente_retrait'),
   'Minimum de souscription €':x.minimum_investment,
   'Frais de souscription (TTC/%)':x.subscription_fees,
   'Frais de gestion (HT/%)':fee,
   'Frais de gestion (détail)':detailedFees,
   'Délai de jouissance (mois)':x.enjoyment_delay,
   'Durée de détention recommandée (ans)':x.recommended_holding_years,
   'Versement des loyers':x.payment_frequency,
   'Répartition Sectorielle JSON':x.sector_allocation,
   'Répartition Géographique JSON':x.geographic_allocation,
   'Label ISR':x.label_isr?'Oui':'Non',
   'SFDR':x.sfdr,
   'Profil_de_risque':{SRRI:x.risk_sri,Echelle:'1-7',Source:'DIC officiel'},
   'liquidity_basis':x.liquidity_basis,
   'liquidite':'Les retraits ne sont pas garantis. Au T2 2026 : '+
      value(a,'2026-T2','parts_attente_retrait')+
      ' parts en attente selon le bulletin officiel. Consultez la note d’information.',
   'maximus_warnings':x.risk_warnings,
   'maximus_data_status':'PRIVATE_BROWSER_PREVIEW_NOT_CERTIFIED',
   'maximus_source_periode':'TD/endettement 2025 ; bulletin T2 2026',
   'maximus_source_document':'CORUM RA 2025 / bulletin T2 2026 / DIC et note officiels',
   'Période bulletin trimestriel':'T2 2026',
   'Date bulletin':'30/06/2026',
 });
}
const updated=[...catalog,...rows];
const newSlugs=[...cohort.slugs,...slugs];
if(new Set(newSlugs).size!==65||updated.length!==catalog.length+4)
 throw Error('Private preview would cause duplicates or partial cohort');
fs.writeFileSync(catalogPath,JSON.stringify(updated,null,2)+'\n');
fs.writeFileSync(cohortPath,JSON.stringify({count:65,slugs:newSlugs},null,2)+'\n');
console.log('PRIVATE_CORUM_STAGING_ONLY',JSON.stringify({
 candidates:slugs,public_base_untouched_outside_CI:true,
 intent:'UI_TEST_NOT_RELEASE_NOT_FINANCIAL_APPROVAL'
}));
