const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver toutes les entrées pour Iroko Zen
const irokoEntries = data.filter(s => s['Nom SCPI'] === 'Iroko Zen');

console.log('Nombre d\'entrées trouvées:', irokoEntries.length);

irokoEntries.forEach((iroko, index) => {
  console.log(`\nEntrée ${index + 1}:`);
  console.log('  Nombre d\'immeubles avant:', iroko['Nombre d\'immeubles']);
  console.log('  Période bulletin:', iroko['Période bulletin trimestriel']);
  
  // Mettre à jour toutes les entrées à 164
  iroko['Nombre d\'immeubles'] = 164;
  console.log('  Nombre d\'immeubles après:', iroko['Nombre d\'immeubles']);
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('\n✅ Fichier mis à jour');
