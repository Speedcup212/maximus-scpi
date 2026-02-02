const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const logInEntries = data.filter(s => s['Nom SCPI'] === 'Log In');

console.log(`✅ Nombre d'entrées LOG-IN: ${logInEntries.length}\n`);

logInEntries.forEach((entry, idx) => {
  const periode = entry['Période bulletin trimestriel'] || 'principale';
  console.log(`=== Entrée ${idx + 1} (${periode}) ===`);
  
  if (entry['Répartition Sectorielle JSON']) {
    console.log('\n📊 Répartition Sectorielle:');
    Object.entries(entry['Répartition Sectorielle JSON'])
      .sort((a, b) => b[1] - a[1])
      .forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
    const totalSect = Object.values(entry['Répartition Sectorielle JSON']).reduce((a, b) => a + b, 0);
    console.log(`  Total: ${totalSect}%`);
  }
  
  if (entry['Répartition Géographique JSON']) {
    console.log('\n🌍 Répartition Géographique:');
    Object.entries(entry['Répartition Géographique JSON'])
      .sort((a, b) => b[1] - a[1])
      .forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
    const totalGeo = Object.values(entry['Répartition Géographique JSON']).reduce((a, b) => a + b, 0);
    console.log(`  Total: ${totalGeo.toFixed(1)}%`);
  }
  
  console.log('\n');
});
