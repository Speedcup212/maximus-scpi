const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver toutes les entrées pour Novaxia NEO
const novaxiaEntries = data.filter(s => s['Nom SCPI'] === 'Novaxia NEO');

console.log('Nombre d\'entrées trouvées:', novaxiaEntries.length);

novaxiaEntries.forEach((novaxia, index) => {
  console.log(`\nEntrée ${index + 1}:`);
  console.log('  Nombre d\'immeubles avant:', novaxia['Nombre d\'immeubles']);
  console.log('  Période bulletin:', novaxia['Période bulletin trimestriel']);
  
  // Mettre à jour toutes les entrées à 39
  novaxia['Nombre d\'immeubles'] = 39;
  console.log('  Nombre d\'immeubles après:', novaxia['Nombre d\'immeubles']);
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('\n✅ Fichier mis à jour');
