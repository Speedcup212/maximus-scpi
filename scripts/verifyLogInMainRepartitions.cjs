const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver l'entrée principale (sans période bulletin)
const logInMain = data.find(s => s['Nom SCPI'] === 'Log In' && !s['Période bulletin trimestriel']);

if (!logInMain) {
  console.error('❌ Entrée principale LOG-IN non trouvée');
  process.exit(1);
}

console.log('✅ Entrée principale LOG-IN trouvée\n');

if (logInMain['Répartition Sectorielle JSON']) {
  console.log('📊 Répartition Sectorielle:');
  Object.entries(logInMain['Répartition Sectorielle JSON'])
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
  const totalSect = Object.values(logInMain['Répartition Sectorielle JSON']).reduce((a, b) => a + b, 0);
  console.log(`  Total: ${totalSect}%`);
}

if (logInMain['Répartition Géographique JSON']) {
  console.log('\n🌍 Répartition Géographique:');
  Object.entries(logInMain['Répartition Géographique JSON'])
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
  const totalGeo = Object.values(logInMain['Répartition Géographique JSON']).reduce((a, b) => a + b, 0);
  console.log(`  Total: ${totalGeo.toFixed(1)}%`);
}
