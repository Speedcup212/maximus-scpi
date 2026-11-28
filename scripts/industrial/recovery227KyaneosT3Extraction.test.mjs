// RECOVERY-227 — la correction d'extraction Kyaneos 2026-T3 doit rester vraie
// sur l'octet officiel, et la proposition SQL ne doit rien certifier.
// Lecture seule : le PDF de preuve est un artefact hors dépôt.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {extractFromText} from '../../scpi-ingestion/src/extractor.ts';

const SQL = 'scripts/industrial/sql/recovery227_kyaneos_t3_stale_extraction_quarantine.sql';
const sql = fs.readFileSync(SQL, 'utf8');

// Valeurs publiées page 4 du bulletin officiel 3T 2026 (SHA-256 4def42a5…),
// relues par MuPDF et Poppler.
const PDF = process.env.KYANEOS_T3_PDF || '/opt/cursor/artifacts/kyaneos-t3/kyaneos-pierre-3T2026.pdf';
// Texte natif de la page 4 du même octet, capturé par Poppler. Il permet de
// rejouer la mise en page émetteur en CI, où le PDF privé n'est pas disponible.
const PAGE4 = 'scripts/industrial/fixtures/kyaneos-pierre-3T2026-page4.txt';
const published = {
  valeur_ifi: 184.42,
  valeur_realisation: 186.49,
  valeur_reconstitution: 225.02,
  valeur_retrait: 199.36,
  nombre_actifs: 666,
};

// Bloc « libellé puis valeur » tel qu'il apparaît dans le texte du PDF.
const layout = `
Valeurs de part

au 30/06/2026

Prix de souscription

224 €

Valeur IFI*

184,42 €

Valeur de réalisation*

186,49 €

Valeur de reconstitution*

225,02 €

Valeur de retrait*

199,36 €

Effet de levier*

1,34

La dette représente 25%
de la valeur de réalisation
de la SCPI qui est autorisée
à s'endetter au maximum à
50%.

Ratio de dettes
0%

25%

50%

Total de la SCPI   Nombre d'actifs : 666    Nombre de lots : 5 162
`;

const extracted = extractFromText(layout);

test('chaque montant par part reste attaché à son propre libellé', () => {
  assert.equal(extracted.maximus_indicators.valeur_realisation, published.valeur_realisation);
  assert.equal(extracted.valorisation_risque.prix_reconstitution, published.valeur_reconstitution);
  assert.equal(extracted.maximus_indicators.prix_retrait, published.valeur_retrait);
  // Les trois valeurs sont distinctes deux à deux dans le bulletin : une
  // permutation d'un cran est donc toujours détectable.
  const values = [published.valeur_realisation, published.valeur_reconstitution, published.valeur_retrait];
  assert.equal(new Set(values).size, 3);
});

test('aucune graduation de jauge ne devient un ratio d’endettement publié', () => {
  // Le ratio publié est la phrase « La dette représente 25 % de la valeur de
  // réalisation ». La jauge (0 %, 25 %, 50 %) n'est qu'une échelle : elle ne
  // doit jamais fournir la valeur, même quand elle coïncide avec le ratio.
  assert.equal(extracted.maximus_indicators.endettement, 0.25);

  const gaugeOnly = extractFromText('Ratio de dettes\n0%\n\n25%\n\n50%\n');
  assert.equal(gaugeOnly.maximus_indicators.endettement, undefined);
});

test('le nombre d’actifs est le stock, pas le flux d’acquisitions', () => {
  assert.equal(extracted.maximus_indicators.nombre_immeubles, published.nombre_actifs);
});

test('le texte natif de la page 4 officielle produit exactement ces valeurs', () => {
  const page4 = fs.readFileSync(PAGE4, 'utf8');
  // Les quatre montants et le stock d'actifs sont bien dans la page publiée.
  for (const amount of ['184,42 €', '186,49 €', '225,02 €', '199,36 €', '224 €']) {
    assert.ok(page4.includes(amount), `montant absent de la page 4 : ${amount}`);
  }
  assert.match(page4, /Nombre d’actifs\s*:\s*666/);
  assert.match(page4, /Valeurs de part\s*\n\s*\n?\s*au 30\/06\/2026/);

  const result = extractFromText(page4);
  assert.equal(result.maximus_indicators.valeur_realisation, published.valeur_realisation);
  assert.equal(result.valorisation_risque.prix_reconstitution, published.valeur_reconstitution);
  assert.equal(result.maximus_indicators.prix_retrait, published.valeur_retrait);
  assert.equal(result.maximus_indicators.nombre_immeubles, published.nombre_actifs);
  // Le ratio publié (25 %) est lu ; la jauge seule ne l'est jamais.
  assert.equal(result.maximus_indicators.endettement, 0.25);
});

test('le bloc officiel archivé reproduit exactement ces valeurs de référence', {skip: !fs.existsSync(PDF)}, () => {
  const text = execFileSync('pdftotext', [PDF, '-'], {encoding: 'utf8', maxBuffer: 32_000_000});
  const page4 = execFileSync('pdftotext', ['-layout', '-f', '4', '-l', '4', PDF, '-'], {encoding: 'utf8'});
  // Le PDF lui-même doit porter les valeurs de référence.
  for (const value of Object.values(published).filter((v) => v !== published.nombre_actifs)) {
    assert.match(page4, new RegExp(value.toFixed(2).replace('.', ',').replace(',', '[,\\.]')), String(value));
  }
  assert.match(page4, /Nombre d’actifs\s*:\s*666/);
  const result = extractFromText(text);
  assert.equal(result.maximus_indicators.valeur_realisation, published.valeur_realisation);
  assert.equal(result.valorisation_risque.prix_reconstitution, published.valeur_reconstitution);
  assert.equal(result.maximus_indicators.prix_retrait, published.valeur_retrait);
  assert.equal(result.maximus_indicators.nombre_immeubles, published.nombre_actifs);
});

test('la proposition SQL ne certifie rien et ne touche aucune vue stricte', () => {
  const lowered = sql.toLowerCase();
  assert.doesNotMatch(lowered, /create\s+or\s+replace\s+view/);
  assert.doesNotMatch(lowered, /create\s+table/);
  assert.doesNotMatch(lowered, /update\s+public\.scpi_metric_certifications/);
  assert.doesNotMatch(lowered, /update\s+public\.scpi_indicator_history/);
  assert.doesNotMatch(lowered, /update\s+public\.scpi_indicators/);
  assert.doesNotMatch(lowered, /insert\s+into\s+public\.scpi_metric_certifications/);
  assert.doesNotMatch(lowered, /grant\s+/);
  assert.match(lowered, /'financial_certified',\s*false/);
  assert.match(lowered, /'deploy_allowed',\s*false/);
});

test('la quarantaine est nommée et rejouable sans doublon', () => {
  assert.match(sql, /recovery227:kyaneos-pierre:2026-T3:shifted-per-share-extraction/);
  assert.match(sql, /on conflict \(event_key\) do nothing/);
  assert.match(sql, /REC227_EXTRACTION_ALREADY_CHANGED_REVIEW_REQUIRED/);
  assert.match(sql, /REC227_STRICT_REGRESSION/);
  assert.match(sql, /REC227_UNEXPECTED_PASS_100_WITH_UNPUBLISHED_T3/);
});
