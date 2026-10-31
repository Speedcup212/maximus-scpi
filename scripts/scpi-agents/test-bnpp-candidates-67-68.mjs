import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const candidates = load('../../src/data/bnpp_candidates_67_68.json');
const cohort = load('../../src/data/certified_scpi_cohort.json');

test('BNP candidate manifest is unique and backed by official sources', () => {
  assert.equal(candidates.candidates.length, 2);
  assert.equal(candidates.target_cohort_count, 68);
  assert.equal(new Set(candidates.candidates.map(c => c.scpi_slug)).size, 2);
  for (const candidate of candidates.candidates) {
    assert.match(candidate.official_page_url, /^https:\/\/reim\.bnpparibas-am\.com\//);
    assert.match(candidate.quarterly_pdf, /^https:\/\/reim\.bnpparibas-am\.com\//);
    assert.match(candidate.quarterly_sha256, /^[a-f0-9]{64}$/);
    assert.match(candidate.annual_2025_sha256, /^[a-f0-9]{64}$/);
    assert.equal(candidate.source_period, '2026-T2');
    assert.ok(candidate.observations.length >= 10);
    assert.ok(candidate.observations.some(m => m.key === 'capitalisation' && m.value > 100));
    for (const item of candidate.observations) {
      assert.equal(typeof item.value, 'number');
      assert.ok(Number.isFinite(item.value));
      assert.ok(item.page >= 1);
      assert.ok(item.period);
      assert.ok(item.review);
    }
  }
});

test('uncertified candidates cannot silently enter the public certified cohort', () => {
  for (const candidate of candidates.candidates) {
    if (cohort.slugs.includes(candidate.scpi_slug)) {
      assert.equal(candidate.release_ready, true,
        candidate.scpi_slug + ': require final QA before including in the certified cohort');
    }
  }
  assert.equal(new Set(cohort.slugs).size, cohort.count);
});

test('repaired T2 shareholder counts cannot inherit the invalid QA_PASS', () => {
  for (const [slug, expected] of [['acces-valeur-pierre', 25746], ['accimmo-pierre', 59576]]) {
    const candidate = candidates.candidates.find(c => c.scpi_slug === slug);
    assert.ok(candidate);
    const metric = candidate.observations.find(m => m.key === 'nombre_associes');
    assert.equal(metric.value, expected);
    assert.notEqual(metric.review, 'qa_pass');
  }
});
