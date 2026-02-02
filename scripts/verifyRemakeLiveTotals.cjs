const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const rl = data.find(s => s['Nom SCPI'] === 'Remake Live');

if (!rl) {
  console.error('Remake Live non trouvée');
  process.exit(1);
}

const sect = rl['Répartition Sectorielle JSON'];
const geo = rl['Répartition Géographique JSON'];

console.log('Nombre d\'immeubles:', rl['Nombre d\'immeubles']);
console.log('\nRépartition Sectorielle:');
Object.entries(sect).forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const totalSect = Object.values(sect).reduce((a, b) => a + b, 0);
console.log(`Total: ${totalSect.toFixed(2)}%`);

console.log('\nRépartition Géographique:');
Object.entries(geo).forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const totalGeo = Object.values(geo).reduce((a, b) => a + b, 0);
console.log(`Total: ${totalGeo.toFixed(2)}%`);

// Ajuster les arrondis si nécessaire
if (Math.abs(totalSect - 100) > 0.01) {
  console.log(`\n⚠️  Total sectoriel: ${totalSect}% (écart de ${(totalSect - 100).toFixed(2)}%)`);
}

if (Math.abs(totalGeo - 100) > 0.01) {
  console.log(`⚠️  Total géographique: ${totalGeo}% (écart de ${(totalGeo - 100).toFixed(2)}%)`);
}
