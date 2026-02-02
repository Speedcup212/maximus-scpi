const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const coeur = data.find(s => s['Nom SCPI'] === 'Coeur de Région' && s['Période bulletin trimestriel'] === 'T3 2025');

if (!coeur) {
  console.error('Coeur de Région T3 2025 non trouvée');
  process.exit(1);
}

console.log('✅ Nombre d\'immeubles:', coeur['Nombre d\'immeubles']);
console.log('✅ Capitalisation:', coeur['Capitalisation (M€)'], 'M€');
console.log('✅ TOF:', coeur['TOF (%)'], '%');
console.log('✅ Nombre de locataires:', coeur['Nombre de locataires']);
console.log('✅ Période bulletin:', coeur['Période bulletin trimestriel']);

console.log('\nRépartition Sectorielle JSON:');
const sect = coeur['Répartition Sectorielle JSON'];
Object.entries(sect).forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const totalSect = Object.values(sect).reduce((a, b) => a + b, 0);
console.log(`Total: ${totalSect.toFixed(2)}%`);

console.log('\nRépartition Géographique JSON:');
const geo = coeur['Répartition Géographique JSON'];
Object.entries(geo).forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const totalGeo = Object.values(geo).reduce((a, b) => a + b, 0);
console.log(`Total: ${totalGeo.toFixed(2)}%`);
