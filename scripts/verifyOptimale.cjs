const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const optimale = data.find(s => s['Nom SCPI'] === 'Optimale' && s['Période bulletin trimestriel'] === 'T3 2025');

if (!optimale) {
  console.error('Optimale T3 2025 non trouvée');
  process.exit(1);
}

console.log('✅ Nombre d\'immeubles:', optimale['Nombre d\'immeubles']);
console.log('✅ Capitalisation:', optimale['Capitalisation (M€)'], 'M€');
console.log('✅ TOF:', optimale['TOF (%)'], '%');
console.log('✅ Nombre de locataires:', optimale['Nombre de locataires']);
console.log('✅ Période bulletin:', optimale['Période bulletin trimestriel']);

console.log('\nRépartition Sectorielle JSON:');
const sect = optimale['Répartition Sectorielle JSON'];
Object.entries(sect).forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const totalSect = Object.values(sect).reduce((a, b) => a + b, 0);
console.log(`Total: ${totalSect.toFixed(2)}%`);
