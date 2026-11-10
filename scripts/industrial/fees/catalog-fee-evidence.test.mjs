// RECOVERY-200 — non-régression des frais du catalogue public.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {selectProvenFee, isProvenNotApplicable} from '../../../src/utils/scpiFeeEvidence.mjs';

const catalog = JSON.parse(fs.readFileSync('src/data/scpi_complet.json', 'utf8'));
// Rapport de la dernière passe (10/11/2026) ; la passe du 09/11 reste contrôlée pour les retraits PRIIPs.
const report = JSON.parse(fs.readFileSync('reports/industrial-20261110/catalog-fee-reconciliation.json', 'utf8'));
const firstPass = JSON.parse(fs.readFileSync('reports/industrial-20261109/catalog-fee-reconciliation.json', 'utf8'));
const notApplicable = JSON.parse(fs.readFileSync('reports/industrial-20261110/fee-not-applicable.json', 'utf8')).funds;
const slug = name => name.replace(/œ/g, 'oe').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const bySlug = new Map(catalog.map(entry => [slug(entry['Nom SCPI']), entry]));
const FIELD = {frais_souscription: ['Frais de souscription (TTC/%)', 'TTC'], frais_gestion: ['Frais de gestion (HT/%)', 'HT']};

test('every reconciled fee is backed by a proof accepted by selectProvenFee', () => {
  const proven = report.changes.filter(change => change.after !== null);
  assert.ok(proven.length >= 40);
  for (const change of proven) {
    const entry = bySlug.get(change.slug);
    const [label, tax] = FIELD[change.metric];
    assert.equal(entry[label], change.after, `${change.slug} ${change.metric}`);
    const proof = entry.maximus_metric_provenance[change.metric];
    const selected = selectProvenFee(change.after, proof, tax, undefined);
    assert.equal(selected.applied, true, `${change.slug} ${change.metric}: ${selected.reason}`);
    assert.match(proof.evidence_text.replace(/\./g, ','), new RegExp(String(change.after === 0 ? 'souscription' : '').replace('.', ',')));
  }
});

test('legacy PRIIPs cost figures are no longer shown as management commissions', () => {
  for (const change of [...firstPass.changes, ...report.changes].filter(c => c.action === 'retrait_cout_priips')) {
    const entry = bySlug.get(change.slug);
    if (entry.maximus_metric_provenance.frais_gestion?.verification_status === 'verified' && entry['Frais de gestion (HT/%)'] !== null) continue; // remplacé depuis par une commission prouvée
    assert.equal(entry['Frais de gestion (HT/%)'], null, change.slug);
    assert.equal(entry.maximus_metric_provenance.frais_gestion.value_state, 'unknown');
  }
});

test('no unproven management fee below 3 % remains in the public catalog', () => {
  const suspicious = catalog.filter(entry => {
    const value = entry['Frais de gestion (HT/%)'];
    return typeof value === 'number' && value > 0 && value < 3 &&
      entry.maximus_metric_provenance?.frais_gestion?.verification_status !== 'verified';
  }).map(entry => entry['Nom SCPI']);
  assert.deepEqual(suspicious, []);
});

test('already certified values and prior explicit decisions are untouched', () => {
  const kept = report.conflicts.map(c => `${c.slug}:${c.metric}`).sort();
  assert.deepEqual(kept, ['acces-valeur-pierre:frais_gestion', 'accimmo-pierre:frais_souscription', 'edr-europa:frais_gestion',
    'sofidynamic:frais_gestion', 'sofidynamic:frais_souscription']);
});

test('funds whose capital variability is suspended show no subscription fee, never a zero', () => {
  assert.equal(Object.keys(notApplicable).length, 8);
  for (const [slug, proof] of Object.entries(notApplicable)) {
    const entry = bySlug.get(slug);
    assert.equal(entry['Frais de souscription (TTC/%)'], null, slug);
    const provenance = entry.maximus_metric_provenance.frais_souscription;
    assert.equal(provenance.value_state, 'not_applicable', slug);
    assert.equal(provenance.source_url, proof.source_url, slug);
    assert.equal(isProvenNotApplicable(provenance), true, slug);
    assert.equal(selectProvenFee(null, provenance, 'TTC', 9, undefined).value, null, slug);
  }
});
