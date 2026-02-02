/**
 * Mise à jour des répartitions sectorielles et géographiques de Comète
 * depuis le bulletin trimestriel T3 2025 (page 5)
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');

// Lire le fichier JSON
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver Comète (index 11)
const comete = data[11];

if (comete && comete['Nom SCPI'] && comete['Nom SCPI'].includes('Com')) {
  console.log(`✅ Comète trouvée: ${comete['Nom SCPI']}\n`);
  
  // Nouvelles répartitions sectorielles depuis le bulletin T3 2025
  const nouveauxSecteurs = {
    "Commerce": 26,
    "Bureau": 21,
    "Mixte": 17,
    "Hôtellerie": 14,
    "Logistique": 10,
    "Loisir": 9,
    "Éducation": 3
  };
  
  // Nouvelles répartitions géographiques depuis le bulletin T3 2025
  const nouvelleGeographie = {
    "Royaume-Uni": 43,
    "Espagne": 23,
    "Pays-Bas": 16,
    "Italie": 12,
    "Irlande": 6,
    "Belgique": 3
  };
  
  // Anciennes valeurs
  const anciensSecteurs = JSON.stringify(comete['Répartition Sectorielle JSON'] || {});
  const ancienneGeographie = JSON.stringify(comete['Répartition Géographique JSON'] || {});
  
  // Mettre à jour les répartitions JSON
  comete['Répartition Sectorielle JSON'] = nouveauxSecteurs;
  comete['Répartition Géographique JSON'] = nouvelleGeographie;
  
  // Mettre à jour les répartitions en format texte (pour compatibilité)
  const secteursTexte = Object.entries(nouveauxSecteurs)
    .sort((a, b) => b[1] - a[1]) // Trier par pourcentage décroissant
    .map(([secteur, pct]) => `${secteur} (${pct}%)`)
    .join(', ');
  
  const geographieTexte = Object.entries(nouvelleGeographie)
    .sort((a, b) => b[1] - a[1]) // Trier par pourcentage décroissant
    .map(([pays, pct]) => `${pays} (${pct}%)`)
    .join(', ');
  
  comete['Répartition Sectorielle'] = secteursTexte;
  comete['Répartition Géographique'] = geographieTexte;
  
  // Sauvegarder
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  
  console.log('✅ Répartitions mises à jour depuis le bulletin T3 2025:\n');
  console.log('📊 Répartition Sectorielle:');
  Object.entries(nouveauxSecteurs)
    .sort((a, b) => b[1] - a[1])
    .forEach(([secteur, pct]) => {
      console.log(`   - ${secteur}: ${pct}%`);
    });
  
  console.log('\n🌍 Répartition Géographique:');
  Object.entries(nouvelleGeographie)
    .sort((a, b) => b[1] - a[1])
    .forEach(([pays, pct]) => {
      console.log(`   - ${pays}: ${pct}%`);
    });
  
  console.log('\n✅ Fichier JSON mis à jour!');
} else {
  console.log('❌ Comète non trouvée');
  process.exit(1);
}
