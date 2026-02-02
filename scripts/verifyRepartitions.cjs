const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/scpi_complet.json'), 'utf8'));
const te = data.find(s => s['Nom SCPI'] === 'Transitions Europe');

if (!te) {
  console.error('Transitions Europe non trouvée');
  process.exit(1);
}

const sect = te['Répartition Sectorielle JSON'];
const geo = te['Répartition Géographique JSON'];

console.log('Répartition Sectorielle:');
Object.entries(sect).forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const totalSect = Object.values(sect).reduce((a, b) => a + b, 0);
console.log(`Total: ${totalSect}%`);
console.log(totalSect === 100 ? '✅ Total correct' : '❌ Total incorrect');

console.log('\nRépartition Géographique:');
Object.entries(geo).forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const totalGeo = Object.values(geo).reduce((a, b) => a + b, 0);
console.log(`Total: ${totalGeo}%`);
console.log(totalGeo === 100 ? '✅ Total correct' : '❌ Total incorrect');
