const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver toutes les entrées pour Coeur de Région
const coeurEntries = data.filter(s => s['Nom SCPI'] === 'Coeur de Région');

console.log('Nombre d\'entrées trouvées:', coeurEntries.length);

coeurEntries.forEach((coeur, index) => {
  console.log(`\nEntrée ${index + 1}:`);
  console.log('  Nombre d\'immeubles avant:', coeur['Nombre d\'immeubles']);
  coeur['Nombre d\'immeubles'] = 82;
  console.log('  Nombre d\'immeubles après:', coeur['Nombre d\'immeubles']);
  console.log('  Période bulletin:', coeur['Période bulletin trimestriel']);
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('\n✅ Fichier mis à jour');
