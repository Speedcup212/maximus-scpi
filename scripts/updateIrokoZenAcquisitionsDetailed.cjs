const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver Iroko Zen (entrée avec période bulletin T3 2025)
const irokoZenIndex = data.findIndex(s => 
  s['Nom SCPI'] === 'Iroko Zen' && 
  s['Période bulletin trimestriel'] === 'T3 2025'
);

if (irokoZenIndex === -1) {
  console.log('❌ Iroko Zen T3 2025 non trouvée');
  process.exit(1);
}

const irokoZen = data[irokoZenIndex];
console.log(`✅ Iroko Zen T3 2025 trouvée: ${irokoZen['Nom SCPI']}\n`);

// 14 acquisitions détaillées du T3 2025 (Londres apparaît deux fois : commerces et bureaux)
const acquisitions = [
  {
    ville: 'Sheffield',
    pays: 'Royaume-Uni',
    montant: '19,33',
    type: 'Autre',
    description: 'Parking',
    walb: '19,56',
    rendement: '8,3'
  },
  {
    ville: 'Alcala de Guadaira',
    pays: 'Espagne',
    montant: '26,21',
    type: 'commerce',
    description: 'Commerces',
    walb: '1,83',
    rendement: '8,47'
  },
  {
    ville: 'Londres',
    pays: 'Royaume-Uni',
    montant: '6,97',
    type: 'commerce',
    description: 'Commerces',
    walb: '2,17',
    rendement: '7,35'
  },
  {
    ville: 'Échirolles',
    pays: 'France',
    montant: '7,23',
    type: 'commerce',
    description: 'Commerces',
    walb: '4',
    rendement: '7,6'
  },
  {
    ville: 'Leeds',
    pays: 'Royaume-Uni',
    montant: '6,58',
    type: 'santé',
    description: 'École',
    walb: '4',
    rendement: '7,84'
  },
  {
    ville: 'Reading',
    pays: 'Royaume-Uni',
    montant: '19,72',
    type: 'bureaux',
    description: 'Bureaux',
    walb: '10,54',
    rendement: '8,86'
  },
  {
    ville: 'Wiesbaden',
    pays: 'Allemagne',
    montant: '17,10',
    type: 'bureaux',
    description: 'Bureaux',
    walb: '8,4',
    rendement: '7,04'
  },
  {
    ville: 'Bournemouth',
    pays: 'Royaume-Uni',
    montant: '12,01',
    type: 'commerce',
    description: 'Commerces',
    walb: '9,56',
    rendement: '9,22'
  },
  {
    ville: 'Getafe',
    pays: 'Espagne',
    montant: '11,16',
    type: 'logistique',
    description: 'Entrepôt',
    walb: '4,1',
    rendement: '8,05'
  },
  {
    ville: 'Noordwijkerhout',
    pays: 'Pays-Bas',
    montant: '22,15',
    type: 'logistique',
    description: 'Entrepôt',
    walb: '15',
    rendement: '7,34'
  },
  {
    ville: 'Londres',
    pays: 'Royaume-Uni',
    montant: '66,9',
    type: 'bureaux',
    description: 'Bureaux',
    walb: '13',
    rendement: '8,76'
  },
  {
    ville: 'Swords',
    pays: 'Irlande',
    montant: '24,5',
    type: 'commerce',
    description: 'Commerces',
    walb: '15',
    rendement: '7,42'
  },
  {
    ville: 'Guben',
    pays: 'Allemagne',
    montant: '7,25',
    type: 'commerce',
    description: 'Commerces',
    walb: '19',
    rendement: '7,0-8,0'
  },
  {
    ville: 'Croydon',
    pays: 'Royaume-Uni',
    montant: '9,394',
    type: 'Autre',
    description: 'Parking',
    walb: '29',
    rendement: '7,74'
  }
];

// Calculer le total
const totalAcquisitions = acquisitions.reduce((sum, acq) => {
  const montant = parseFloat(acq.montant.replace(',', '.').replace('-', ''));
  return sum + (isNaN(montant) ? 0 : montant);
}, 0);

