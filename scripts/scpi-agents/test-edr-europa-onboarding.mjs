import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const catalog = load('../../src/data/scpi_complet.json');
const cohort = load('../../src/data/certified_scpi_cohort.json');
const slug = name => String(name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const selected = catalog.filter(item => cohort.slugs.includes(slug(item['Nom SCPI'])));
const edr = selected.find(item => slug(item['Nom SCPI']) === 'edr-europa');
const officialBulletin = 'https://edr-europa.com/wp-content/uploads/2026/07/SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T2-2026.pdf';
const officialNotice = 'https://edr-europa.com/wp-content/uploads/2026/07/SCPI-EdR-Europa-Note-dinformation-06-2026.pdf';

test('66 unique active catalog names, with all four CORUM still present', () => {
  assert.equal(cohort.count, 66);
  assert.equal(cohort.slugs.length, 66);
  assert.equal(new Set(cohort.slugs).size, 66);
  assert.equal(selected.length, 66);
  assert.equal(new Set(selected.map(item => slug(item['Nom SCPI']))).size, 66);
  for (const name of ['corum-origin','corum-xl','corum-usa','corum-eurion']) {
    assert.ok(cohort.slugs.includes(name), name);
  }
});

test('EdR Europa canonical identity, min subscription and VAT fee semantics', () => {
  assert.ok(edr, 'EdR Europa absent');
  assert.equal(edr['Nom SCPI'], 'EdR Europa');
  assert.equal(edr['Prix de souscription (€)'], 202);
  assert.equal(edr['Nombre minimum de parts'], 25);
  assert.equal(edr['Minimum de souscription €'], 5050);
  assert.equal(edr['Frais de souscription (TTC/%)'], 12);
  assert.equal(edr['Frais de gestion (HT/%)'], 10.5);
  assert.equal(edr['Frais de gestion (TTC/%)'], 12.6);
});

test('EdR provenance is official and distinct fiscal / quarterly periods', () => {
  assert.equal(edr['Période bulletin trimestriel'], '2026-T2');
  assert.equal(edr['maximus_source_url'], officialBulletin);
  assert.equal(edr.td_reference_period, '2025');
  assert.equal(edr['Taux de distribution (%)'], 8.75);
  assert.equal(edr['TOF (%)'], 100);
  assert.equal(edr.maximus_metric_provenance.tof.source_url, officialBulletin);
  assert.equal(edr.maximus_metric_provenance.minimum_souscription.source_url, officialNotice);
  assert.equal(edr.maximus_metric_provenance.prix_reconstitution.reference_date, '2026-06-30');
  assert.equal(edr['Décote/Surcote QA'], 'manual_review');
});

test('EdR publisher data is certified and catalog-visible while advice remains manual', () => {
  assert.equal(edr.maximus_publication_status, 'certified');
  assert.equal(edr.maximus_recommendation_status,'manual_review_required');
  assert.equal(edr.maximus_data_status, 'current_and_history_certified');
  assert.equal(edr.maximus_certification.current_source_certified,true);
  assert.equal(edr.maximus_certification.historical_comparison_certified,true);
  assert.equal(edr.maximus_certification.release_ready,true);
  assert.equal(edr.maximus_certification.checked_official_field_values,23);
  assert.equal(edr.maximus_certification.checked_annual_report_values,26);
  assert.equal(edr.maximus_certification.checked_notice_fields,8);
  assert.equal(edr.maximus_certification.checked_price_gap_fields,1);
  assert.equal(edr.maximus_certification.total_verified_field_certificates,70);
  assert.equal(edr.maximus_certification.checked_t1_field_values,13);
  assert.equal(edr.maximus_certification.notice_issuer_pdf_sha256,'abab3708fc0240a16390e55714b0866666e3cc65b3d45bcaf3f59a00a495acea');
  assert.equal(edr['Surcote/décote (%)'],-5.07);
  assert.notEqual(edr['Décote/Surcote QA'], 'publishable');
});

const history = load('../../src/data/edr_europa_history_provisional.json');

test('EdR quarterly dividends are reconciled with official retrospective chart and 2025 TD', () => {
  const expected = [
    ['2024-T4',4.59],['2025-T1',4.03],['2025-T2',4.04],
    ['2025-T3',4.21],['2025-T4',5.21],['2026-T1',4.33],['2026-T2',4.69]
  ];
  assert.deepEqual(history.historical_dividends.map(row => [row.period,row.value]),expected);
  assert.equal(history.source_page,3);
  assert.equal(history.source_url,officialBulletin);
  assert.equal(history.state,'source_pdf_sha256_verified_pending_final_field_qa');
  assert.equal(history.source_sha256,'401987ac4d713eb30253a3d327b76b723c73753f72b5b31e28ffcd504f737d7d');
  const annual2025 = history.historical_dividends.filter(row => row.period.startsWith('2025-')).reduce((sum,row) => sum + Math.round(row.value*100),0);
  assert.equal(annual2025,1749);
  assert.equal(Math.round(annual2025 * 10000 / 20000) / 100,8.75); // integer cents, half-up to 2 decimal %
  assert.equal(history.historical_dividends.find(row => row.period==='2026-T2').value,edr['Distribution (€/part)']);
});
