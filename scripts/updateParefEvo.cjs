const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver toutes les entrées pour Paref Evo
const parefEvoIndices = [];
data.forEach((entry, index) => {
  if (entry['Nom SCPI'] === 'Paref Evo') {
    parefEvoIndices.push(index);
  }
});

console.log(`📊 Nombre d'entrées trouvées pour "Paref Evo": ${parefEvoIndices.length}\n`);

if (parefEvoIndices.length === 0) {
  console.log('❌ Paref Evo non trouvée');
  process.exit(1);
}

// Mettre à jour chaque entrée
parefEvoIndices.forEach((index, i) => {
  const entry = data[index];
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Mise à jour de l'entrée ${i + 1} (index ${index})`);
  console.log(`${'='.repeat(80)}`);
  
  // Mettre à jour les valeurs
  entry['Valeur de reconstitution (€)'] = 248;
  entry['Surcote/décote (%)'] = 0.8;
  
  // Ajouter les actualités trimestrielles si elles n'existent pas
  if (!entry['Actualités trimestrielles']) {
    entry['Actualités trimestrielles'] = "Aucune acquisition réalisée au cours du trimestre | Aucune cession d'actif réalisée au cours du trimestre | Prolongations et renouvellements de baux sur l'actif de Racławicka (Varsovie), sécurisant les loyers sur plusieurs années | 553 m² reloués en 2025, contribuant au maintien d'un TOF élevé";
  }
  
  // Ajouter la période bulletin si elle n'existe pas
  if (!entry['Période bulletin trimestriel']) {
    entry['Période bulletin trimestriel'] = "T3 2025";
  }
  
  // Ajouter les champs trimestriels si nécessaire
  if (entry['Nombre de cessions trimestre'] === undefined) {
    entry['Nombre de cessions trimestre'] = 0;
  }
  
  console.log(`✅ Valeur de reconstitution: ${entry['Valeur de reconstitution (€)']}€`);
  console.log(`✅ Surcote/décote: ${entry['Surcote/décote (%)']}%`);
  console.log(`✅ Période bulletin: ${entry['Période bulletin trimestriel']}`);
  console.log(`✅ Actualités: ${entry['Actualités trimestrielles'] ? 'Présentes' : 'Absentes'}`);
});

// Sauvegarder
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\n${'='.repeat(80)}`);
console.log('✅ Fichier JSON mis à jour !');
console.log(`${'='.repeat(80)}`);
