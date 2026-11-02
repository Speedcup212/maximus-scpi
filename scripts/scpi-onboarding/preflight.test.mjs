import test from 'node:test';
import assert from 'node:assert/strict';
import { validDate, validOfficialUrl, validateCohort, assessCandidate, assessBatch } from './preflight.mjs';

const sha = 'a'.repeat(64);
const issuer = 'https://issuer.example.com/bulletin.pdf';
const annual = 'https://issuer.example.com/2025-ra.pdf';
const proof = (period, date, url = issuer) => ({ source_url: url, source_page: 2,
  pdf_sha256: sha, reference_date: date, source_period: period });
const spec = { slug: 'test-scpi', name: 'Test SCPI', source_period: '2026-T3',
  annual_period: '2025-RA', subscription_price: 100, issuer_hosts: ['issuer.example.com'] };
const fixture = () => {
  const i = { scpi_slug: spec.slug, source_period: spec.source_period, source_url: issuer,
    prix_souscription: 100, capitalisation: 100, tof: 88,
    prix_reconstitution: 110, valeur_realisation: 90, td: 5,
    metric_provenance: {
      prix_souscription: proof('2026-T3', '2026-09-30'),
      capitalisation: proof('2026-T3', '2026-09-30'),
      tof: proof('2026-T3', '2026-09-30'),
      prix_reconstitution: proof('2026-T3', '2026-06-30'),
      valeur_realisation: proof('2026-T3', '2026-06-30'),
      td: proof('2025-RA', '2025-12-31', annual),
    } };
  return { manifest: { schema_version: 1, mode: 'new', batch_id: 'test',
    candidates: [spec] }, cohort: { count: 2, slugs: ['a', 'b'] },
    snapshot: { indicators: [i], analysis: [{
      scpi_slug: spec.slug, current_period: '2026-T3', certified_source_url: issuer,
      certification_status: 'certified', current_source_certified: true,
      comparison_certified: false, improvements: [], deteriorations: [],
    }], history: [{ scpi_slug: spec.slug, source_period: '2026-T2', source_url: issuer },
      { scpi_slug: spec.slug, source_period: '2026-T3', source_url: issuer }] },
    catalog: [{ 'Nom SCPI': 'Test SCPI', td_reference_period: '2025-RA' }] };
};
test('regression and future candidate counts are derived, never hardcoded', () => {
  assert.equal(validateCohort({ count: 68, slugs: Array.from({length: 68},(_,i)=>'fund-'+i) },
    [{slug:'new-fund'}]).expected_after, 69);
  assert.equal(validateCohort({ count: 68, slugs: Array.from({length: 68},(_,i)=>'fund-'+i) },
    [{slug:'new-fund'}, {slug:'other-fund'}]).expected_after, 70);
});
test('cohort rejects duplicate identities, mismatched count and already public new candidate', () => {
  assert.ok(validateCohort({count: 3, slugs: ['a','b']}, [spec]).errors.length);
  assert.ok(validateCohort({count: 2, slugs: ['a','a']}, [spec]).errors.length);
  assert.deepEqual(validateCohort({count: 1, slugs: ['test-scpi']}, [spec]).errors,
    ['test-scpi:ALREADY_PUBLIC']);
});
test('official URL requires HTTPS, allowed exact host and no credentials', () => {
  assert.equal(validOfficialUrl(issuer, spec.issuer_hosts), true);
  for (const url of ['http://issuer.example.com/a', 'https://issuer.example.com.evil.test/a',
    'https://not-issuer.test/a', 'https://u:p@issuer.example.com/a']) {
    assert.equal(validOfficialUrl(url, spec.issuer_hosts), false);
  }
});
test('dates reject impossible or misleading reporting dates', () => {
  assert.equal(validDate('2026-02-29'), false);
  assert.equal(validDate('2026-06-30'), true);
  assert.equal(validDate('2026-T3'), false);
});
test('source preflight passes without authorizing a release', () => {
  const result = assessBatch(fixture());
  assert.equal(result.status, 'PASS');
  assert.equal(result.publication_authorized, false);
  assert.equal(result.expected_after, 3);
});
test('detects a source SHA mismatch or missing PDF page', () => {
  const data = fixture(); delete data.snapshot.indicators[0].metric_provenance.tof.pdf_sha256;
  assert.ok(assessCandidate(spec, data.snapshot, data.catalog).errors.includes(
    'tof:SOURCE_PAGE_DATE_SHA_MISSING'));
});
test('rejects value presented as quarterly rather than dated annual fact', () => {
  const data = fixture(); data.snapshot.indicators[0].metric_provenance.td.source_period='2026-T3';
  assert.ok(assessCandidate(spec,data.snapshot,data.catalog).errors.includes(
    'td:SOURCE_PAGE_DATE_SHA_MISSING'));
});
test('keeps documented official absence distinct from extraction failure', () => {
  const data = fixture();
  data.snapshot.indicators[0].tof=null;
  data.manifest.candidates[0]={...spec,missing:{tof:{state:'OFFICIALLY_ABSENT',
    source_url:issuer,source_page:2,pdf_sha256:sha}}};
  assert.equal(assessBatch(data).status,'PASS');
  data.manifest.candidates[0].missing.tof.state='EXTRACTION_FAILED';
  assert.equal(assessBatch(data).status,'FAIL');
});
test('last official valuation requires dated issuer evidence', () => {
  const data = fixture();data.snapshot.indicators[0].prix_reconstitution=null;
  data.manifest.candidates[0]={...spec,missing:{prix_reconstitution:{
    state:'LAST_OFFICIAL_VALUE',value:110,source_url:issuer,source_page:5,
    pdf_sha256:sha,reference_date:'2026-06-30'}}};
  assert.equal(assessBatch(data).status,'PASS');
  data.manifest.candidates[0].missing.prix_reconstitution.reference_date='2026-99-99';
  assert.equal(assessBatch(data).status,'FAIL');
});
test('missing prior history warns without fabricating a trend', () => {
  const data=fixture();data.snapshot.history=[];
  const result=assessBatch(data);
  assert.equal(result.status,'PASS');
  assert.ok(result.candidates[0].warnings.includes('HISTORY_INSUFFICIENT_FOR_TREND'));
});
test('blocks uncertified comparison signals', () => {
  const data=fixture();data.snapshot.analysis[0].improvements=[{metric:'tof'}];
  assert.equal(assessBatch(data).status,'FAIL');
});
test('release analysis incompleteness is reported but never auto-approved', () => {
  const data=fixture();data.snapshot.analysis[0].certification_status='review_required';
  const result=assessBatch(data);
  assert.equal(result.status,'PASS');
  assert.equal(result.candidates[0].release_analysis_ready,false);
  assert.equal(result.publication_authorized,false);
});
