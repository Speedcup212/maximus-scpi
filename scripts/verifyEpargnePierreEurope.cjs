const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const epe = data.find(s => s['Nom SCPI'] === 'Épargne Pierre Europe');

if (!epe) {
  console.error('Épargne Pierre Europe non trouvée');
  process.exit(1);
}

console.log('Nombre d\'immeubles:', epe['Nombre d\'immeubles']);
console.log('\nRépartition Sectorielle JSON:');
const sect = epe['Répartition Sectorielle JSON'];
Object.entries(sect).forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const totalSect = Object.values(sect).reduce((a, b) => a + b, 0);
console.log(`Total: ${totalSect.toFixed(2)}%`);

console.log('\nRépartition Géographique JSON:');
const geo = epe['Répartition Géographique JSON'];
Object.entries(geo).forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const totalGeo = Object.values(geo).reduce((a, b) => a + b, 0);
console.log(`Total: ${totalGeo.toFixed(2)}%`);

console.log('\nDonnées trimestrielles:');
console.log('  Période:', epe['Période bulletin trimestriel']);
console.log('  Collecte nette:', epe['Collecte nette trimestre']);
console.log('  Nombre de cessions:', epe['Nombre de cessions trimestre']);
console.log('  WALT:', epe['WALT']);
console.log('  WALB:', epe['WALB']);
