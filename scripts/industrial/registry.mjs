import fs from 'node:fs';
import {normalizeAlias,resolveAlias} from './admission.mjs';
const dir=process.argv[2]||'reports/industrial-20261109';
const input=JSON.parse(fs.readFileSync(`${dir}/registry-input.json`));
const funds=input.source_registry.map(r=>{
 const connector=input.connectors.find(c=>c.scpi_slug===r.scpi_slug);
 return {id:r.scpi_slug,name:r.scpi_name,manager_id:normalizeAlias(r.management_company),manager_name:r.management_company,
  aliases:input.aliases.filter(a=>a.scpi_slug===r.scpi_slug),connector:connector||null,
  source:r.official_scpi_page_url,admission:['identity','official_source','extraction','field_quality','publication','production'].map(step=>({step,status:'not_assessed'}))};
});
if(new Set(funds.map(f=>f.id)).size!==funds.length)throw Error('Duplicate fund identity');
const collisions=input.aliases.filter(a=>resolveAlias(a.alias,input.aliases,'2026-11-09').status==='ambiguous');
const managers=[...new Set(funds.map(f=>f.manager_id))].sort().map(id=>({id,names:[...new Set(funds.filter(f=>f.manager_id===id).map(f=>f.manager_name))],funds:funds.filter(f=>f.manager_id===id).map(f=>f.id)}));
const result={as_of:'2026-11-09',target:225,registered_funds:funds.length,unregistered_target:Math.max(0,225-funds.length),managers,alias_collisions:collisions,funds,publication_authorized:false};
fs.writeFileSync(`${dir}/canonical-registry.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({funds:funds.length,managers:managers.length,alias_collisions:collisions.length,connected:funds.filter(f=>f.connector?.enabled).length}));
