import fs from 'node:fs';
import path from 'node:path';
const dir=process.argv[2] || 'reports/industrial-20261109';
const s=JSON.parse(fs.readFileSync(path.join(dir,'snapshot.json')));
const cohort=JSON.parse(fs.readFileSync('src/data/certified_scpi_cohort.json')).slugs;
const catalog=JSON.parse(fs.readFileSync('src/data/scpi_complet.json'));
const normalize=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const rows=s.indicators.filter(i=>cohort.includes(i.scpi_slug)).sort((a,b)=>a.scpi_slug.localeCompare(b.scpi_slug)).map(i=>{
 const r=s.registry.find(r=>r.scpi_slug===i.scpi_slug);
 const b=s.t3_bulletins.find(b=>b.slug===i.scpi_slug);
 const c=catalog.find(c=>normalize(c['Nom SCPI'])===i.scpi_slug);
 return {slug:i.scpi_slug,manager:i.societe_gestion,subscription_before:i.frais_souscription,subscription_after:i.frais_souscription,management_before:i.frais_gestion,management_after:i.frais_gestion,
  static_subscription:c?.['Frais de souscription (TTC/%)']??null,static_management:c?.['Frais de gestion (HT/%)']??null,
  period_before:i.source_period,period_after:i.source_period,t3_registered:r?.last_document_period==='2026-T3',registry_status:r?.verification_status,
  t3_ingested:!!b,t3_document_status:b?.qa_status??null,t3_metrics:Object.keys(b?.extraction?.metrics||{}).length,
  t3_paginated_evidence:Object.values(b?.extraction?.evidence||{}).filter(e=>e.page>0&&e.value_match===true).length,
  blocker:i.source_period==='2026-T2'&&r?.last_document_period==='2026-T3'?(b?'field_semantic_review_and_publication_pending':'registered_bulletin_not_ingested'): 'fee_document_review_and_cross_surface_validation_pending',
  public_status_proposed:'partial',production_changed:false};
});
if(rows.length!==cohort.length||new Set(rows.map(r=>r.slug)).size!==cohort.length) throw Error('Cohort identity mismatch');
fs.writeFileSync(path.join(dir,'before-after.json'),JSON.stringify(rows,null,2)+'\n');
const esc=x=>'"'+String(x??'unknown').replaceAll('"','""')+'"';
fs.writeFileSync(path.join(dir,'before-after.csv'),Object.keys(rows[0]).map(esc).join(',')+'\n'+rows.map(r=>Object.values(r).map(esc).join(',')).join('\n')+'\n');
fs.writeFileSync(path.join(dir,'69-scpi.md'),'# État contrôlé le 9 novembre 2026\n\nAucune mutation financière ni publication effectuée. Inconnu ≠ zéro. Statut proposé ≠ statut déployé.\n\n| SCPI | Souscription base | Gestion base | Période publiée | T3 registre | T3 ingéré | Blocage |\n|---|---:|---:|---|---|---|---|\n'+rows.map(r=>`| ${r.slug} | ${r.subscription_before??'inconnu'} | ${r.management_before??'inconnu'} | ${r.period_before} | ${r.t3_registered?r.registry_status:'non'} | ${r.t3_ingested?'oui':'non'} | ${r.blocker} |`).join('\n')+'\n');
console.log(JSON.stringify({cohort:rows.length,t3_backlog:rows.filter(r=>r.period_before==='2026-T2'&&r.t3_registered).length,missing_subscription:rows.filter(r=>r.subscription_before==null).length,missing_management:rows.filter(r=>r.management_before==null).length,published_new_funds:0,measured_daily_capacity:null}));
