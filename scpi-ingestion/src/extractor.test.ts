import test from 'node:test';
import assert from 'node:assert/strict';
import { extractFromText } from './extractor.js';

test('extracte les chiffres clés d’un bulletin avec valeurs avant les libellés', () => {
  const text = `
786,9M€
capitalisation
133,1M€
collecte nette
0,00%
dettes et autres engagements
99,6% TOF(1)
115
locataires
10,5 ans 8,3 ans
WALT (4) WALB (5)
250€/part
prix de souscription
225€
valeur de retrait
3 147 773
nombre de parts
217,17€
valeur de réalisation(1)
254,73€
valeur de reconstitution (1)
5,56€ montant brut distribué au titre du T2
par part en pleine jouissance

ÉVOLUTIONS DU CAPITAL
Période
Volume et montants en fin de période Parts en attente de retrait en fin de période
Souscriptions Retraits
T1 2026 2 615 339 392 301 652 010 - 529 709 903
T2 2026 3 147 773 472 166 786 943 - 533 731 1297

Évolution de l'état locatif Au 31.03.2026 Entrées Sorties Au 30.06.2026
Actifs 34 6(6) - 40
Locataires 94 21 - 115
`;

  const result = extractFromText(text);

  assert.equal(result.chiffres_cles.capitalisation, 786_900_000);
  assert.equal(result.chiffres_cles.taux_occupation_financier, 0.996);
  assert.equal(result.chiffres_cles.prix_part, 250);
  assert.equal(result.chiffres_cles.nombre_parts, 3_147_773);

  assert.equal(result.indicateurs_locatifs.walt, 10.5);
  assert.equal(result.indicateurs_locatifs.walb, 8.3);

  assert.equal(result.valorisation_risque.prix_reconstitution, 254.73);
  assert.equal(result.maximus_indicators.valeur_realisation, 217.17);
  assert.equal(result.maximus_indicators.prix_retrait, 225);
  assert.equal(result.maximus_indicators.endettement, 0);
  assert.equal(result.maximus_indicators.collecte_nette, 133_100_000);
  assert.equal(result.maximus_indicators.nombre_locataires, 115);
  assert.equal(result.maximus_indicators.nombre_immeubles, 40);
  assert.equal(result.maximus_indicators.distribution_par_part, 5.56);
  assert.equal(result.maximus_indicators.parts_attente_retrait, 0);
});
