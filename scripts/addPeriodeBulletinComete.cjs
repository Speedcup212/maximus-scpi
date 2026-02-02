/**
 * Ajoute la période du dernier bulletin trimestriel pour Comète
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
  
  // Période du dernier bulletin trimestriel
  comete['Période bulletin trimestriel'] = 'T3 2025';
  
  // Sauvegarder
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  
  console.log('✅ Période du bulletin trimestriel ajoutée: T3 2025');
} else {
  console.log('❌ Comète non trouvée');
  process.exit(1);
}
