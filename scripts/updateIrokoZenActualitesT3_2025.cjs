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

// Actualités trimestrielles T3 2025 basées sur le bulletin
// Format : phrases synthétiques de 10-25 mots avec faits concrets
const actualites = [
  // Acquisitions (priorité 1)
  "15 nouveaux actifs acquis au T3 2025 pour un volume total de 217 M€ hors droits et frais, témoignant d'une forte dynamique d'investissement",
  
  // Collecte (priorité 2)
  "Collecte nette de 130M€ au cours du trimestre, portant la capitalisation à 1 237M€ au 30 septembre 2025",
  
  // Distribution (priorité 3)
  "Distribution T3 2025 de 3,73€ brut et 3,03€ net de fiscalité étrangère par part, confirmant la performance de distribution",
  
  // Occupation (priorité 4)
  "Taux d'occupation financier de 98,1% et taux d'occupation physique de 97,6%, témoignant d'une gestion locative solide",
  
  // Endettement (priorité 5)
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

console.log('📊 Catégories d\'actualités:');
const acquisitions = actualites.filter(a => a.toLowerCase().includes('acquisition') || a.toLowerCase().includes('actifs acquis'));
const collecte = actualites.filter(a => a.toLowerCase().includes('collecte'));
const distribution = actualites.filter(a => a.toLowerCase().includes('distribution'));
const occupation = actualites.filter(a => a.toLowerCase().includes('occupation'));
const autres = actualites.filter(a => 
  !a.toLowerCase().includes('acquisition') && 
  !a.toLowerCase().includes('collecte') && 
  !a.toLowerCase().includes('distribution') &&
  !a.toLowerCase().includes('occupation')
);

console.log(`   🏢 ${acquisitions.length} acquisition(s)`);
console.log(`   📈 ${collecte.length} collecte`);
console.log(`   💰 ${distribution.length} distribution`);
console.log(`   🧱 ${occupation.length} occupation`);
console.log(`   📊 ${autres.length} autres actualités`);

console.log('\n✅ Fichier JSON mis à jour!');
