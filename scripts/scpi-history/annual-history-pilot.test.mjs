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


test('Archives CORUM : séries XL 2017–2021 et Origin 2020–2022, sans interpolation', () => {
  assert.ok(data.filter(r=>r.scpi_slug.startsWith('corum-')).length >= 21);
  const xl = data.filter(r=>r.scpi_slug==='corum-xl').sort((a,b)=>a.fiscal_year-b.fiscal_year);
  for (const year of [2017,2018,2019,2020,2021,2023,2024,2025]) assert.ok(xl.some(r=>r.fiscal_year===year));
  assert.equal(xl.find(r=>r.fiscal_year===2017)?.valeur_reconstitution_par_part,192.17);
  assert.equal(xl.find(r=>r.fiscal_year===2021)?.valeur_reconstitution_par_part,199.25);
  const origin = data.filter(r=>r.scpi_slug==='corum-origin').sort((a,b)=>a.fiscal_year-b.fiscal_year);
  for (const year of [2020,2021,2022,2023,2024,2025]) assert.ok(origin.some(r=>r.fiscal_year===year));
  assert.equal(origin.find(r=>r.fiscal_year===2021)?.valeur_realisation_par_part,962.66);
  const origin2019=origin.find(r=>r.fiscal_year===2019);
  assert.equal(origin2019?.distribution_totale_par_part,67.88);
  assert.equal(origin2019?.valeur_realisation_par_part,935.49);
  assert.equal(origin2019?.valeur_reconstitution_par_part,1133.51);
  assert.match(origin2019?.distribution_arbitration||'',/67,53/);
  assert.match(origin2019?.distribution_arbitration||'',/67,88/);
  assert.match(origin2019?.source_url||'',/2019/);
  assert.ok(cov.find(r=>r.scpi_slug==='corum-origin')?.years_fully_verified >= 6);
  assert.ok(cov.find(r=>r.scpi_slug==='corum-xl')?.years_fully_verified >= 8);
});


test('Noyau annuel CORUM : 30 exercices et 90 mesures distinctes avec leurs preuves', () => {
  const expected={
    'corum-origin': Array.from({length:14},(_,i)=>2012+i),
    'corum-xl':Array.from({length:9},(_,i)=>2017+i),
    'corum-eurion':Array.from({length:6},(_,i)=>2020+i),
    'corum-usa':[2025],
  };
  let n=0;
  for(const [slug,years] of Object.entries(expected)){
    const actual=data.filter(r=>r.scpi_slug===slug).map(r=>r.fiscal_year).sort((a,b)=>a-b);
    assert.deepEqual(actual,years,'Missing year: '+slug);
    n+=actual.length;
    const c=cov.find(r=>r.scpi_slug===slug);
    assert.equal(c?.years_expected,years.length);
    assert.equal(c?.years_fully_verified,years.length);
    assert.equal(c?.core_historical_ready,true);
    assert.equal(c?.metrics_missing,0);
  }
  assert.equal(n,30);
});
test('Date de création et premier exercice de CORUM USA restent distincts', () => {
  const usa=cov.find(r=>r.scpi_slug==='corum-usa');
  assert.equal(usa?.launch_year,2024);
  assert.equal(usa?.first_fiscal_year,2025);
  assert.match(usa?.first_fiscal_year_note||'',/15 mois/);
  assert.equal(data.filter(r=>r.scpi_slug==='corum-usa').length,1);
  assert.equal(data.find(r=>r.scpi_slug==='corum-usa'&&r.fiscal_year===2024),undefined);
});
test('Origin 2012 et XL 2017 : exercice partiel réel et non montant annualisé fictif', () => {
  const o=data.find(r=>r.scpi_slug==='corum-origin'&&r.fiscal_year===2012);
  const x=data.find(r=>r.scpi_slug==='corum-xl'&&r.fiscal_year===2017);
  assert.match(o?.distribution_basis||'',/partial/);
  assert.match(x?.distribution_basis||'',/partial/);
  assert.equal(o?.distribution_totale_par_part,40.05);
  assert.equal(x?.distribution_totale_par_part,9.13);
});
