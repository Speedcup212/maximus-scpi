const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const epe = data.find(s => s['Nom SCPI'] === 'Épargne Pierre Europe');

if (!epe) {
  console.error('Épargne Pierre Europe non trouvée');
  process.exit(1);
}

console.log('✅ Nombre d\'immeubles:', epe['Nombre d\'immeubles']);
console.log('✅ Date de mise à jour:', epe['Date de mise à jour']);
