const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const perial = data.find(s => s['Nom SCPI'] === 'Perial Opportunités Europe' && s['Période bulletin trimestriel'] === 'T3 2025');

if (!perial) {
  console.error('Perial Opportunités Europe T3 2025 non trouvée');
  process.exit(1);
}

console.log('✅ Nombre d\'immeubles:', perial['Nombre d\'immeubles']);
console.log('✅ Capitalisation:', perial['Capitalisation (M€)'], 'M€');
console.log('✅ TOF:', perial['TOF (%)'], '%');
console.log('✅ WALB:', perial['WALB'], 'ans');
console.log('✅ Période bulletin:', perial['Période bulletin trimestriel']);

console.log('\nRépartition Sectorielle JSON:');
const sect = perial['Répartition Sectorielle JSON'];
Object.entries(sect).forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const totalSect = Object.values(sect).reduce((a, b) => a + b, 0);
console.log(`Total: ${totalSect.toFixed(2)}%`);

console.log('\nRépartition Géographique JSON:');
const geo = perial['Répartition Géographique JSON'];
Object.entries(geo).forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const totalGeo = Object.values(geo).reduce((a, b) => a + b, 0);
console.log(`Total: ${totalGeo.toFixed(2)}%`);
