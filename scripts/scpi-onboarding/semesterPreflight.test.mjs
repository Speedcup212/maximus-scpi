import test from 'node:test';
import assert from 'node:assert/strict';
import { assessBatch } from './preflight.mjs';
import { reportingPeriodEnd, reconcileDatedValues } from './datedEvidence.mjs';

// Synthetic proof fixtures: no claim about an actual issuer or certified SCPI.
const sha = 'a'.repeat(64);
const issuerUrl = 'https://issuer.example/bulletin-S1-2026.pdf';
const annualUrl = 'https://issuer.example/rapport-2025.pdf';
const slug = 'test-semestrielle';
const proof = (value, field, period = '2026-S1', date = '2026-06-30', url = issuerUrl) => ({
  source_url: url, source_page: 4, pdf_sha256: sha,
  source_period: period, reference_date: date, value_numeric: value, metric: field,
});

function fixture() {
  const indicator = {
    scpi_slug: slug, source_period: '2026-S1', source_url: issuerUrl,
    prix_souscription: 200, capitalisation: 50, tof: 95,
    prix_reconstitution: 230, valeur_realisation: 190, td: 5,
    metric_provenance: {
      prix_souscription: proof(200, 'prix_souscription'),
      capitalisation: proof(50, 'capitalisation'),
      tof: proof(95, 'tof'),
      prix_reconstitution: proof(230, 'prix_reconstitution'),
      valeur_realisation: proof(190, 'valeur_realisation'),
      td: proof(5, 'td', '2025-RA', '2025-12-31', annualUrl),
    },
  };
  return {
    manifest: {
      schema_version: 1, batch_id: 'synthetic-semester', mode: 'new',
      candidates: [{
        slug, name: 'Test Semestrielle', issuer_hosts: ['issuer.example'],
        source_period: '2026-S1', annual_period: '2025-RA',
        subscription_price: 200, missing: {},
      }],
    },
    cohort: { slugs: ['existing-scpi'], count: 1 },
    catalog: [{ 'Nom SCPI': 'Test Semestrielle', td_reference_period: '2025-RA' }],
    snapshot: {
      indicators: [indicator],
      analysis: [{
        scpi_slug: slug, current_period: '2026-S1',
        certified_source_url: issuerUrl, current_source_certified: true,
        certification_status: 'certified', comparison_certified: false,
        improvements: [], deteriorations: [],
      }],
      history: [{
        scpi_slug: slug, source_period: '2025-S2', source_url: annualUrl,
      }],
    },
  };
}

test('real semester boundaries are not converted into quarterly dates', () => {
  assert.equal(reportingPeriodEnd('2026-S1'), '2026-06-30');
  assert.equal(reportingPeriodEnd('2026-S2'), '2026-12-31');
  assert.equal(reportingPeriodEnd('2026-S3'), null);
  assert.equal(reportingPeriodEnd('2026-T2'), '2026-06-30');
});

test('a fully sourced synthetic semiannual candidate passes structural source preflight without publication authority', () => {
  const result = assessBatch(fixture());
  assert.equal(result.status, 'PASS', JSON.stringify(result.errors));
  assert.equal(result.candidates[0].dated_valuation.status, 'PASS');
  assert.equal(result.candidates[0].dated_valuation.fields.prix_reconstitution.status, 'OFFICIAL_AT_SEMESTER_END');
  assert.equal(result.publication_authorized, false);
});

test('an older official valuation carried in the semiannual bulletin is labelled historical, not fabricated as current', () => {
  const input = fixture();
  input.snapshot.indicators[0].metric_provenance.prix_reconstitution.reference_date = '2025-12-31';
  const result = assessBatch(input);
  assert.equal(result.status, 'PASS', JSON.stringify(result.candidates[0].errors));
  assert.equal(result.candidates[0].dated_valuation.fields.prix_reconstitution.status, 'LAST_OFFICIAL_VALUE');
  assert.equal(result.candidates[0].dated_valuation.fields.prix_reconstitution.reference_date, '2025-12-31');
  assert.equal(result.publication_authorized, false);
});

test('future valuation and impossible invented semester remain blocked', () => {
  const future = fixture();
  future.snapshot.indicators[0].metric_provenance.prix_reconstitution.reference_date = '2026-07-01';
  const result = assessBatch(future);
  assert.equal(result.status, 'FAIL');
  assert.ok(result.candidates[0].errors.includes('prix_reconstitution:FUTURE_VALUATION_DATE'));
  assert.equal(result.candidates[0].dated_valuation.status, 'FAIL');

  const invalid = fixture();
  invalid.manifest.candidates[0].source_period = '2026-S3';
  assert.ok(assessBatch(invalid).candidates[0].errors.includes('MANIFEST_PERIOD_INVALID'));
});

test('direct historical reconciliation supports semiannual history and does not grant publication', () => {
  const input = fixture();
  const indicator = input.snapshot.indicators[0];
  const result = reconcileDatedValues(indicator, input.snapshot.history, { issuer_hosts: ['issuer.example'] });
  assert.equal(result.status, 'PASS');
  assert.equal(result.publication_authorized, false);
});
