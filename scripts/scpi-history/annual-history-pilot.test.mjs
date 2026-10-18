import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const snapshot = JSON.parse(readFileSync(new URL('../../src/data/scpiAnnualHistory.json',import.meta.url),'utf8'));
const data = snapshot.rows || [];
const cov = snapshot.coverage || [];
const eurion = data.filter(r=>r.scpi_slug==='corum-eurion').sort((a,b)=>a.fiscal_year-b.fiscal_year);

test('EURION : exercice de création à 2025 sans trou ni extrapolation', () => {
  assert.deepEqual(eurion.map(r=>r.fiscal_year),[2020,2021,2022,2023,2024,2025]);
  const coverage = cov.find(r=>r.scpi_slug==='corum-eurion');
  assert.equal(coverage?.core_historical_ready,true);
  assert.equal(coverage?.years_expected,6);
  assert.equal(coverage?.years_fully_verified,6);
  assert.equal(coverage?.metrics_missing,0);
});
test('Preuve PDF et base documentée exigées pour chaque mesure publiée', () => {
  const unique = new Set();
  for(const r of data){
    const k=r.scpi_slug+':'+r.fiscal_year;
    assert.equal(unique.has(k),false,k+' dupliqué');
    unique.add(k);
    assert.match(r.source_url,/^https:\/\//);
    assert.ok(Number.isInteger(r.fiscal_year));
    for(const name of ['distribution_totale_par_part','valeur_realisation_par_part','valeur_reconstitution_par_part'])
      assert.ok(Number.isFinite(r[name]),k+'/'+name+' valeur absente');
    for(const name of ['distribution','realisation','reconstitution'])
      assert.ok(r.evidence_pages?.[name]>0,k+'/'+name+' source absente');
  }
});
test('Rendement annualisé de lancement correctement signalé', () => {
  assert.ok(eurion[0].distribution_basis.includes('annualized_inception'));
  assert.equal(eurion[0].distribution_totale_par_part,20.79);
  assert.equal(eurion[0].valeur_realisation_par_part,172.55);
  assert.equal(eurion[0].valeur_reconstitution_par_part,209.74);
});
test('Pas de rétrogradation du 2026-T2 vers les valeurs 2025',()=>{
  const origin2025=data.find(r=>r.scpi_slug==='corum-origin'&&r.fiscal_year===2025);
  assert.equal(origin2025?.valeur_reconstitution_par_part,1175.66);
  assert.equal(origin2025?.valeur_realisation_par_part,959.47);
  const origin2024=data.find(r=>r.scpi_slug==='corum-origin'&&r.fiscal_year===2024);
  assert.equal(origin2024?.valeur_reconstitution_par_part,1172.41);
});
