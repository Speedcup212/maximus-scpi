// RECOVERY-200 — non-régression du rapprochement valeur / texte paginé.
// Les extraits proviennent des preuves stockées en base au 10/11/2026.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evidenceForNumeric, explicitZeroMatch, numericOccurrences, unitConflicts} from './matcher.mjs';

const page = (text, number = 3) => [{page: number, text}];

const FICOMMERCE_T3 = 'Performances Les performances passées ne préjugent pas des performances futures Taux de distribution 2021 2022 2023 2024 2025 '
  + 'Dividende en € (10) 9,52 10,50 10,60 (11) 10,65 10,70 (12) dont % des revenus non récurrents 0,00 % 0,00 % 0,00 % 0,00 % 0,00 %';
const PRIMOVIE_T2 = 'Nombre de parts en fin de trimestre 25 668 824 25 668 824 25 607 729 25 575 793 Nombre de parts en attente de retrait '
  + '(confirmées et non confirmées*) 1 201 141 1 355 899 1 438 276 - Nombre de parts en attente de cession (confirmées et non confirmées*) - - - 0 '
  + 'La SCPI Primovie a suspendu temporairement la variabilité de son capital';
const AESTIAM_OTHER_FUND = 'T4 2025 Capitalisation 211 431 035 € 211 431 035 € 211 431 035 € Nombre total de parts 749 915 749 915 749 915 '
  + 'Souscriptions (nombre de parts) 0 0 0 Retraits (nombre de parts) 0 0 0 Parts en attente de retrait 104 068 105 643 105 643 Fiscalité';
const AESTIAM_HORIZON_2023_T3 = 'Nombre total de parts 1 078 984 1 086 588 1 088 396 1 086 498 - Souscriptions (nombre de parts) 51 584 14 493 6 169 2 149 - '
  + 'Retraits (nombre de parts) 47 111 6 889 4 361 4 047 - Parts en attente de retrait 0 0 0 1 493 - Fiscalité';

test('a dividend of 0 € is never proven by a 0,00 % share of non-recurring income', () => {
  assert.equal(evidenceForNumeric('distribution_par_part', 0, page(FICOMMERCE_T3), false), null);
});

test('a non-zero dividend is still proven when the table header carries the unit', () => {
  const proof = evidenceForNumeric('distribution_par_part', 10.7, page(FICOMMERCE_T3), false);
  assert.ok(proof);
  assert.equal(proof.page, 3);
  assert.match(proof.text, /10,70/);
});

test('a percentage occurrence cannot prove a per-share amount', () => {
  const text = 'Dividende versé au titre du trimestre : rendement 0,83 % du prix de part.';
  assert.equal(evidenceForNumeric('distribution_par_part', 0.83, page(text), false), null);
  assert.ok(evidenceForNumeric('distribution_par_part', 0.83, page('Dividende versé au titre du trimestre : 0,83 € par part.'), false));
});

test('pending shares after a suspension of capital variability are not certified as zero', () => {
  assert.equal(evidenceForNumeric('parts_attente_retrait', 0, page(PRIMOVIE_T2), false), null);
});

test('a zero of the previous table row is not taken for the pending-share figure', () => {
  assert.equal(evidenceForNumeric('parts_attente_retrait', 0, page(AESTIAM_OTHER_FUND), false), null);
});

test('a row ending with a non-zero latest column is not certified as zero', () => {
  assert.equal(evidenceForNumeric('parts_attente_retrait', 0, page(AESTIAM_HORIZON_2023_T3), false), null);
});

test('explicit zero statements of pending shares are accepted', () => {
  const accepted = [
    '0 part en attente de retrait',
    '0 en attente retrait',
    '1 258 331 696 € CAPITAL NOMINAL 141 153 PARTS NOUVELLES SOUSCRITES 136 093 PARTS RETIRÉES 0 PART EN ATTENTE AU 30/06/2023',
    'Le capital sʼélève à 167 364 parts en fin de trimestre, dont aucune part en attente de retrait.',
    'Parts en attente de retrait sur le marché primaire au 30/06/2026 : 0 Évolution des performances',
    'Nombre de parts en fin de semestre 6 844 051 Nombre de part en attente de retrait 0 Part d’investisseurs institutionnels',
    'Nombre de parts en fin de trimestre 24 982 34 015 64 060 91 260 Parts en attente de retrait 0 0 0 0 MARCHÉ DES PARTS',
    'PARTS EN ATTENTE DE RETRAIT 0 RENDEMENT MOYEN BRUT 6,6%',
    'diversifiée. 0 Part en attente de retrait Le nombre de parts pour lesquelles un associé a demandé à sortir',
  ];
  for (const text of accepted) {
    assert.ok(explicitZeroMatch('parts_attente_retrait', text), text);
  }
});

