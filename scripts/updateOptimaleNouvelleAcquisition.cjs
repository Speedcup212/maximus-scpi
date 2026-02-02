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

// Nouvelle acquisition détaillée
const nouvelleAcquisition = {
  ville: 'Sainte-Hélène-du-Lac',
  departement: '73',
  pays: 'France',
  montant: '1,09',
  surface: '660',
  type: 'activités',
  description: 'immeuble d\'activités et bureaux d\'études au Parc d\'Activités Alpespace, près de Chambéry, loué à Axians et Pyrite Ingénierie, sociétés spécialisées dans l\'aménagement de la montagne (activités)'
};

// Vérifier la longueur de la phrase
const phrase = `Acquisition à ${nouvelleAcquisition.ville} (${nouvelleAcquisition.pays}, ${nouvelleAcquisition.surface} m², ${nouvelleAcquisition.montant}M€) : ${nouvelleAcquisition.description}`;
let words = countWords(phrase);
console.log(`Acquisition: ${words} mots ${words > 25 ? '❌ TROP LONG' : words < 10 ? '❌ TROP COURT' : '✅ OK'}`);

// Si trop long, réduire
if (words > 25) {
  nouvelleAcquisition.description = 'immeuble d\'activités et bureaux au Parc Alpespace, près de Chambéry, loué à Axians et Pyrite Ingénierie, spécialisées dans l\'aménagement de la montagne (activités)';
  const phrase2 = `Acquisition à ${nouvelleAcquisition.ville} (${nouvelleAcquisition.pays}, ${nouvelleAcquisition.surface} m², ${nouvelleAcquisition.montant}M€) : ${nouvelleAcquisition.description}`;
  words = countWords(phrase2);
  console.log(`   Reformulé: ${words} mots`);
  
  if (words > 25) {
    nouvelleAcquisition.description = 'immeuble d\'activités et bureaux au Parc Alpespace, près de Chambéry, loué à Axians et Pyrite Ingénierie (activités)';
    const phrase3 = `Acquisition à ${nouvelleAcquisition.ville} (${nouvelleAcquisition.pays}, ${nouvelleAcquisition.surface} m², ${nouvelleAcquisition.montant}M€) : ${nouvelleAcquisition.description}`;
    words = countWords(phrase3);
    console.log(`   Reformulé 2: ${words} mots`);
  }
}

// Récupérer les actualités existantes
const actualitesExistantes = optimale['Actualités trimestrielles'] || '';
const actualitesArray = actualitesExistantes ? actualitesExistantes.split(' | ') : [];

// Filtrer pour retirer l'ancienne acquisition de Sainte-Hélène-du-Lac si elle existe
const actualitesFiltrees = actualitesArray.filter(actu => {
  const actuLower = actu.toLowerCase();
  return !actuLower.includes('sainte-hélène-du-lac') && 
         !actuLower.includes('sainte-helene-du-lac');
});

// Nouvelles actualités avec la nouvelle acquisition
const nouvellesActualites = [
  // Résumé général (si pas déjà présent)
  ...(actualitesFiltrees.some(a => a.toLowerCase().includes('deux nouvelles acquisitions')) 
    ? [] 
    : [`Deux nouvelles acquisitions représentant un montant total de 2,92 M€ au cours du trimestre`]),
  
  // Nouvelle acquisition détaillée
  `Acquisition à ${nouvelleAcquisition.ville} (${nouvelleAcquisition.pays}, ${nouvelleAcquisition.surface} m², ${nouvelleAcquisition.montant}M€) : ${nouvelleAcquisition.description}`
];

// Combiner : nouvelles actualités en premier, puis actualités existantes filtrées
const toutesActualites = [...nouvellesActualites, ...actualitesFiltrees];

// Mettre à jour les actualités trimestrielles
optimale['Actualités trimestrielles'] = toutesActualites.join(' | ');

// Sauvegarder
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\n✅ Nouvelle acquisition ajoutée pour Optimale\n`);

const phraseFinale = `Acquisition à ${nouvelleAcquisition.ville} (${nouvelleAcquisition.pays}, ${nouvelleAcquisition.surface} m², ${nouvelleAcquisition.montant}M€) : ${nouvelleAcquisition.description}`;
const wordsFinal = countWords(phraseFinale);
console.log(`📊 Acquisition ajoutée:`);
console.log(`   ${nouvelleAcquisition.ville} - ${wordsFinal} mots`);
console.log(`   ${phraseFinale.substring(0, 120)}...`);

console.log(`\n📝 Total actualités: ${toutesActualites.length} points`);
console.log('\n✅ Fichier JSON mis à jour!');
