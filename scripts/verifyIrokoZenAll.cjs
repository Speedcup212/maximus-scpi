const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const irokoEntries = data.filter(s => s['Nom SCPI'] === 'Iroko Zen');

console.log('Nombre d\'entrées Iroko Zen:', irokoEntries.length);

irokoEntries.forEach((iroko, index) => {
  console.log(`\n=== Entrée ${index + 1} ===`);
  console.log('Période bulletin:', iroko['Période bulletin trimestriel'] || 'Aucune (entrée principale)');
  
  if (iroko['Répartition Sectorielle JSON']) {
    console.log('\nRépartition Sectorielle:');
    const sect = iroko['Répartition Sectorielle JSON'];
    Object.entries(sect)
      .sort((a, b) => b[1] - a[1])
      .forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
    const totalSect = Object.values(sect).reduce((a, b) => a + b, 0);
    console.log(`Total: ${totalSect.toFixed(1)}%`);
  }
  
  if (iroko['Répartition Géographique JSON']) {
    console.log('\nRépartition Géographique:');
    const geo = iroko['Répartition Géographique JSON'];
    Object.entries(geo)
      .sort((a, b) => b[1] - a[1])
      .forEach(([k, v]) => console.log(`  ${k}: ${v}%`));
    const totalGeo = Object.values(geo).reduce((a, b) => a + b, 0);
    console.log(`Total: ${totalGeo.toFixed(1)}%`);
  }
});
