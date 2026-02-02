const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const irokoEntries = data.filter(s => s['Nom SCPI'] === 'Iroko Zen');

console.log('Nombre d\'entrées Iroko Zen:', irokoEntries.length);

irokoEntries.forEach((iroko, index) => {
  console.log(`\n=== Entrée ${index + 1} ===`);
  console.log('Période bulletin:', iroko['Période bulletin trimestriel'] || 'Aucune (entrée principale)');
  console.log('Taux de distribution (%):', iroko['Taux de distribution (%)']);
  console.log('Distribution (€/part):', iroko['Distribution (€/part)']);
});
