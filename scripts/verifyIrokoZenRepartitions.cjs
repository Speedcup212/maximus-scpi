const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const iroko = data.find(s => s['Nom SCPI'] === 'Iroko Zen' && !s['Période bulletin trimestriel']);

if (!iroko) {
  console.error('Iroko Zen (entrée principale) non trouvée');
  process.exit(1);
}

console.log('✅ Répartition Sectorielle:');
const sect = iroko['Répartition Sectorielle JSON'];
Object.entries(sect)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const totalSect = Object.values(sect).reduce((a, b) => a + b, 0);
console.log(`Total: ${totalSect.toFixed(1)}%`);

console.log('\n✅ Répartition Géographique:');
const geo = iroko['Répartition Géographique JSON'];
Object.entries(geo)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const totalGeo = Object.values(geo).reduce((a, b) => a + b, 0);
console.log(`Total: ${totalGeo.toFixed(1)}%`);
