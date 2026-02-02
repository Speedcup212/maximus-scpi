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

// Fonction pour compter les mots
const countWords = (text) => {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
};

// Reformuler les acquisitions pour respecter 10-25 mots
const acquisitions = [
  {
    ville: 'Sainte-Hélène-du-Lac',
    pays: 'France',
    montant: '1,09',
    surface: '660',
    type: 'activités',
    description: 'immeuble d\'activités et bureaux au Parc Alpespace, près de Chambéry, loué à Axians et Pyrite Ingénierie (activités)'
  },
  {
    ville: 'Couëron',
    pays: 'France',
    montant: '1,83',
    surface: '910',
    type: 'activités',
    description: 'immeuble d\'activités à Couëron, près de Nantes, loué à ADN TANGUY Matériaux depuis plus de 20 ans (activités)'
  }
];

// Vérifier la longueur
acquisitions.forEach((acq, i) => {
  const phrase = `Acquisition à ${acq.ville} (${acq.pays}, ${acq.surface} m², ${acq.montant}M€) : ${acq.description}`;
  const words = countWords(phrase);
  console.log(`Acquisition ${i + 1}: ${words} mots ${words > 25 ? '❌ TROP LONG' : words < 10 ? '❌ TROP COURT' : '✅ OK'}`);
  if (words > 25) {
    // Reformuler pour réduire à 25 mots maximum
    let shortDesc;
    if (acq.ville === 'Sainte-Hélène-du-Lac') {
      shortDesc = 'immeuble d\'activités et bureaux au Parc Alpespace, près de Chambéry, loué à Axians et Pyrite Ingénierie (activités)';
    } else if (acq.ville === 'Couëron') {
      shortDesc = 'immeuble d\'activités à Couëron, près de Nantes, loué à ADN TANGUY Matériaux depuis 20 ans (activités)';
    } else {
      shortDesc = acq.description;
    }
    const newPhrase = `Acquisition à ${acq.ville} (${acq.pays}, ${acq.surface} m², ${acq.montant}M€) : ${shortDesc}`;
    const newWords = countWords(newPhrase);
    console.log(`   Reformulé: ${newWords} mots`);
    if (newWords <= 25) {
      acq.description = shortDesc;
    }
  }
});

// Actualités trimestrielles T3 2025 avec acquisitions reformulées
const actualites = [
  // Résumé général
  "Deux nouvelles acquisitions représentant un montant total de 2,92 M€ au cours du trimestre",
  
  // Acquisitions détaillées (reformulées pour 10-25 mots)
  `Acquisition à ${acquisitions[0].ville} (${acquisitions[0].pays}, ${acquisitions[0].surface} m², ${acquisitions[0].montant}M€) : ${acquisitions[0].description}`,
  `Acquisition à ${acquisitions[1].ville} (${acquisitions[1].pays}, ${acquisitions[1].surface} m², ${acquisitions[1].montant}M€) : ${acquisitions[1].description}`,
  
  // Événements structurants
  "Renforcement dans le sillon alpin avec l'acquisition à Sainte-Hélène-du-Lac, confirmant le positionnement sur des métiers à forte expertise technique",
  "Stratégie d'Optimale : investir dans des actifs d'entreprise performants et bien localisés au cœur des grandes agglomérations régionales",
  
  // Indicateurs de performance
  "Volume total investi de presque 93 M€ depuis le lancement, témoignant de la croissance soutenue du portefeuille",
  "Taux de distribution T3 2025 de 1,62% brut (4,05€/part) et taux de distribution cumulé 2025 de 4,70% brut (11,75€/part)",
  "Performance Globale Annuelle (PGA) cible 2025 de 8% et taux de distribution cible entre 6,30% et 6,50%",
  
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

console.log(`\n✅ ${actualites.length} actualités trimestrielles mises à jour pour Optimale T3 2025\n`);

console.log('📊 Acquisitions reformulées:');
acquisitions.forEach((acq, i) => {
  const phrase = `Acquisition à ${acq.ville} (${acq.pays}, ${acq.surface} m², ${acq.montant}M€) : ${acq.description}`;
  const words = countWords(phrase);
  console.log(`   ${i + 1}. ${acq.ville} - ${words} mots`);
  console.log(`      ${phrase.substring(0, 100)}...`);
});

console.log('\n✅ Fichier JSON mis à jour!');
