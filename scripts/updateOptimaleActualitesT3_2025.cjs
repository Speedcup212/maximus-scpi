const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver Optimale (entrée avec période bulletin T3 2025)
const optimaleIndex = data.findIndex(s => 
  s['Nom SCPI'] === 'Optimale' && 
  s['Période bulletin trimestriel'] === 'T3 2025'
);

if (optimaleIndex === -1) {
  console.log('❌ Optimale T3 2025 non trouvée');
  process.exit(1);
}

const optimale = data[optimaleIndex];
console.log(`✅ Optimale T3 2025 trouvée: ${optimale['Nom SCPI']}\n`);

// 2 acquisitions détaillées du T3 2025
const acquisitions = [
  {
    ville: 'Sainte-Hélène-du-Lac',
    departement: '73',
    pays: 'France',
    montant: '1,09',
    surface: '660',
    type: 'activités',
    description: 'immeuble d\'activités et bureaux d\'études',
    locataires: 'Axians et Pyrite Ingénierie',
    contexte: 'implanté au sein du Parc d\'Activités Industrielles Alpespace – Cœur de Savoie, près de Chambéry, renforçant la présence dans le sillon alpin'
  },
  {
    ville: 'Couëron',
    departement: '44',
    pays: 'France',
    montant: '1,83',
    surface: '910',
    type: 'activités',
    description: 'immeuble d\'activités',
    locataires: 'ADN TANGUY Matériaux',
    contexte: 'situé dans la Zone d\'Activités des Hauts de Couëron, à proximité immédiate de Nantes, locataire présent sur le site depuis plus de 20 ans'
  }
];

// Calculer le total
const totalAcquisitions = acquisitions.reduce((sum, acq) => {
  const montant = parseFloat(acq.montant.replace(',', '.'));
  return sum + (isNaN(montant) ? 0 : montant);
}, 0);

// Actualités trimestrielles T3 2025 avec acquisitions détaillées
const actualites = [
  // Résumé général
  `Deux nouvelles acquisitions représentant un montant total de ${totalAcquisitions.toFixed(2)} M€ au cours du trimestre`,
  
  // Acquisitions détaillées
  `Acquisition à Sainte-Hélène-du-Lac (France, ${acquisitions[0].surface} m², ${acquisitions[0].montant}M€) : ${acquisitions[0].description} implanté au sein du Parc d'Activités Industrielles Alpespace – Cœur de Savoie, près de Chambéry, loué à Axians et Pyrite Ingénierie, sociétés spécialisées dans l'aménagement de la montagne (activités)`,
  `Acquisition à Couëron (France, ${acquisitions[1].surface} m², ${acquisitions[1].montant}M€) : ${acquisitions[1].description} situé dans la Zone d'Activités des Hauts de Couëron, à proximité immédiate de Nantes, loué à ADN TANGUY Matériaux, spécialisée dans les matériaux de couverture et présente sur le site depuis plus de 20 ans (activités)`,
  
  // Événements structurants
  "Renforcement de la présence dans le sillon alpin avec l'acquisition à Sainte-Hélène-du-Lac, confirmant le positionnement local sur des métiers à forte expertise technique",
  "Illustration de la stratégie d'Optimale : investir dans des actifs d'entreprise performants et bien localisés au cœur des grandes agglomérations régionales",
  
  // Indicateurs de performance
  "Volume total investi de presque 93 M€ depuis le lancement, témoignant de la croissance soutenue du portefeuille",
  "Taux de distribution T3 2025 de 1,62% brut (4,05€/part) et taux de distribution cumulé 2025 de 4,70% brut (11,75€/part)",
  "Performance Globale Annuelle (PGA) cible 2025 de 8% et taux de distribution cible 2025 entre 6,30% et 6,50%",
  
  // Occupation
  "Taux d'occupation financier de 95,36%, témoignant d'une gestion locative active",
  
  // Évolution du portefeuille
  "Portefeuille compte désormais 36 actifs immobiliers pour une surface totale supérieure à 69 731 m²",
  "81 locataires répartis sur les métropoles françaises, renforçant la diversification locative",
  
  // Loyers
  "Loyers quittancés T3 2025 de 1 755 k€, confirmant la performance locative du portefeuille",
  
  // Cessions
  "Aucune cession d'actif n'a été réalisée au cours du trimestre"
];

// Mettre à jour les actualités trimestrielles
optimale['Actualités trimestrielles'] = actualites.join(' | ');

// Sauvegarder
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`✅ ${actualites.length} actualités trimestrielles mises à jour pour Optimale T3 2025\n`);

console.log('📊 Acquisitions détaillées:');
acquisitions.forEach((acq, i) => {
  console.log(`   ${i + 1}. ${acq.ville} (${acq.departement}) - ${acq.montant}M€ - ${acq.surface} m² - ${acq.type}`);
  console.log(`      Locataires: ${acq.locataires}`);
});

console.log(`\n💰 Volume total: ${totalAcquisitions.toFixed(2)} M€`);
console.log('\n✅ Fichier JSON mis à jour!');