// Actualités trimestrielles T3 2025 avec acquisitions détaillées
const actualites = [
  // Résumé général
  `Quatorze nouvelles acquisitions représentant un volume total de ${totalAcquisitions.toFixed(1)} M€ hors droits au cours du trimestre`,
  
  // Acquisitions détaillées (par ordre de montant décroissant)
  ...acquisitions
    .sort((a, b) => {
      const montantA = parseFloat(a.montant.replace(',', '.').replace('-', ''));
      const montantB = parseFloat(b.montant.replace(',', '.').replace('-', ''));
      return (isNaN(montantB) ? 0 : montantB) - (isNaN(montantA) ? 0 : montantA);
    })
    .map(acq => {
      const typeLabel = acq.type === 'commerce' ? 'commerce' : 
                       acq.type === 'bureaux' ? 'bureaux' :
                       acq.type === 'logistique' ? 'logistique' :
                       acq.type === 'santé' ? 'santé/éducation' :
                       acq.type === 'Autre' ? 'autre' : acq.type;
      
      return `Acquisition à ${acq.ville} (${acq.pays}, ${acq.montant}M€) : ${acq.description.toLowerCase()} avec durée ferme des baux de ${acq.walb} ans et rendement AEM de ${acq.rendement}% (${typeLabel})`;
    }),
  
  // Collecte
  "Collecte nette de 130M€ au cours du trimestre, portant la capitalisation à 1 237M€ au 30 septembre 2025",
  
  // Distribution
  "Distribution T3 2025 de 3,73€ brut et 3,03€ net de fiscalité étrangère par part, confirmant la performance de distribution",
  
  // Occupation
  "Taux d'occupation financier de 98,1% et taux d'occupation physique de 97,6%, témoignant d'une gestion locative solide",
  
  // Endettement
  "Ratio d'endettement (LTV) de 30,1%, niveau modéré permettant une marge de manœuvre pour les investissements futurs",
  
  // Durée des baux
  "Durée moyenne ferme des baux (WALB) de 7,6 ans et durée moyenne totale (WALT) de 9,1 ans, assurant une visibilité de revenus à long terme",
  
  // Évolution du portefeuille
  "Portefeuille compte désormais 164 actifs immobiliers pour une surface totale de 981 138 m², répartis sur 7 pays européens",
  "46 nouveaux locataires intégrés au T3 2025, portant le total à 378 locataires, renforçant la diversification locative",
  
  // Prix de souscription
  "Prix de souscription porté à 204€ le 1er août 2025 (en hausse de 2€ par rapport au trimestre précédent), reflétant la valorisation du patrimoine",
  
  // Gestion d'actifs
  "Recommercialisations réalisées à Arras (Mobalpa, 261 m²), Barcelone (Action, 1 323 m²), Emmen Nijbracht (Brookhuis, 1 000 m²) et Ballymount (Cavalier Flooring, 172 m²)",
  "Programme de relocation en cours pour Pantin (258 m², départ juillet 2026), Alcala de Guadaira (1 901 m², départ février 2026) et Brie Comte Robert (372 m², départ décembre 2025)",
  
  // Événements structurants
  "Renforcement des équipes avec l'arrivée de Killian Waeckel en tant qu'Asset Manager, renforçant les capacités de gestion",
  "Création de Fyra, filiale de gestion locative premium, pour optimiser la gestion opérationnelle du portefeuille",
  "Reprise du portefeuille espagnol par Iroko Iberia depuis juillet 2025, améliorant la gestion locale des actifs",
  
  // Actions ESG
  "Actions ESG : partenariat avec Tilt Energy et Thermosphr, installation d'une pompe à chaleur à Heerlen et d'un système GTB à Olivet",
  
  // Cessions
  "Aucune cession d'actif n'a été réalisée au cours du trimestre"
];

// Mettre à jour les actualités trimestrielles
irokoZen['Actualités trimestrielles'] = actualites.join(' | ');

// Sauvegarder
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`✅ ${actualites.length} actualités trimestrielles mises à jour pour Iroko Zen T3 2025\n`);

console.log(`📊 ${acquisitions.length} acquisitions détaillées:`);
acquisitions
  .sort((a, b) => {
    const montantA = parseFloat(a.montant.replace(',', '.').replace('-', ''));
    const montantB = parseFloat(b.montant.replace(',', '.').replace('-', ''));
    return (isNaN(montantB) ? 0 : montantB) - (isNaN(montantA) ? 0 : montantA);
  })
  .forEach((acq, i) => {
    console.log(`   ${i + 1}. ${acq.ville} (${acq.pays}) - ${acq.montant}M€ - ${acq.type}`);
  });

console.log(`\n💰 Volume total: ${totalAcquisitions.toFixed(1)} M€`);
console.log('\n✅ Fichier JSON mis à jour!');
