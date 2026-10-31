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

test('EdR stays explicitly in pre-certification state until documented release', () => {
  assert.equal(edr.maximus_publication_status, 'pending_certification');
  assert.equal(edr.maximus_data_status, 'pending_certification');
  assert.notEqual(edr['Décote/Surcote QA'], 'publishable');
});
