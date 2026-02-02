const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver LOG-IN (peut être "Log In" ou "LOG IN")
const logInIndex = data.findIndex(s => 
  s['Nom SCPI'] === 'Log In' || 
  s['Nom SCPI'] === 'LOG IN' ||
  s['Nom SCPI']?.toLowerCase() === 'log in'
);

if (logInIndex === -1) {
  console.log('❌ LOG-IN non trouvée');
  process.exit(1);
}

const logIn = data[logInIndex];
console.log(`✅ LOG-IN trouvée: ${logIn['Nom SCPI']}\n`);

// Actualités trimestrielles T3 2025 basées sur le bulletin
const actualites = [
  // Résumé général
  "Deux acquisitions finalisées pour 9,6 M€ au cours du trimestre",
  
  // Acquisitions détaillées
  "Acquisition à Fossò (Italie, 3 346 m², 6,7M€) : site industriel entièrement rénové, livré clé en main et loué pour une durée ferme de 15 ans à TreZeta Group, acteur italien spécialisé dans la fabrication de semelles pour chaussures de luxe (locaux d'activités et sites de production)",
  "Acquisition à Tychy (Pologne, 9 705 m², 2,9M€) : bâtiment industriel construit en 1997 et modernisé en 2016, comprenant 6 704 m² de production, 2 531 m² de bureaux (26%) et 470 m² d'entrepôts, occupé par BOS Automotive Product Polska, filiale du groupe allemand BOS GmbH, acteur mondial du secteur automobile (locaux d'activités et sites de production)",
  
  // Événements structurants
  "Première acquisition de LOG-IN en Pologne, marquant une étape importante dans le développement européen du portefeuille",
  "Le site de Tychy bénéficie d'un emplacement stratégique à proximité de Katowice, au cœur du corridor Baltique-Adriatique TEN-T",
  "L'ensemble des deux actifs italiens (Fossò et San Donato) représente désormais plus de 12 500 m², consolidant un partenariat stratégique de long terme avec un acteur de référence de l'industrie italienne",
  "Taux de rendement global combiné des deux opérations italiennes s'élève à 8%, traduisant une excellente création de valeur",
  
  // Indicateurs de performance
  "Collecte brute de 15,8M€ au cours du trimestre, portant la capitalisation à 207,8M€ au 30 septembre 2025",
  "Portefeuille compte désormais 16 actifs répartis dans 6 pays (Allemagne, Italie, Royaume-Uni, Espagne, Irlande et Pologne)",
  "Taux d'occupation financier de 100% et durée ferme moyenne des baux (WALB) de 9,7 ans",
  
  // Distribution
  "Dividende trimestriel de 2,91€ par part (3,54€ brut de fiscalité étrangère), identique au trimestre précédent",
  "LOG-IN reste en ligne avec son objectif 2025 de rendement brut entre 6% et 6,5%",
  
  // Prix de souscription
  "À compter du 1er novembre 2025, le prix de souscription sera porté à 255€ par part",
  
  // Cessions
  "Aucune cession d'actif n'a été réalisée au cours du trimestre"
];

// Mettre à jour les actualités trimestrielles
logIn['Actualités trimestrielles'] = actualites.join(' | ');
logIn['Période bulletin trimestriel'] = 'T3 2025';

// Sauvegarder
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`✅ ${actualites.length} actualités trimestrielles mises à jour pour LOG-IN T3 2025\n`);

console.log('📊 Acquisitions détaillées:');
actualites.filter(a => a.includes('Acquisition à')).forEach((acq, i) => {
  console.log(`   ${i + 1}. ${acq.substring(0, 120)}...`);
});

console.log('\n📊 Événements structurants:');
actualites.filter(a => a.includes('Première') || a.includes('Taux de rendement') || a.includes('consolidant')).forEach((evt, i) => {
  console.log(`   ${i + 1}. ${evt.substring(0, 100)}...`);
});

console.log('\n✅ Fichier JSON mis à jour!');