test('replay of stored zero proofs (10/11/2026): accepted formats', () => {
  const accepted = [
    '0 Part(s) en attente de retraits',
    '0 Parts en attente de retraits',
    'SHA256=d241574a; reference_date=2022-03-31; MuPDF=NOMBRE DE PARTS EN ATTENTE DE RETRAIT 0; Poppler=NOMBRE DE PARTS EN ATTENTE DE RETRAIT 0',
    'Souscriptions compensant des retraits 0 part 0 part 0 part 0 part Parts en attente de retrait 0 part 0 part 0 part 0 part Cessions / Transferts 358 parts',
    "La SCPI Novaxia NEO, qui n’a enregistré aucune part en attente de retrait sur l’année 2024, affiche une granularité",
    'Associés (+ 250 au T3 2024) 424,8 M€ Capitalisation 37 Actifs (+ 1 au T3 2024) 0 part en attente de retrait 7,51 %',
  ];
  for (const text of accepted) assert.ok(explicitZeroMatch('parts_attente_retrait', text), text);
  assert.ok(explicitZeroMatch('endettement', 'SHA256=55f9467a; reference_date=2020-12-31; MuPDF=ENDETTEMENT | 0%; Poppler=ENDETTEMENT | 0%'));
});

test('replay of stored zero proofs (10/11/2026): rejected formats', () => {
  // NCap Éducation Santé T3 2019 : la dernière colonne vaut 250 parts.
  const ncap2019T3 = 'Souscriptions compensant des retraits 0 part 0 part Parts en attente de retrait 0 part 250 parts Cessions / Transferts 0 part 6 parts';
  assert.equal(evidenceForNumeric('parts_attente_retrait', 0, page(ncap2019T3), false), null);
  // Mise en page « valeurs puis libellés » (Sogenial) : rapprochement impossible sans lecture visuelle, donc pas de preuve automatique.
  const valuesThenLabels = 'Les performances en bref 204 € 219,47 € 0 Prix de la part Valeur de reconstitution au 31/12/2025 part en attente de retrait et part cédée de gré à gré';
  assert.equal(explicitZeroMatch('parts_attente_retrait', valuesThenLabels), null);
  // Colonnes futures vides (Aestiam 2023) : le tiret rend la dernière colonne ambiguë.
  assert.equal(explicitZeroMatch('parts_attente_retrait', 'Retraits (nombre de parts) 47 111 6 889 - - - Parts en attente de retrait 0 0 - - - Fiscalité'), null);
});

test('ambiguous empty columns are not read as zero', () => {
  assert.equal(explicitZeroMatch('parts_attente_retrait', 'Parts en attente de retrait 0 0 - MARCHÉ DES PARTS'), null);
  assert.equal(explicitZeroMatch('parts_attente_retrait', 'Parts en attente de retrait en fin de période (4) Mouvements de parts'), null);
});

test('explicit zero debt statements are accepted, and only those', () => {
  const accepted = [
    "Taux d'endettement (5) Taux d'endettement au 30.06.2026 (6) 0 % (5) Le taux d’endettement correspond",
    'Endettement 0 € 0 € Taux d’endettement 0 % 0 % Ratio dettes et autres engagements 0 % 0 %',
    "Endettement Au 30/06/2026 22 498 Parts 11 Aucun financement n'a été mis en place dans Remake UK 2025",
    'POINT SUR L’ENDETTEMENT DETTE BANCAIRE VALEUR D’EXPERTISE % DETTE/VALEUR AU BILAN 0,0 M€ 40,7 M€ 0,0 %',
    'TAUX D’OCCUPATION FINANCIER 100% ENDETTEMENT 0% Deux acquisitions',
  ];
  for (const text of accepted) assert.ok(explicitZeroMatch('endettement', text), text);
  assert.equal(explicitZeroMatch('endettement', 'Taux d’endettement 24,5 % au 30/06/2026, contre 0,8 % de vacance'), null);
});

test('zero is never certified by proximity for metrics without an explicit rule', () => {
  assert.equal(evidenceForNumeric('tof', 0, page('Taux d’occupation financier 0 0 95,4 %'), false), null);
  assert.equal(evidenceForNumeric('capitalisation', 0, page('Capitalisation 0 M€ au lancement'), false), null);
});

test('units are attached to bare numbers and conflicting units are detected', () => {
  const occurrences = numericOccurrences('TOF 95,35 % ; 8 504 200 parts ; 70 €');
  const units = Object.fromEntries(occurrences.filter((o) => o.raw.match(/^\d/)).map((o) => [o.raw.trim(), o.unit]));
  assert.equal(units['95,35'], '%');
  assert.equal(units['8 504 200'], 'parts');
  assert.equal(unitConflicts('tof', '€'), true);
  assert.equal(unitConflicts('tof', '%'), false);
  assert.equal(unitConflicts('parts_attente_retrait', '%'), true);
  assert.equal(unitConflicts('distribution_par_part', null), false);
});

test('non-zero TOF and pending shares keep their page proof', () => {
  const tof = evidenceForNumeric('tof', 95.35, page('Taux d’Occupation Financier (7) 95,35 % au T2 2026', 4), false);
  assert.equal(tof.page, 4);
  const pending = evidenceForNumeric('parts_attente_retrait', 1438276, page(PRIMOVIE_T2), false);
  assert.ok(pending);
  assert.match(pending.text, /1 438 276/);
});
