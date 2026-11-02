import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const candidates = load('../../src/data/bnpp_candidates_67_68.json');
const cohort = load('../../src/data/certified_scpi_cohort.json');
const rawCatalog = load('../../src/data/scpi_complet.json');
const exportedHistory = load('../../src/data/scpiIndicatorHistory.json');

test('two source-reviewed BNP periods survive the actual public history confidence filter', () => {
  for (const candidate of candidates.candidates) {
    const rows = exportedHistory.rows.filter(r => r.scpi_slug === candidate.scpi_slug &&
      Number(r.source_confidence) >= 0.95 && !String(r.qa_status || '').startsWith('invalid'));
    assert.deepEqual(rows.map(r => r.source_period).sort(), ['2026-T2','2026-T3']);
    assert.ok(rows.every(r => r.source_url.startsWith('https://reim.bnpparibas-am.com/')));
  }
  const disputed = exportedHistory.rows.find(r => r.scpi_slug === 'acces-valeur-pierre' && r.source_period === '2026-T2');
  assert.equal(disputed.tof, null);
  assert.equal(disputed.metric_provenance.tof.qa_status, 'official_source_conflict_suppressed');
  assert.equal(disputed.metric_provenance.tof.original_t2_value, 87.07);
  assert.equal(disputed.metric_provenance.tof.retrospective_t3_value, 85.49);
});

test('BNP candidate manifest is unique and backed by official sources', () => {
  assert.equal(candidates.candidates.length, 2);
  assert.equal(candidates.target_cohort_count, 68);
  assert.equal(new Set(candidates.candidates.map(c => c.scpi_slug)).size, 2);
  for (const candidate of candidates.candidates) {
    assert.match(candidate.official_page_url, /^https:\/\/reim\.bnpparibas-am\.com\//);
    assert.match(candidate.quarterly_pdf, /^https:\/\/reim\.bnpparibas-am\.com\//);
    assert.match(candidate.quarterly_sha256, /^[a-f0-9]{64}$/);
    assert.match(candidate.annual_2025_sha256, /^[a-f0-9]{64}$/);
    assert.equal(candidate.source_period, '2026-T3');
    assert.ok(candidate.observations.length >= 10);
    assert.ok(candidate.observations.some(m => m.key === 'capitalisation' && m.value > 100));
    const value = key => candidate.observations.find(m => m.key === key)?.value;
    assert.ok(Math.abs(value('nombre_parts') * value('prix_souscription') / 1_000_000 -
      value('capitalisation')) < 0.01, candidate.scpi_slug + ': shares × price != capitalization');
    assert.equal(candidate.previous_quarter.period, '2026-T2');
    assert.ok(candidate.previous_quarter.pdf.startsWith('https://reim.bnpparibas-am.com/'));
    assert.ok(candidate.observations.some(m => m.key === 'prix_reconstitution' && m.period === '2026-06-30'));
    assert.ok(candidate.observations.every(m => m.review !== 'qa_pass'));
    const queueRatio = value('parts_attente_retrait') / value('nombre_parts') * 100;
    assert.ok(queueRatio > 0 && queueRatio < 100, candidate.scpi_slug + ': invalid withdrawal queue');
    assert.ok(candidate.observations.filter(m => m.key.startsWith('tof')).every(m => m.page === 2),
      candidate.scpi_slug + ': TOF evidence must refer to issuer bulletin, page 2');
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

test('BNP T3 shareholder counts stay unapproved until independent review', () => {
  for (const [slug, expected] of [['acces-valeur-pierre', 25864], ['accimmo-pierre', 58611]]) {
    const candidate = candidates.candidates.find(c => c.scpi_slug === slug);
    assert.ok(candidate);
    const metric = candidate.observations.find(m => m.key === 'nombre_associes');
    assert.equal(metric.value, expected);
    assert.notEqual(metric.review, 'qa_pass');
  }
});

test('both BNP T3 entries enter the cohort only after documented delegated review', () => {
  for (const candidate of candidates.candidates) {
    const rows = rawCatalog.filter(row => row['Nom SCPI'] === candidate.name);
    assert.equal(rows.length, 1, candidate.scpi_slug + ': missing or duplicate staged entry');
    const row = rows[0];
    assert.equal(row.maximus_publication_status, candidate.release_ready ? 'certified' : 'pending_certification');
    assert.equal(row.maximus_recommendation_status, 'manual_review_required');
    assert.equal(row['Période bulletin trimestriel'], '2026-T3');
    assert.equal(row.maximus_source_url, candidate.quarterly_pdf);
    assert.equal(cohort.slugs.includes(candidate.scpi_slug), candidate.release_ready);
    if (candidate.release_ready) {
      assert.equal(candidate.delegated_release.actor, 'codex-automation-delegated-release');
      assert.equal(candidate.delegated_release.human_signature, false);
      assert.match(candidate.delegated_release.dossier_sha256, /^[a-f0-9]{64}$/);
      assert.equal(row.maximus_certification.review_dossier_sha256, candidate.delegated_release.dossier_sha256);
    }
  }
});

test('both issuer-valued and source-dated cards are coherent for 68-fund preview', () => {
  assert.equal(candidates.technical_audit.fields_verified, 47);
  assert.equal(candidates.technical_audit.allocations_verified, 14);
  assert.equal(candidates.technical_audit.human_signed_off, false);
  for (const candidate of candidates.candidates) {
    const row = rawCatalog.find(r => r['Nom SCPI'] === candidate.name);
    assert.ok(row);
    assert.equal(row['Label ISR'], 'Oui');
    assert.equal(row['SFDR'], 'Article 8');
    const sector = Object.values(row['Répartition Sectorielle JSON']).reduce((a,b)=>a+Number(b),0);
    const geography = Object.values(row['Répartition Géographique JSON']).reduce((a,b)=>a+Number(b),0);
    assert.ok(Math.abs(sector - 100) < 1e-8, candidate.scpi_slug+' sectors not 100%');
    assert.ok(Math.abs(geography - 100) < 1e-8, candidate.scpi_slug+' geography not 100%');
    assert.match(row['Répartition Sectorielle'], /Bureaux/);
    assert.equal(row.maximus_valeur_realisation_reference_date, '2026-06-30');
    assert.equal(row.maximus_walb_reference_date, '2026-09-30');
    assert.equal(row.maximus_prix_retrait_source_url, candidate.quarterly_pdf);
    assert.equal(row.maximus_publication_status, candidate.release_ready ? 'certified' : 'pending_certification');
    assert.ok(row['Surcote/décote (%)'] > 0);
    assert.ok(row.maximus_metric_provenance.prix_reconstitution);
  }
  const ap = rawCatalog.find(r => r['Nom SCPI'] === 'Accimmo Pierre');
  assert.ok(ap.maximus_prix_retrait_definition.includes('98,50'));
  assert.ok(ap.maximus_prix_retrait_definition.includes('128,41'));
  assert.equal(ap['Répartition Géographique JSON']['Autres'], 0.1);
  assert.equal(ap['Répartition Géographique JSON']['Autres pays'], undefined);
});
