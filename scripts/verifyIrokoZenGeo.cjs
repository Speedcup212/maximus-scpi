const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const iroko = data.find(s => s['Nom SCPI'] === 'Iroko Zen');

if (!iroko) {
  console.error('Iroko Zen non trouvée');
  process.exit(1);
}

console.log('✅ Répartition géographique mise à jour:');
console.log('  Texte:', iroko['Répartition Géographique']);
console.log('\n  JSON:');
const geo = iroko['Répartition Géographique JSON'];
Object.entries(geo)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`    ${k}: ${v}%`));
const total = Object.values(geo).reduce((a, b) => a + b, 0);
console.log(`\n  Total: ${total.toFixed(1)}%`);
