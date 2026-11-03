// Execute a candidate browser suite using an ephemeral catalog row.
 // The published JSON is never committed or modified beyond this isolated CI job.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const manifestPath='scripts/scpi-onboarding/fixtures/sofidynamic-69-browser-manifest.json';
const catalogPath='src/data/scpi_complet.json';
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
assert.equal(manifest.batch_id,'sofidynamic-69-private-ui');
assert.equal(manifest.candidates.length,1);
const row=JSON.parse(fs.readFileSync(manifest.catalog_row_file,'utf8'));
assert.equal(row['Nom SCPI'],manifest.candidates[0].name);
assert.equal(row['Prix de souscription (€)'],manifest.candidates[0].subscription_price);
assert.equal(row.maximus_publication_status,'pending_certification');
const original=fs.readFileSync(catalogPath,'utf8');
const existing=JSON.parse(original);
assert.ok(Array.isArray(existing));
assert.ok(!existing.some(e=>e['Nom SCPI']===row['Nom SCPI']));
let result;
try {
 fs.writeFileSync(catalogPath,JSON.stringify([...existing,row],null,2)+'\n');
 result=spawnSync(process.execPath,['scripts/scpi-onboarding/browser.mjs'],{
   env:{...process.env,SCPI_ONBOARDING_MANIFEST:manifestPath},
   stdio:'inherit',timeout:240000
 });
} finally {
 fs.writeFileSync(catalogPath,original);
}
if(result.error) throw result.error;
if(result.signal) throw Error('Private browser interrupted: '+result.signal);
process.exitCode=result.status===0?0:1;
