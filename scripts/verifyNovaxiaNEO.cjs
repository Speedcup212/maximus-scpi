const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const novaxia = data.find(s => s['Nom SCPI'] === 'Novaxia NEO' && s['Période bulletin trimestriel'] === 'T3 2025');

if (!novaxia) {
  console.error('Novaxia NEO T3 2025 non trouvée');
  process.exit(1);
}

console.log('✅ Nombre d\'immeubles:', novaxia['Nombre d\'immeubles']);
console.log('✅ Capitalisation:', novaxia['Capitalisation (M€)'], 'M€');
console.log('✅ TOF:', novaxia['TOF (%)'], '%');
console.log('✅ Nombre de locataires:', novaxia['Nombre de locataires']);
console.log('✅ WALB:', novaxia['WALB'], 'ans');
console.log('✅ Période bulletin:', novaxia['Période bulletin trimestriel']);

console.log('\nRépartition Sectorielle JSON:');
const sect = novaxia['Répartition Sectorielle JSON'];
Object.entries(sect).forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const totalSect = Object.values(sect).reduce((a, b) => a + b, 0);
console.log(`Total: ${totalSect.toFixed(2)}%`);
