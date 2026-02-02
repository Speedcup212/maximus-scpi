const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const coeur = data.find(s => s['Nom SCPI'] === 'Coeur d\'Europe' && s['Période bulletin trimestriel'] === 'T3 2025');

if (!coeur) {
  console.error('Coeur d\'Europe T3 2025 non trouvée');
  process.exit(1);
}

console.log('Répartition Géographique JSON corrigée:');
const geo = coeur['Répartition Géographique JSON'];
Object.entries(geo).forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
const totalGeo = Object.values(geo).reduce((a, b) => a + b, 0);
console.log(`Total: ${totalGeo.toFixed(2)}%`);

console.log('\nRépartition Géographique (texte):');
console.log(coeur['Répartition Géographique']);
