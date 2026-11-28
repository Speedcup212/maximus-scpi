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


test('CORUM T2 2026 : reconnaît la durée d’engagement locatif sans inventer de WALT', () => {
  for (const [nom, duree] of [
    ['CORUM Origin', 6.05],
    ['CORUM XL', 7.45],
    ['CORUM Eurion', 6.36],
    ['CORUM USA', 8.88],
  ] as const) {
    const extrait = [
      nom,
      'Le profil du patrimoine',
      'Durée moyenne pendant laquelle les locataires',
      'sont engagés à payer leur loyer',
      duree.toFixed(2).replace('.', ',') + ' ANNÉES',
      'SOIT JUSQU’EN NOVEMBRE 2032',
    ].join('\n');
    const donnees = extractFromText(extrait);
    assert.equal(donnees.indicateurs_locatifs.walb, duree, nom);
    assert.equal(donnees.indicateurs_locatifs.duree_bail_restante, duree, nom);
    assert.equal(donnees.indicateurs_locatifs.walt, undefined, nom);
  }
});

test('Kyaneos Pierre T3 2026 : blocs « libellé puis valeur » restent alignés', () => {
  // Mise en page réelle du bulletin émetteur : chaque libellé est suivi de sa
  // valeur sur une ligne séparée. Une capture gloutonne franchissait le saut de
  // ligne et décalait chaque montant vers le champ voisin.
  const text = `
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
`;

  const result = extractFromText(text);

  // Chaque valeur doit rester celle de SON libellé, jamais celle du voisin.
  assert.equal(result.valorisation_risque.prix_reconstitution, 225.02);
  assert.equal(result.maximus_indicators.valeur_realisation, 186.49);
  assert.equal(result.maximus_indicators.prix_retrait, 199.36);

  // Le libellé de reconstitution suit « Valeur IFI » et « au 30/06/2026 ».
  // Une capture qui franchit le saut de ligne ramène la date (30) ou la
  // valeur IFI (184,42) au lieu du montant du champ.
  assert.notEqual(result.valorisation_risque.prix_reconstitution, 30);
  assert.notEqual(result.valorisation_risque.prix_reconstitution, 184.42);
  assert.notEqual(result.valorisation_risque.prix_reconstitution, 224);
});

test('Kyaneos Pierre T3 2026 : la jauge n’est pas un ratio mais la dette publiée est lue', () => {
  // « Ratio de dettes » est le titre d’une jauge dont les graduations sont
  // 0 %, 25 %, 50 %. Le convertir en 0 % serait une valeur rassurante inventée.
  // En revanche la phrase « La dette représente 25 % de la valeur de
  // réalisation » est un ratio publié par l’émetteur : il doit être lu, et non
  // remplacé par la première graduation de la jauge.
  const text = `
La dette représente 25%
de la valeur de réalisation
de la SCPI qui est autorisée
à s'endetter au maximum à
50%.

Ratio de dettes
0%

25%

50%
`;
  const result = extractFromText(text);
  assert.equal(result.maximus_indicators.endettement, 0.25);
  assert.notEqual(result.maximus_indicators.endettement, 0);
});

test('n’utilise pas le flux trimestriel d’acquisitions comme nombre d’actifs', () => {
  const text = `
Au cours du trimestre, la SCPI a fait l'acquisition de 8 immeubles, soit 77 lots.
Total de la SCPI Nombre d'actifs : 666   Nombre de lots : 5 162
`;
  const result = extractFromText(text);
  assert.equal(result.maximus_indicators.nombre_immeubles, 666);
});

test('une jauge sans ratio publié ne produit aucun endettement', () => {
  // Graduations seules : aucune valeur mesurée. Rien ne doit être enregistré,
  // en particulier pas le premier cran de la jauge (0 %).
  const text = `
Ratio de dettes
0%

25%

50%
`;
  const result = extractFromText(text);
  assert.equal(result.maximus_indicators.endettement, undefined);
});

// Les deux ordres de mise en page coexistent dans les bulletins émetteurs.
// Les deux produisent la même suite « montant / libellé / montant » : seul le
// début du bloc (« Valeurs de part ») les distingue. Lire le mauvais sens
// renvoie le montant du champ voisin.
const perShareLayouts = {
  'libellé puis valeur': `
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
`,
  'valeur puis libellé': `
Valeurs de part

250€/part
prix de souscription
225€
valeur de retrait
217,17€
valeur de réalisation(1)
254,73€
valeur de reconstitution (1)
`,
  'valeur puis libellé, lignes serrées': `
Valeurs de part
186,49 €
Valeur de réalisation
225,02 €
Valeur de reconstitution
199,36 €
Valeur de retrait
`,
};

test('les deux ordres de bloc « valeurs de part » restent alignés', () => {
  const attendu = {
    'libellé puis valeur': { realisation: 186.49, reconstitution: 225.02, retrait: 199.36 },
    'valeur puis libellé': { realisation: 217.17, reconstitution: 254.73, retrait: 225 },
    'valeur puis libellé, lignes serrées': { realisation: 186.49, reconstitution: 225.02, retrait: 199.36 },
  } as const;

  for (const [nom, text] of Object.entries(perShareLayouts)) {
    const result = extractFromText(text);
    const expected = attendu[nom as keyof typeof attendu];
    assert.equal(result.maximus_indicators.valeur_realisation, expected.realisation, `${nom} — réalisation`);
    assert.equal(result.valorisation_risque.prix_reconstitution, expected.reconstitution, `${nom} — reconstitution`);
    assert.equal(result.maximus_indicators.prix_retrait, expected.retrait, `${nom} — retrait`);
  }
});

test('un montant hors du bloc « valeurs de part » ne décide pas de l’ordre', () => {
  // Le total d'acquisitions précède le bloc dans le bulletin réel. S'il servait
  // de repère, le sens de lecture serait inversé et chaque valeur décalée.
  const text = `
Patrimoine de la SCPI
Acquisitions du trimestre : 8 962 781 € acte en main

Valeurs de part

au 30/06/2026

Valeur de réalisation*

186,49 €

Valeur de reconstitution*

225,02 €

Valeur de retrait*

199,36 €
`;
  const result = extractFromText(text);
  assert.equal(result.maximus_indicators.valeur_realisation, 186.49);
  assert.equal(result.valorisation_risque.prix_reconstitution, 225.02);
  assert.equal(result.maximus_indicators.prix_retrait, 199.36);
});

test('le qualificatif « par part » et l’appel de note restent reconnus', () => {
  const text = `
Valeurs de part

Valeur de réalisation par part

186,49 €

Valeur de retrait par part

199,36 €
`;
  const result = extractFromText(text);
  assert.equal(result.maximus_indicators.valeur_realisation, 186.49);
  assert.equal(result.maximus_indicators.prix_retrait, 199.36);
});
