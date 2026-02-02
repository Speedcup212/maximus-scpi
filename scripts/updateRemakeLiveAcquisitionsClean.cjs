const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver Remake Live
const remakeLiveIndex = data.findIndex(s => 
  s['Nom SCPI'] === 'Remake Live'
);

if (remakeLiveIndex === -1) {
  console.log('❌ Remake Live non trouvée');
  process.exit(1);
}

const remakeLive = data[remakeLiveIndex];
console.log(`✅ Remake Live trouvée: ${remakeLive['Nom SCPI']}\n`);

// Fonction pour compter les mots
const countWords = (text) => {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
};

// Deux acquisitions détaillées (formatées pour 25 mots max)
const acquisitions = [
  {
    ville: 'Lyon',
    pays: 'France',
    montant: '43',
    surface: '13 500',
    type: 'hôtels',
    description: 'hôtel 4 étoiles à l\'aéroport Lyon-Saint Exupéry, occupé à 100% par NH Hotel Group, rendement 7,2% (hôtels)'
  },
  {
    ville: 'Dublin',
    pays: 'Irlande',
    montant: '30',
    surface: '4 184',
    type: 'bureaux',
    description: 'immeuble de bureaux à Ballsbridge, occupé à 100% par 4 locataires, rendement 7,8% (bureaux)'
  }
];

// Vérifier et ajuster la longueur des phrases
acquisitions.forEach((acq, i) => {
  let phrase = `Acquisition à ${acq.ville} (${acq.pays}, ${acq.surface} m², ${acq.montant}M€) : ${acq.description}`;
  let words = countWords(phrase);
  
  // Si trop long, réduire la description
  if (words > 25 && acq.ville === 'Lyon') {
    // Réduire d'un mot : simplifier "Lyon-Saint Exupéry" ou retirer un mot
    acq.description = 'hôtel 4 étoiles à l\'aéroport Lyon-Saint Exupéry, occupé à 100% par NH Hotel Group, rendement 7,2% (hôtels)';
    // Encore trop long, simplifier davantage
    phrase = `Acquisition à ${acq.ville} (${acq.pays}, ${acq.surface} m², ${acq.montant}M€) : ${acq.description}`;
    words = countWords(phrase);
    if (words > 25) {
      // Retirer "à l'aéroport" et simplifier
      acq.description = 'hôtel 4 étoiles Lyon-Saint Exupéry, occupé à 100% par NH Hotel Group, rendement 7,2% (hôtels)';
    }
  }
  
  phrase = `Acquisition à ${acq.ville} (${acq.pays}, ${acq.surface} m², ${acq.montant}M€) : ${acq.description}`;
  words = countWords(phrase);
  console.log(`Acquisition ${i + 1}: ${words} mots ${words > 25 ? '❌ TROP LONG' : words < 10 ? '❌ TROP COURT' : '✅ OK'}`);
});

// Calculer le total
const totalAcquisitions = acquisitions.reduce((sum, acq) => {
  const montant = parseFloat(acq.montant);
  return sum + (isNaN(montant) ? 0 : montant);
}, 0);

// Nettoyer les actualités existantes : retirer toutes les anciennes acquisitions de Lyon et Dublin
const actualitesExistantes = remakeLive['Actualités trimestrielles'] || '';
const actualitesArray = actualitesExistantes ? actualitesExistantes.split(' | ') : [];

// Filtrer pour retirer :
// - Les anciennes acquisitions de Lyon et Dublin
// - Les résumés "Deux nouvelles acquisitions" en doublon
const actualitesFiltrees = actualitesArray.filter(actu => {
  const actuLower = actu.toLowerCase();
  return !actuLower.includes('lyon-saint exupéry') && 
         !actuLower.includes('aéroport lyon') &&
         !actuLower.includes('shelbourne') &&
         !actuLower.includes('ballsbridge, dublin') &&
         !actuLower.includes('acquisition à lyon') &&
         !actuLower.includes('acquisition à dublin') &&
         !(actuLower.includes('deux nouvelles acquisitions') && actuLower.includes('73 m€'));
});

// Nouvelles actualités avec les deux acquisitions (format propre)
const nouvellesActualites = [
  // Résumé général
  `Deux nouvelles acquisitions représentant un montant total de ${totalAcquisitions} M€`,
  
  // Acquisitions détaillées
  `Acquisition à ${acquisitions[0].ville} (${acquisitions[0].pays}, ${acquisitions[0].surface} m², ${acquisitions[0].montant}M€) : ${acquisitions[0].description}`,
  `Acquisition à ${acquisitions[1].ville} (${acquisitions[1].pays}, ${acquisitions[1].surface} m², ${acquisitions[1].montant}M€) : ${acquisitions[1].description}`
];

// Combiner : nouvelles acquisitions en premier, puis actualités existantes filtrées
const toutesActualites = [...nouvellesActualites, ...actualitesFiltrees];

// Mettre à jour les actualités trimestrielles
remakeLive['Actualités trimestrielles'] = toutesActualites.join(' | ');

// Sauvegarder
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\n✅ ${nouvellesActualites.length} nouvelles actualités ajoutées pour Remake Live\n`);

console.log('📊 Acquisitions ajoutées:');
acquisitions.forEach((acq, i) => {
  const phrase = `Acquisition à ${acq.ville} (${acq.pays}, ${acq.surface} m², ${acq.montant}M€) : ${acq.description}`;
  const words = countWords(phrase);
  console.log(`   ${i + 1}. ${acq.ville} - ${words} mots`);
  console.log(`      ${phrase.substring(0, 100)}...`);
});

console.log(`\n💰 Volume total: ${totalAcquisitions} M€`);
console.log(`\n📝 Total actualités: ${toutesActualites.length} points`);
console.log('\n✅ Fichier JSON mis à jour et nettoyé!');
