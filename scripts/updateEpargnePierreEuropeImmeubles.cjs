const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const epe = data.find(s => s['Nom SCPI'] === 'Épargne Pierre Europe');

if (!epe) {
  console.error('Épargne Pierre Europe non trouvée');
  process.exit(1);
}

console.log('Avant:', epe['Nombre d\'immeubles']);
epe['Nombre d\'immeubles'] = 25;
console.log('Après:', epe['Nombre d\'immeubles']);

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Fichier mis à jour');
