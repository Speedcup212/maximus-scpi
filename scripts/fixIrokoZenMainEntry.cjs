const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver l'entrée principale (sans période bulletin)
const irokoMain = data.find(s => s['Nom SCPI'] === 'Iroko Zen' && !s['Période bulletin trimestriel']);

if (!irokoMain) {
  console.error('❌ Entrée principale Iroko Zen non trouvée');
  process.exit(1);
}

console.log('✅ Entrée principale trouvée');
console.log('  Nombre d\'immeubles avant:', irokoMain['Nombre d\'immeubles']);
console.log('  Surcote/décote avant:', irokoMain['Surcote/décote (%)']);
console.log('  Taux de distribution avant:', irokoMain['Taux de distribution (%)']);
console.log('  Distribution avant:', irokoMain['Distribution (€/part)']);

// Mettre à jour
irokoMain['Nombre d\'immeubles'] = 164;
irokoMain['Surcote/décote (%)'] = 0;
irokoMain['Taux de distribution (%)'] = 6.01;
irokoMain['Distribution (€/part)'] = 14.58;

console.log('\n✅ Mises à jour:');
console.log('  Nombre d\'immeubles après:', irokoMain['Nombre d\'immeubles']);
console.log('  Surcote/décote après:', irokoMain['Surcote/décote (%)']);
console.log('  Taux de distribution après:', irokoMain['Taux de distribution (%)']);
console.log('  Distribution après:', irokoMain['Distribution (€/part)']);

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('\n✅ Fichier mis à jour');
