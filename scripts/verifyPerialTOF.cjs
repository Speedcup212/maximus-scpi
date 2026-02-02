const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const perial = data.find(s => s['Nom SCPI'] === 'Perial Opportunités Europe' && s['Période bulletin trimestriel'] === 'T3 2025');

if (!perial) {
  console.error('Perial Opportunités Europe T3 2025 non trouvée');
  process.exit(1);
}

console.log('✅ TOF:', perial['TOF (%)'], '%');
console.log('✅ Période bulletin:', perial['Période bulletin trimestriel']);
