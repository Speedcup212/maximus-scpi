// Private-only Sofidynamic (candidate 69) browser contract.
// The public catalog and cohort are restored before the CI job ends.
// No public-release or financial QA flags are changed.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(fileURLToPath(new URL('../../',import.meta.url)));
const catalogFile=path.join(ROOT,'src/data/scpi_complet.json');
const cohortFile=path.join(ROOT,'src/data/certified_scpi_cohort.json');
const source=fs.readFileSync(catalogFile,'utf8');
const originalCohort=fs.readFileSync(cohortFile,'utf8');
const newRow=JSON.parse(fs.readFileSync(path.join(ROOT,'scripts/scpi-onboarding/fixtures/sofidynamic-69-browser-catalog-row.json'),'utf8'));
const fixture=JSON.parse(fs.readFileSync(path.join(ROOT,'scripts/scpi-onboarding/fixtures/sofidynamic-69-browser-snapshot.json'),'utf8'));
const cohort=JSON.parse(originalCohort);
const data=JSON.parse(source);
if(cohort.count!==68||cohort.slugs.includes('sofidynamic')||
   data.some(x=>x['Nom SCPI']==='Sofidynamic')||
   newRow.maximus_publication_status!=='pending_certification'||
   fixture.indicators.length!==1||fixture.analysis.length!==1||fixture.history.length!==2||
   fixture.indicators[0].source_period!=='2026-T2'||
   fixture.analysis[0].comparison_certified!==false||
   fixture.analysis[0].current_source_certified!==true){
 throw new Error('PRIVATE_PREVIEW_SOURCE_DATA_NOT_READY_OR_ALREADY_PUBLIC');
}
data.push(newRow);
let child;
try {
 fs.writeFileSync(catalogFile,JSON.stringify(data,null,2)+'\n','utf8');
 child=spawnSync(process.execPath,['scripts/scpi-onboarding/browser.mjs'],
     {cwd:ROOT,env:{...process.env,SCPI_ONBOARDING_MANIFEST:'scripts/scpi-onboarding/fixtures/sofidynamic-69-browser-manifest.json'},
       stdio:'inherit',timeout:180000});
 if(child.error)throw child.error;
 if(child.status!==0)throw new Error('SOFIDYNAMIC_PRIVATE_BROWSER_FAILED:'+(child.status??'signal'));
} finally {
 fs.writeFileSync(catalogFile,source,'utf8');
 if(fs.readFileSync(cohortFile,'utf8')!==originalCohort) {
   fs.writeFileSync(cohortFile,originalCohort,'utf8');
   throw new Error('BROWSER_DIRTY_PUBLIC_COHORT_ROLLBACK_APPLIED');
 }
}
if(fs.readFileSync(catalogFile,'utf8')!==source) throw new Error('PUBLIC_CATALOG_NOT_RESTORED');
console.log('SOFIDYNAMIC_PRIVATE_BROWSER_69_ONLY_PASS_PUBLIC_COHORT_68_UNCHANGED');
